"""
ingest.py — Ingestion pipeline for GRILO's 3 PDF textbooks.

Run once (or re-run to re-index):
    cd backend
    python rag/ingest.py

The script locates PDFs in the project root (two directories above backend/rag/),
extracts text page-by-page, chunks it, embeds with sentence-transformers,
and stores everything in ChromaDB under backend/rag/chromadb_data/.
"""

import logging
import os
import sys
from pathlib import Path

# Ensure backend/ is on the path when running this script directly
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from backend.rag.pdf_extractor import PDFExtractor
from backend.rag.chunking import PDFChunker
from backend.rag.vector_store import RAGVectorStore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# Project root is two levels up from backend/rag/
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Map: (filename, pdf_type for metadata)
PDF_MANIFEST = [
    ("Ingles_Comunicativo-Sanda_Bassani.pdf", "comunicativo"),
    ("INGLES BASICO.pdf", "basico"),
    (
        "Gramatica-Pratica-da-Lingua-Inglesa-O-Ingles-Descomplicado-Nelson-Torres.pdf",
        "gramatica",
    ),
]


def run_ingestion(clear_existing: bool = False):
    logger.info("=" * 60)
    logger.info("GRILO RAG — PDF Ingestion Pipeline")
    logger.info(f"Project root : {_PROJECT_ROOT}")
    logger.info("=" * 60)

    store = RAGVectorStore()

    if clear_existing and store.is_indexed():
        logger.info("Clearing existing index…")
        store.client.delete_collection("grilo_pdfs")
        store.collection = store.client.get_or_create_collection(
            name="grilo_pdfs",
            metadata={"hnsw:space": "cosine"},
        )

    chunker = PDFChunker(chunk_size=512, overlap=64)
    total_chunks = 0

    for filename, pdf_type in PDF_MANIFEST:
        pdf_path = _PROJECT_ROOT / filename

        if not pdf_path.exists():
            logger.warning(f"⚠️  Not found (skipping): {pdf_path}")
            continue

        logger.info(f"\n📄 Processing [{pdf_type.upper()}]: {filename}")
        extractor = PDFExtractor(str(pdf_path))
        pages = extractor.extract_by_pages()

        if not pages:
            logger.warning(f"  ⚠️  No text extracted — may be image-only PDF.")
            continue

        logger.info(f"  Pages with text: {len(pages)}")

        all_chunks = []
        for page in pages:
            page_chunks = chunker.chunk_text(
                page["text"], page["page_num"], page["pdf_name"]
            )
            all_chunks.extend(page_chunks)

        chunker.assign_metadata(all_chunks, pdf_type)

        logger.info(f"  Chunks created : {len(all_chunks)}")
        logger.info(f"  Embedding + storing…")
        store.add_chunks(all_chunks)
        total_chunks += len(all_chunks)

    stats = store.stats()
    logger.info("\n" + "=" * 60)
    logger.info(f"✅ Ingestion complete!")
    logger.info(f"   Total chunks in store : {stats['total_chunks']}")
    logger.info(f"   Embedding model       : {stats['embedding_model']}")
    logger.info("=" * 60)

    # Quick smoke test
    logger.info("\n🔍 Smoke test — querying 'How to use present continuous'…")
    results = store.search("How to use present continuous", k=2)
    for r in results:
        logger.info(
            f"  [{r['similarity_score']:.2f}] {r['metadata']['pdf_name']} "
            f"(level={r['metadata']['level']}, topic={r['metadata']['topic']}) "
            f"— {r['text'][:80]}…"
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ingest PDFs into GRILO RAG store")
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Clear existing index before ingesting",
    )
    args = parser.parse_args()
    run_ingestion(clear_existing=args.clear)
