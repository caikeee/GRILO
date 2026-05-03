"""
Estratégia de chunking otimizada para tutoria de inglês.
Usa tiktoken para contagem precisa de tokens.
"""

import logging
from typing import List, Dict
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    text: str
    page_num: int
    pdf_name: str
    section_title: str = ""
    level: str = "A1"
    topic: str = ""
    chunk_index: int = 0
    total_chunks: int = 0

    def to_metadata_dict(self) -> Dict:
        return {
            "page_num": self.page_num,
            "pdf_name": self.pdf_name,
            "section_title": self.section_title,
            "level": self.level,
            "topic": self.topic,
            "chunk_index": self.chunk_index,
        }


class PDFChunker:

    def __init__(self, chunk_size: int = 512, overlap: int = 64):
        self.chunk_size = chunk_size
        self.overlap = overlap
        try:
            import tiktoken
            self._enc = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self._enc = None
            logger.warning("tiktoken não disponível — usando contagem por palavras")

    def count_tokens(self, text: str) -> int:
        if self._enc:
            return len(self._enc.encode(text))
        return len(text.split())

    def chunk_text(self, text: str, page_num: int, pdf_name: str) -> List[Chunk]:
        chunks: List[Chunk] = []
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        current_text = ""
        current_tokens = 0
        idx = 0

        for para in paragraphs:
            para_tokens = self.count_tokens(para)

            if current_tokens + para_tokens <= self.chunk_size:
                current_text += para + "\n\n"
                current_tokens += para_tokens
            elif para_tokens > self.chunk_size:
                # Save current buffer first
                if current_text.strip():
                    chunks.append(Chunk(text=current_text.strip(), page_num=page_num, pdf_name=pdf_name, chunk_index=idx))
                    idx += 1
                    current_text = ""
                    current_tokens = 0

                # Split large paragraph by sentences
                sentences = [s.strip() for s in para.replace("? ", "?||").replace("! ", "!||").replace(". ", ".||").split("||") if s.strip()]
                for sent in sentences:
                    sent_tokens = self.count_tokens(sent + " ")
                    if current_tokens + sent_tokens <= self.chunk_size:
                        current_text += sent + " "
                        current_tokens += sent_tokens
                    else:
                        if current_text.strip():
                            chunks.append(Chunk(text=current_text.strip(), page_num=page_num, pdf_name=pdf_name, chunk_index=idx))
                            idx += 1
                        current_text = sent + " "
                        current_tokens = sent_tokens
            else:
                if current_text.strip():
                    chunks.append(Chunk(text=current_text.strip(), page_num=page_num, pdf_name=pdf_name, chunk_index=idx))
                    idx += 1
                current_text = para + "\n\n"
                current_tokens = para_tokens

        if current_text.strip():
            chunks.append(Chunk(text=current_text.strip(), page_num=page_num, pdf_name=pdf_name, chunk_index=idx))

        total = len(chunks)
        for c in chunks:
            c.total_chunks = total

        return chunks

    def assign_metadata(self, chunks: List[Chunk], pdf_type: str):
        """Atribui nível e tópico pedagógico baseado no tipo do PDF."""
        level_map = {"basico": "A1", "comunicativo": "A2", "gramatica": "B1"}
        default_level = level_map.get(pdf_type, "A1")

        for chunk in chunks:
            chunk.level = default_level
            chunk.topic = self._infer_topic(chunk.text, pdf_type)

    # ---- Topic inference ----

    _GRAMMAR_KEYWORDS: Dict[str, List[str]] = {
        "present_continuous": ["present continuous", "is going", "are going", "ing form"],
        "past_simple": ["past simple", "simple past", "irregular verb", "went", "did "],
        "present_perfect": ["present perfect", "have been", "has been", "already", "just"],
        "gerunds": ["gerund", "gerúndio", "enjoy doing", "verb-ing", "after verb"],
        "articles": ["article", "the ", " a ", " an ", "definite", "indefinite"],
        "prepositions": ["preposition", "in ", "on ", "at ", "to ", "preposição"],
        "conditionals": ["if clause", "conditional", "would ", "could "],
        "modal_verbs": ["modal", "can ", "could ", "may ", "might ", "should ", "must "],
        "phrasal_verbs": ["phrasal verb", "turn on", "look up", "give up", "take off"],
    }
    _COMM_KEYWORDS: Dict[str, List[str]] = {
        "dialogue": ["said", "replied", "asked", '"', "—"],
        "conversation_tips": ["how to", "tip", "way to", "useful phrase"],
        "phrases": ["phrase", "expression", "common", "everyday"],
    }
    _BASIC_KEYWORDS: Dict[str, List[str]] = {
        "greetings": ["hello", "hi", "goodbye", "good morning", "good night"],
        "numbers": ["one", "two", "three", "four", "number"],
        "colors": ["red", "blue", "green", "yellow", "color"],
        "alphabet": ["letter", "a b c", "alphabet"],
        "family": ["mother", "father", "brother", "sister", "family"],
    }

    def _infer_topic(self, text: str, pdf_type: str) -> str:
        tl = text.lower()
        mapping = {
            "gramatica": self._GRAMMAR_KEYWORDS,
            "comunicativo": self._COMM_KEYWORDS,
            "basico": self._BASIC_KEYWORDS,
        }.get(pdf_type, self._GRAMMAR_KEYWORDS)

        for topic, kws in mapping.items():
            if any(kw in tl for kw in kws):
                return topic
        return "general"
