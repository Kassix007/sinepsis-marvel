from sqlalchemy import text as sqltext
from .db import SessionLocal

def similar_documents(document_id: str, top_k: int = 5):
    sql = """
        WITH q AS (
            SELECT doc_embedding AS qvec
            FROM documents
            WHERE id = :doc_id
        )
        SELECT d.id, d.title, d.filename,
               (d.doc_embedding <=> (SELECT qvec FROM q)) AS distance
        FROM documents d
        WHERE d.id <> :doc_id AND d.doc_embedding IS NOT NULL
        ORDER BY d.doc_embedding <=> (SELECT qvec FROM q)
        LIMIT :k;
    """
    with SessionLocal() as db:
        rows = db.execute(sqltext(sql), {"doc_id": document_id, "k": top_k}).mappings().all()
        return [dict(r) for r in rows]
