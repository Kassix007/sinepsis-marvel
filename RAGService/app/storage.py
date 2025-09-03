# app/storage.py
from pathlib import Path
from fastapi import UploadFile, HTTPException
from pypdf import PdfReader
import docx
import uuid

# <project_root>/uploads
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_file(file: UploadFile, document_id: str | None = None) -> str:
    """Persist uploaded file to UPLOAD_DIR and return the document_id."""
    if not document_id:
        document_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix.lower()
    dest = UPLOAD_DIR / f"{document_id}{suffix}"
    with dest.open("wb") as f:
        f.write(file.file.read())
    return document_id

def _path_for(document_id: str) -> Path:
    matches = list(UPLOAD_DIR.glob(f"{document_id}.*"))
    if not matches:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    return matches[0]

def load_document_text(document_id: str) -> str:
    """Extract plain text from a stored PDF or DOCX."""
    path = _path_for(document_id)
    suf = path.suffix.lower()

    if suf == ".pdf":
        reader = PdfReader(str(path))
        text = "\n".join((p.extract_text() or "") for p in reader.pages)
    elif suf in (".docx",):
        d = docx.Document(str(path))
        text = "\n".join(p.text for p in d.paragraphs)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suf}")

    text = (text or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="No text could be extracted")
    return text
