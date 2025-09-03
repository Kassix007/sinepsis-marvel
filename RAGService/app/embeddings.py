# app/embeddings.py
from __future__ import annotations

import requests
from fastapi import HTTPException
from .settings import settings

EXPECTED_DIM = 768  # change if you switch models

class EmbeddingError(Exception):
    pass

def _post_embed(model: str, text: str) -> list[float]:
    url = f"{settings.ollama_host}/api/embeddings"
    # Prefer 'prompt' key; fallback to 'input'
    r = requests.post(url, json={"model": model, "prompt": text}, timeout=60)
    r.raise_for_status()
    v = (r.json() or {}).get("embedding") or []
    if not v:
        r2 = requests.post(url, json={"model": model, "input": text}, timeout=60)
        r2.raise_for_status()
        v = (r2.json() or {}).get("embedding") or []
    return v

def embed_text(text: str) -> list[float]:
    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided for embedding")

    vec = _post_embed(settings.embedding_model, text)

    if not vec:
        raise HTTPException(status_code=400, detail="No embedding returned by model")

    if len(vec) != EXPECTED_DIM:
        raise HTTPException(
            status_code=400,
            detail=f"Embedding dim {len(vec)} does not match expected {EXPECTED_DIM}",
        )
    return vec

def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a batch; raise if none succeeded (so /upload can 400)."""
    good: list[list[float]] = []
    for t in texts:
        try:
            good.append(embed_text(t))
        except Exception as e:
            # log and continue; your logger here
            print(f"[WARN] Skipping text due to embedding error: {e}")
    if not good:
        raise HTTPException(status_code=400, detail="No embeddings produced for any input")
    return good

def verify_embedder() -> None:
    try:
        v = embed_text("healthcheck")
        assert isinstance(v, list) and len(v) == EXPECTED_DIM
        print(f"[OK] Embedding model healthy: dim={len(v)}")
    except Exception as e:
        # Fail fast at startup if desired
        raise RuntimeError(f"Embedding model not healthy: {e}")

__all__ = ["embed_text", "embed_batch", "verify_embedder", "EXPECTED_DIM", "EmbeddingError"]
