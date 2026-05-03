"""
PDF Extractor com fallback estratégico.
Suporta os 3 PDFs do projeto GRILO.
"""

import logging
from typing import List, Dict
from pathlib import Path

logger = logging.getLogger(__name__)


class PDFExtractor:

    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.pdf_name = self.pdf_path.stem
        self.metadata: Dict = {}

    def extract_all(self) -> Dict:
        """Extrai texto completo com fallback automático."""
        try:
            import pdfplumber
            logger.info(f"[1/2] pdfplumber → {self.pdf_name}")
            content = self._extract_with_pdfplumber(pdfplumber)
            if content and len(content) > 100:
                logger.info(f"✅ pdfplumber: {len(content)} chars")
                return {"success": True, "content": content, "method": "pdfplumber"}
        except Exception as e:
            logger.warning(f"⚠️ pdfplumber falhou: {e}")

        try:
            import PyPDF2
            logger.info(f"[2/2] PyPDF2 → {self.pdf_name}")
            content = self._extract_with_pypdf2(PyPDF2)
            if content and len(content) > 100:
                logger.info(f"✅ PyPDF2: {len(content)} chars")
                return {"success": True, "content": content, "method": "pypdf2"}
        except Exception as e:
            logger.warning(f"⚠️ PyPDF2 falhou: {e}")

        logger.error(f"❌ Falha total: {self.pdf_name}")
        return {"success": False, "content": "", "method": None}

    def extract_by_pages(self) -> List[Dict]:
        """Extrai página por página com número e nome do PDF."""
        pages: List[Dict] = []
        try:
            import pdfplumber
            with pdfplumber.open(self.pdf_path) as pdf:
                self.metadata["total_pages"] = len(pdf.pages)
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text() or ""

                    # Include tables as pipe-separated text
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                text += " | ".join(str(c) if c else "" for c in row) + "\n"

                    if text.strip():
                        pages.append({
                            "page_num": page_num,
                            "text": text,
                            "pdf_name": self.pdf_name,
                        })
        except Exception as e:
            logger.error(f"Erro ao extrair páginas de {self.pdf_name}: {e}")

        return pages

    def _extract_with_pdfplumber(self, pdfplumber) -> str:
        content = []
        with pdfplumber.open(self.pdf_path) as pdf:
            self.metadata["total_pages"] = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text() or ""
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            text += " | ".join(str(c) if c else "" for c in row) + "\n"
                if text.strip():
                    content.append(text)
        return "\n\n".join(content)

    def _extract_with_pypdf2(self, PyPDF2) -> str:
        content = []
        with open(self.pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            self.metadata["total_pages"] = len(reader.pages)
            for page in reader.pages:
                text = page.extract_text()
                if text and text.strip():
                    content.append(text)
        return "\n\n".join(content)

    @staticmethod
    def extract_all_pdfs(pdf_directory: str) -> Dict[str, Dict]:
        """Extrai todos os PDFs de um diretório."""
        results = {}
        for pdf_file in Path(pdf_directory).glob("*.pdf"):
            logger.info(f"Processando {pdf_file.name}…")
            extractor = PDFExtractor(str(pdf_file))
            results[pdf_file.stem] = extractor.extract_all()
        return results
