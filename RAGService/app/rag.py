from typing import List, Optional, Tuple
from sqlalchemy import text as sqltext
from fastapi import HTTPException
from .db import SessionLocal
from .embeddings import embed_text
from .llm import generate
from .settings import settings
from .prompt import RAG_SYSTEM

DIM = settings.embedding_dim  # e.g., 768

def retrieve(query: str, top_k: int = 6, document_id: Optional[str] = None) -> List[dict]:
    # get query embedding (your embed_text already validates size)
    try:
        q_vec = embed_text(query)
    except Exception as e:
        # surface a clean 400 to the client instead of 500
        raise HTTPException(status_code=400, detail=f"Embedding failed: {e}")

    params = {"q": q_vec, "k": top_k}
    where_doc = ""
    if document_id:
        where_doc = "WHERE c.document_id = :doc_id"
        params["doc_id"] = document_id

    # CAST :q to pgvector so <=> works
    sql = f"""
        SELECT c.id, c.document_id, c.chunk_index, c.content,
            (c.embedding <=> CAST(:q AS vector({DIM}))) AS distance
        FROM chunks c
        {where_doc}
        ORDER BY c.embedding <=> CAST(:q AS vector({DIM}))
        LIMIT :k
    """

    with SessionLocal() as db:
        rows = db.execute(sqltext(sql), params).mappings().all()
        return [dict(r) for r in rows]

def build_context(snippets: List[dict]) -> Tuple[str, str]:
    blocks, citations = [], []
    for s in snippets:
        blocks.append(f"[doc:{s['document_id']} chunk:{s['chunk_index']}]\n{s['content']}\n")
        citations.append(f"[doc:{s['document_id']} chunk:{s['chunk_index']}]")
    cite_str = " ".join(dict.fromkeys(citations))
    return "\n---\n".join(blocks), cite_str

def rag_answer(query: str, document_id: Optional[str] = None, context: Optional[str] = None):
    """
    If `context` is provided, use it directly.
    Else if `document_id` is provided, load the doc text by ID.
    Else, proceed with no context (Jarvis will extrapolate).
    """
    if context and context.strip():
        doc_text = context
    elif document_id:
        doc_text = load_document_text(document_id)  # your existing loader
    else:
        doc_text = ""

    prompt = f"{RAG_SYSTEM}\n\nCONTEXT:\n{doc_text}\n\nUSER QUESTION:\n{query}"
    answer = generate(prompt)

    # return your standard shape
    return {"answer": answer, "citations": None}

def summarize_document(document_id: str) -> str:
    hits = retrieve("overall summary of the document", top_k=12, document_id=document_id)
    context, _ = build_context(hits)
    prompt = f"""{RAG_SYSTEM}

Summarize the document in 6-10 bullet points focusing on key themes, findings, definitions, and conclusions.

CONTEXT:
{context}

BULLET SUMMARY:
"""
    return generate(prompt).strip()

def key_takeaways(document_id: str, k: int = 5) -> str:
    hits = retrieve("top key takeaways; main points; executive summary; highlights", top_k=10, document_id=document_id)
    context, _ = build_context(hits)
    prompt = f"""{RAG_SYSTEM}

List the top {k} key takeaways from this document. Each takeaway should be one sentence.

CONTEXT:
{context}

TOP {k} TAKEAWAYS:
"""
    return generate(prompt).strip()

def explain_term(document_id: str, term: str) -> str:
    hits = retrieve(term, top_k=8, document_id=document_id)
    context, _ = build_context(hits)
    prompt = f"""{RAG_SYSTEM}

Explain the concept "{term}" from the document in simple, non-technical language.

CONTEXT:
{context}

EXPLANATION:
"""
    return generate(prompt).strip()


