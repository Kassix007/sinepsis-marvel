BEGIN; 

CREATE TABLE IF NOT EXISTS documents (
	id UUID PRIMARY KEY,
	title TEXT,
	filename TEXT,
	mime_type TEXT,
	created_at TIMESTAMPTZ DEFAULT now(),
	doc_embedding vector(768)
);

CREATE TABLE IF NOT EXISTS chunks (
	id UUID PRIMARY KEY,
	document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
	chunk_index INT,
	content TEXT,
	embedding vector(768),
	created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_cosine
ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_docs_embedding_cosine
ON documents USING ivfflat (doc_embedding vector_cosine_ops) WITH (lists = 50);

COMMIT;
