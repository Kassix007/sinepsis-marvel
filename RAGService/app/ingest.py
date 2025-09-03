import uuid
import fitz  # PyMuPDF
from docx import Document as Docx
from .db import SessionLocal, Document, Chunk
from .embeddings import embed_batch
from .textsplit import split_into_chunks

def read_pdf(path: str) -> str:
    doc = fitz.open(path)
    return "\n".join([page.get_text() for page in doc])

def read_docx(path: str) -> str:
    d = Docx(path)
    return "\n".join([p.text for p in d.paragraphs])

def average(vectors: list[list[float]]) -> list[float]:
    if not vectors:
        return []
    dim = len(vectors[0])
    out = [0.0] * dim
    for v in vectors:
        for i, val in enumerate(v):
            out[i] += val
    return [x / len(vectors) for x in out]

def upsert_document(filename: str, mime_type: str, file_path: str, title: str | None = None) -> uuid.UUID:
    if filename.lower().endswith(".pdf"):
        text = read_pdf(file_path)
    elif filename.lower().endswith(".docx"):
        text = read_docx(file_path)
    else:
        raise ValueError("Only PDF or DOCX supported")

    chunks = split_into_chunks(text, chunk_size=1400, overlap=200)
    if not chunks:
        raise ValueError("No extractable text found.")

    embeddings = embed_batch(chunks)

    with SessionLocal() as db:
        d = Document(title=title or filename, filename=filename, mime_type=mime_type)
        db.add(d)
        db.flush()  # get d.id

        for idx, (c, e) in enumerate(zip(chunks, embeddings)):
            db.add(Chunk(document_id=d.id, chunk_index=idx, content=c, embedding=e))

        d.doc_embedding = average(embeddings)
        db.commit()
        return d.id
