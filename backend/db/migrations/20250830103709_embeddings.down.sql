BEGIN;

DROP INDEX IF EXISTS idx_chunks_embedding_cosine;
DROP INDEX IF EXISTS idx_docs_embedding_cosine;

DROP TABLE IF EXISTS chunks;
DROP TABLE IF EXISTS documents;

COMMIT;
