# app/db.py (or wherever this lives)
import uuid
from sqlalchemy import create_engine, text, DateTime, func, Text, Integer, ForeignKey, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker
from pgvector.sqlalchemy import Vector
from pgvector.psycopg import register_vector          # <-- add this
from .settings import settings

# Important: use the psycopg3 driver in your URL, e.g.:
# postgresql+psycopg://user:pass@host:5432/dbname
engine = create_engine(settings.database_url, pool_pre_ping=True)

# Register pgvector with every new psycopg connection
@event.listens_for(engine, "connect")
def _register_vector(dbapi_conn, conn_record):
    register_vector(dbapi_conn)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

class Document(Base):
    __tablename__ = "documents"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    filename: Mapped[str | None] = mapped_column(Text, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    doc_embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.embedding_dim), nullable=True)

    chunks: Mapped[list["Chunk"]] = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, index=True)
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(settings.embedding_dim))
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    document: Mapped[Document] = relationship("Document", back_populates="chunks")

def init_db():
    # Ensure extension and tables exist; create ANN indexes
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(engine)
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_chunks_embedding_cosine
            ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_docs_embedding_cosine
            ON documents USING ivfflat (doc_embedding vector_cosine_ops) WITH (lists = 50);
        """))
