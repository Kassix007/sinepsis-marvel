import re
from typing import List

def normalize_text(s: str) -> str:
    s = s.replace("\r", "\n")
    s = re.sub(r"[\t\x0b\x0c\u00A0]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def split_into_chunks(text: str, chunk_size: int = 1200, overlap: int = 150) -> List[str]:
    text = normalize_text(text)
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end]
        last_nl = chunk.rfind("\n\n")
        if last_nl != -1 and end < len(text):
            end = start + last_nl + 2
            chunk = text[start:end]
        chunks.append(chunk.strip())
        start = max(end - overlap, end)
    return [c for c in chunks if c]
