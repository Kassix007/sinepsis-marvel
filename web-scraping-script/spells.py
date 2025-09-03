# collect_strange_spells_pg.py  (Gemini-embeddings edition)
import os
import re
import json
import time
import math
import datetime as dt
from typing import Dict, List, Optional, Tuple
from psycopg.types.json import Json
import httpx
import psycopg
from psycopg.rows import dict_row
from bs4 import BeautifulSoup
import os
print("GOOGLE_API_KEY visible?", bool(os.getenv("GOOGLE_API_KEY")))
# -----------------------------
# Config
# -----------------------------
WIKI_BASE = "https://marvel.fandom.com"
API = f"{WIKI_BASE}/api.php"
CATEGORY = "Category:Magic_Spells"
UA = "DrStrangeSpellsCollector/3.0 (contact: your-email@example.com)"

REQUEST_DELAY_S = 0.5  # MediaWiki politeness
RETRY_MAX = 4
RETRY_BASE_DELAY = 0.6

# Embeddings: Gemini only (REST)
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL") or "text-embedding-004"
GEMINI_EMBED_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_EMBED_MODEL}:embedContent?key={GEMINI_API_KEY}"

# pgvector default dimension for text-embedding-004 is 768 (we’ll auto-adjust if different)
DEFAULT_EMBED_DIM = 768

# -----------------------------
# DB: schema + upsert
# -----------------------------
def ddl_with_vector(dim: int) -> str:
    return f"""
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS spells (
    pageid                  INTEGER PRIMARY KEY,
    title                   TEXT NOT NULL,
    url                     TEXT NOT NULL,
    summary                 TEXT,
    used_by_doctor_strange  BOOLEAN NOT NULL DEFAULT FALSE,
    last_fetched_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- richer fields
    page_rev_id             BIGINT,
    last_rev_ts             TIMESTAMPTZ,
    image_url               TEXT,
    categories              TEXT[] DEFAULT '{{}}',
    realities               TEXT[] DEFAULT '{{}}',
    first_appearance        TEXT,
    aliases                 TEXT[] DEFAULT '{{}}',
    infobox                 JSONB,
    sections                JSONB,
    outlinks                JSONB,

    -- semantic search
    embedding               VECTOR({dim})
);

-- ANN index (idempotent)
CREATE INDEX IF NOT EXISTS spells_embedding_idx
    ON spells USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
"""

UPSERT = """
INSERT INTO spells (
    pageid, title, url, summary, used_by_doctor_strange, last_fetched_at,
    page_rev_id, last_rev_ts, image_url, categories, realities,
    first_appearance, aliases, infobox, sections, outlinks, embedding
) VALUES (
    %(pageid)s, %(title)s, %(url)s, %(summary)s, %(used)s, %(fetched)s,
    %(page_rev_id)s, %(last_rev_ts)s, %(image_url)s, %(categories)s, %(realities)s,
    %(first_appearance)s, %(aliases)s, %(infobox)s, %(sections)s, %(outlinks)s, %(embedding)s
)
ON CONFLICT (pageid) DO UPDATE SET
    title = EXCLUDED.title,
    url = EXCLUDED.url,
    summary = EXCLUDED.summary,
    used_by_doctor_strange = EXCLUDED.used_by_doctor_strange,
    last_fetched_at = EXCLUDED.last_fetched_at,
    page_rev_id = EXCLUDED.page_rev_id,
    last_rev_ts = EXCLUDED.last_rev_ts,
    image_url = EXCLUDED.image_url,
    categories = EXCLUDED.categories,
    realities = EXCLUDED.realities,
    first_appearance = EXCLUDED.first_appearance,
    aliases = EXCLUDED.aliases,
    infobox = EXCLUDED.infobox,
    sections = EXCLUDED.sections,
    outlinks = EXCLUDED.outlinks,
    embedding = EXCLUDED.embedding;
"""

# -----------------------------
# DB helpers
# -----------------------------
def get_conn():
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise RuntimeError("Set DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DBNAME")
    return psycopg.connect(dsn, row_factory=dict_row)

def ensure_schema(embed_dim: int):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(ddl_with_vector(embed_dim))
        conn.commit()

# -----------------------------
# MediaWiki API helpers (with retry)
# -----------------------------
def get_json_with_retry(client: httpx.Client, url: str, params=None, max_attempts=RETRY_MAX, base_delay=RETRY_BASE_DELAY):
    for i in range(max_attempts):
        try:
            r = client.get(url, params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception:
            if i == max_attempts - 1:
                raise
            time.sleep(base_delay * (2 ** i))

def get_category_members(client: httpx.Client, category_title: str) -> List[Dict]:
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": category_title,
        "cmlimit": "max",
        "format": "json",
    }
    members = []
    while True:
        data = get_json_with_retry(client, API, params=params)
        members.extend(data["query"]["categorymembers"])
        if "continue" not in data:
            break
        params.update(data["continue"])
        time.sleep(REQUEST_DELAY_S)
    return members

def parse_page(client: httpx.Client, pageid: int) -> Dict:
    params = {"action": "parse", "pageid": str(pageid), "prop": "text|wikitext|links", "format": "json"}
    data = get_json_with_retry(client, API, params=params)
    data = data["parse"]
    return {
        "title": data["title"],
        "html": data["text"]["*"],
        "wikitext": data.get("wikitext", {}).get("*", ""),
        "parse_json": data,
    }

def query_page_meta(client: httpx.Client, pageid: int) -> Dict:
    params = {
        "action": "query",
        "pageids": str(pageid),
        "prop": "pageimages|categories|info|revisions",
        "piprop": "original",
        "cllimit": "max",
        "rvprop": "ids|timestamp",
        "format": "json",
    }
    data = get_json_with_retry(client, API, params=params)
    page = data["query"]["pages"][str(pageid)]
    image_url = page.get("original", {}).get("source")
    categories = [c["title"].replace("Category:", "") for c in page.get("categories", [])]
    rev = (page.get("revisions") or [{}])[0]
    return {
        "image_url": image_url,
        "categories": categories,
        "page_rev_id": rev.get("revid"),
        "last_rev_ts": rev.get("timestamp"),
    }

# -----------------------------
# Extraction logic
# -----------------------------
DOCTOR_STRANGE_PAT = re.compile(r"\bDoctor Strange\b|\bStephen Strange\b", re.IGNORECASE)
REALITY_PAT = re.compile(r"\bEarth-(?:\d{3,}|616|199999)\b")
ALIASES_PAT = re.compile(r"^\s*\|\s*aliases\s*=\s*(.+)$", re.IGNORECASE | re.MULTILINE)
FIRST_APP_PAT = re.compile(r"^\s*\|\s*first\s*appearance\s*=\s*(.+)$", re.IGNORECASE | re.MULTILINE)

def first_paragraph_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    p = soup.select_one(".mw-parser-output > p") or soup.find("p")
    if not p:
        return ""
    text = re.sub(r"\[\d+\]", "", p.get_text(" ", strip=True))
    return text

def used_by_doctor_strange(html: str, wikitext: str) -> bool:
    blob = (wikitext or "") + "\n" + (html or "")
    if DOCTOR_STRANGE_PAT.search(blob):
        return True
    if 'href="/wiki/Doctor_Strange' in html or 'href="/wiki/Stephen_Strange' in html:
        return True
    return False

def parse_infobox_and_sections(wikitext: str, html: str) -> Dict:
    m = re.search(r"\{\{Infobox[^}]*\}\}", wikitext, re.DOTALL | re.IGNORECASE)
    infobox_raw: Optional[str] = m.group(0) if m else None

    aliases: List[str] = []
    m2 = ALIASES_PAT.search(wikitext)
    if m2:
        aliases = [a.strip() for a in re.split(r",|<br\s*/?>|\n", m2.group(1)) if a.strip()]

    first_app: Optional[str] = None
    m3 = FIRST_APP_PAT.search(wikitext)
    if m3:
        first_app = re.sub(r"\s*\{\{.*?\}\}\s*", "", m3.group(1)).strip()

    realities = sorted(set(REALITY_PAT.findall(wikitext + "\n" + html)))

    soup = BeautifulSoup(html, "html.parser")
    sections = []
    for h in soup.select(".mw-parser-output > h2"):
        title = (h.get_text(" ", strip=True) or "").replace("[edit]", "").strip()
        texts = []
        node = h.next_sibling
        while node and not (getattr(node, "name", "") == "h2"):
            if getattr(node, "name", "") in ("p", "ul", "ol", "table"):
                texts.append(node.get_text(" ", strip=True))
            node = node.next_sibling
        sec_text = " ".join(t for t in texts if t)
        if title:
            sections.append({"title": title, "text": sec_text[:2000]})
    return {
        "infobox": infobox_raw,
        "aliases": aliases,
        "first_appearance": first_app,
        "realities": realities,
        "sections": sections,
    }

def extract_outlinks(parse_json: Dict) -> List[Dict]:
    links = parse_json.get("links", []) or []
    out = []
    for l in links:
        title = l.get("*")
        if title and ":" not in title:
            out.append({"title": title, "url": f'{WIKI_BASE}/wiki/{title.replace(" ", "_")}'})
    return out

def build_embed_text(summary: str, sections: List[Dict]) -> str:
    parts = []
    if summary:
        parts.append(f"Summary: {summary}")
    for s in sections[:6]:
        t = s.get("title", "")
        x = s.get("text", "")
        if t and x:
            parts.append(f"{t}: {x}")
    out = "\n\n".join(parts)
    # Limit to be safe with request size (Gemini can handle large, but keep modest)
    return out[:7000]

# -----------------------------
# Embedding (Gemini REST)
# -----------------------------
def embed_gemini_rest(client: httpx.Client, text: str) -> List[float]:
    if not GEMINI_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY not set")
    # REST request shape documented by Gemini API: text-embedding-004
    payload = {
        "model": GEMINI_EMBED_MODEL,
        "content": {"parts": [{"text": text or ""}]},
    }
    r = client.post(GEMINI_EMBED_URL, json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    emb = ((data.get("embedding") or {}).get("value")) or ((data.get("embedding") or {}).get("values"))
    # Newer responses use "values", older docs mention "value"
    if not isinstance(emb, list) or len(emb) == 0:
        raise RuntimeError("Gemini returned empty embedding")
    # values are floats (often float32), cast to native Python float
    return [float(v) for v in emb]

def to_vector_literal(vec: List[float]) -> str:
    return "[" + ",".join(trim_float(x) for x in vec) + "]"

def trim_float(f: float) -> str:
    s = f"{f:.6f}"
    s = s.rstrip("0").rstrip(".")
    if s in ("", "-0") or math.isnan(f) or math.isinf(f):
        return "0"
    return s

def get_embedding(client: httpx.Client, text: str) -> Tuple[List[float], int]:
    text = (text or "").strip()
    if not text:
        raise RuntimeError("empty text for embedding")
    vec = embed_gemini_rest(client, text)
    return vec, len(vec)

# -----------------------------
# Main
# -----------------------------
def main():
    # Start with default dimension; we’ll alter if Gemini returns a different size
    EMBED_DIM = DEFAULT_EMBED_DIM
    ensure_schema(EMBED_DIM)

    headers = {"User-Agent": UA}
    wiki = httpx.Client(headers=headers, timeout=30)
    emb_client = httpx.Client(timeout=90)

    print(f"[*] Fetching category members from {CATEGORY}…")
    members = get_category_members(wiki, CATEGORY)
    print(f"[*] Found {len(members)} pages under {CATEGORY}")

    processed = 0

    with get_conn() as conn, conn.cursor() as cur:
        for m in members:
            pid = m["pageid"]
            try:
                page = parse_page(wiki, pid)
                meta = query_page_meta(wiki, pid)

                summary = first_paragraph_from_html(page["html"])
                used = used_by_doctor_strange(page["html"], page["wikitext"])
                rich = parse_infobox_and_sections(page["wikitext"], page["html"])
                outlinks = extract_outlinks(page["parse_json"])

                # --- Embedding (safe) ---
                embed_text = build_embed_text(summary, rich["sections"])
                vec_literal = None
                actual_dim = EMBED_DIM  # define upfront to avoid UnboundLocalError

                try:
                    vec, actual_dim = get_embedding(emb_client, embed_text)
                    if vec and isinstance(vec, (list, tuple)) and len(vec) > 0:
                        vec_literal = to_vector_literal(vec)
                    else:
                        raise RuntimeError("empty embedding returned")
                except Exception as ee:
                    print(f"[EMBED WARN] pageid={pid} ({page['title']}): {ee}")
                    # leave vec_literal=None -> store NULL and continue

                # If we actually got a vector and dims differ, adjust schema once
                if vec_literal is not None and actual_dim != EMBED_DIM:
                    print(f"[!] Embedding dimension changed {EMBED_DIM} -> {actual_dim}, altering schema…")
                    with get_conn() as conn2, conn2.cursor() as cur2:
                        cur2.execute("ALTER TABLE spells ALTER COLUMN embedding TYPE VECTOR(%s);", (actual_dim,))
                        conn2.commit()
                    EMBED_DIM = actual_dim  # keep local in sync

                payload = {
                    "pageid": pid,
                    "title": page["title"],
                    "url": f'{WIKI_BASE}/wiki/{page["title"].replace(" ", "_")}',
                    "summary": summary,
                    "used": used,
                    "fetched": dt.datetime.now(dt.timezone.utc),

                    "page_rev_id": meta["page_rev_id"],
                    "last_rev_ts": meta["last_rev_ts"],
                    "image_url": meta["image_url"],
                    "categories": meta["categories"],
                    "realities": rich["realities"],
                    "first_appearance": rich["first_appearance"],
                    "aliases": rich["aliases"],
                    "infobox": Json({"raw": rich["infobox"]}) if rich["infobox"] else None,
                    "sections": Json(rich["sections"]),   # list[dict] -> JSONB
                    "outlinks": Json(outlinks),           # list[dict] -> JSONB
                    "embedding": vec_literal,             # keep as string "[...]" or None
                }

                cur.execute(UPSERT, payload)
                processed += 1
                if processed % 25 == 0:
                    conn.commit()
                    print(f"    processed {processed}…")
                time.sleep(REQUEST_DELAY_S)
            
                for k, v in payload.items():
                    if isinstance(v, dict) or (isinstance(v, list) and v and isinstance(v[0], dict)):
                        print("JSON candidate:", k, type(v))
            except Exception as e:
                print(f"[WARN] pageid={pid} ({m.get('title')}): {e}")

        conn.commit()

    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) AS n FROM spells WHERE used_by_doctor_strange = TRUE;")
        row = cur.fetchone()
        print(f"[*] Heuristic Strange-used spells: {row['n'] if row else 0}")
    print(f"Done. Total processed: {processed}")

if __name__ == "__main__":
    main()
