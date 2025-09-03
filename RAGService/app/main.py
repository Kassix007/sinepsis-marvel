import os
import uuid
import docx
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pypdf import PdfReader
from .storage import save_file, load_document_text
from .settings import settings
from .db import init_db
from .ingest import upsert_document
from .rag import rag_answer, summarize_document, key_takeaways, explain_term
from .similar import similar_documents

app = FastAPI(title="RAG (Ollama + Postgres/pgvector)")

# CORS (adjust origin list in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {
        "service": "RAG (Ollama + Postgres/pgvector)",
        "endpoints": [
            "POST /upload",
            "POST /chat",
            "POST /analyze/summary",
            "POST /analyze/key_takeaways",
            "POST /analyze/explain_term",
            "GET  /similar",
        ],
    }

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    suffix = (file.filename.rsplit(".", 1)[-1] or "").lower()
    if suffix not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX supported")

    try:
        # Persist permanently in uploads/ and get a stable document_id
        document_id = save_file(file)

        # If your upsert needs the path, derive it from uploads/:
        # (optional) pass path to upsert_document if your pipeline needs it
        # stored_path = (UPLOAD_DIR / f"{document_id}.{suffix}").as_posix()

        _ = upsert_document(
            filename=file.filename,
            mime_type=file.content_type or "",
            file_path=f"uploads/{document_id}.{suffix}",  # or stored_path
            title=file.filename,
        )

        return {"document_id": document_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(payload: dict):
    query = (payload.get("query") or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Missing 'query'")

    document_id = payload.get("document_id")  # optional
    context = payload.get("context")          # optional raw text

    # Update rag_answer to accept context text directly (see note below)
    result = rag_answer(query, document_id=document_id, context=context)
    return JSONResponse(content=jsonable_encoder(result))

@app.post("/analyze/summary")
async def analyze_summary(document_id: str):
    if not document_id:
        raise HTTPException(status_code=400, detail="Missing document_id")
    return {"summary": summarize_document(document_id)}

@app.post("/analyze/key_takeaways")
async def analyze_key_takeaways(document_id: str, k: int = 5):
    if not document_id:
        raise HTTPException(status_code=400, detail="Missing document_id")
    return {"takeaways": key_takeaways(document_id, k=k)}

@app.post("/analyze/explain_term")
async def analyze_explain_term(document_id: str, payload: dict):
    if not document_id:
        raise HTTPException(status_code=400, detail="Missing document_id")
    term = (payload.get("term") or "").strip()
    if not term:
        raise HTTPException(status_code=400, detail="Missing 'term'")
    return {"explanation": explain_term(document_id, term)}

@app.get("/similar")
async def similar(document_id: str, top_k: int = 5):
    if not document_id:
        raise HTTPException(status_code=400, detail="Missing document_id")
    return {"similar": similar_documents(document_id, top_k=top_k)}


@app.get("/documents/{document_id}/text")
def get_document_text(document_id: str):
    text = load_document_text(document_id)
    if not text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted")
    return {"text": text}