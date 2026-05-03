"""
Vector Store com ChromaDB + sentence-transformers.
SQLite-backed, no external services needed.
"""

import logging
import os
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "chromadb_data")
_MODEL_NAME = "all-MiniLM-L6-v2"


class RAGVectorStore:

    def __init__(self, db_path: str = _DEFAULT_DB_PATH, model_name: str = _MODEL_NAME):
        import chromadb
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(model_name)
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="grilo_pdfs",
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"✅ RAGVectorStore ready | chunks={self.collection.count()} | db={db_path}")

    # ---- Indexing ----

    def add_chunks(self, chunks: List, batch_size: int = 64):
        """Embeds and stores chunks. Skips duplicates by ID."""
        total = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]

            ids = [f"{c.pdf_name}__p{c.page_num}__i{c.chunk_index}" for c in batch]
            texts = [c.text for c in batch]
            embeddings = self.model.encode(texts, show_progress_bar=False).tolist()
            metadatas = [c.to_metadata_dict() for c in batch]

            self.collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
            total += len(batch)
            logger.info(f"  indexed {total}/{len(chunks)} chunks")

        logger.info(f"✅ add_chunks done — total in store: {self.collection.count()}")

    def is_indexed(self) -> bool:
        return self.collection.count() > 0

    # ---- Retrieval ----

    def search(self, query: str, k: int = 3, where: Optional[Dict] = None) -> List[Dict]:
        """Semantic search. Returns ranked list of {text, metadata, similarity_score}."""
        query_embedding = self.model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(k, self.collection.count()),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        formatted = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            formatted.append(
                {
                    "text": doc,
                    "metadata": meta,
                    "similarity_score": round(1.0 - dist, 4),
                }
            )
        return formatted

    def search_by_level(self, query: str, level: str, k: int = 3) -> List[Dict]:
        """Search filtered to chunks at or below the student's level."""
        _hierarchy = {
            "A1": ["A1"],
            "A2": ["A1", "A2"],
            "B1": ["A1", "A2", "B1"],
            "B2": ["A1", "A2", "B1", "B2"],
            "C1": ["A1", "A2", "B1", "B2", "C1"],
            "C2": ["A1", "A2", "B1", "B2", "C1", "C2"],
        }
        allowed = _hierarchy.get(level.upper(), [level])
        where = {"level": {"$in": allowed}} if len(allowed) > 1 else {"level": allowed[0]}
        return self.search(query, k=k, where=where)

    def stats(self) -> Dict:
        return {
            "total_chunks": self.collection.count(),
            "embedding_model": _MODEL_NAME,
            "embedding_dim": 384,
            "distance_metric": "cosine",
        }
