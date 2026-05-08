"""Seed inicial do LessonPhraseBank.

Cada aula recebe 5 frases REAIS extraídas dos dados existentes em lessons_v2.py:
- exercise_answer: respostas corretas dos exercícios da aula
- example: frases do array "examples" da aula
- vocabulary: vocabulário usado em frase completa

Estrutura:
    {
        "phrase_en": "...",
        "phrase_pt": "...",
        "phonetic": "...",         # leitura aproximada para brasileiros
        "warning_pt": "...",       # alerta de pronúncia (opcional)
        "difficulty_level": 1..4,
        "source": "exercise_answer | example | vocabulary",
    }

O seed é idempotente: roda no startup e só insere se a aula ainda não tem frases.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from backend.db_models import LessonPhraseBank


PHRASE_BANK_SEED = {
    # Aula 1 — Hello e Hi: cumprimentos básicos
    1: [
        {"phrase_en": "Hello, I'm David.", "phrase_pt": "Olá, eu sou o David.",
         "phonetic": "HEH-low · aim · DAY-vid", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Hi, what's your name?", "phrase_pt": "Oi, qual é o seu nome?",
         "phonetic": "rai · uats · yor · neym", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Hi! Nice to see you.", "phrase_pt": "Oi! Bom te ver.",
         "phonetic": "rai · nais · tu · si · yu", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Hello, nice to meet you.", "phrase_pt": "Olá, prazer em conhecer você.",
         "phonetic": "HEH-low · nais · tu · mit · yu", "difficulty_level": 2, "source": "exercise_answer"},
        {"phrase_en": "Hi, how are you?", "phrase_pt": "Oi, como você está?",
         "phonetic": "rai · rau · ar · yu", "difficulty_level": 1, "source": "exercise_answer"},
    ],
    # Aula 2 — Bom dia, Boa tarde, Boa noite
    2: [
        {"phrase_en": "Good morning! Did you sleep well?", "phrase_pt": "Bom dia! Você dormiu bem?",
         "phonetic": "gud · MOR-ning · did · yu · slip · uel", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Good afternoon! How is your day?", "phrase_pt": "Boa tarde! Como está seu dia?",
         "phonetic": "gud · af-ter-NOON · rau · iz · yor · dei", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Good evening! Welcome!", "phrase_pt": "Boa noite! Bem-vindo!",
         "phonetic": "gud · EEV-ning · WEL-kum",
         "warning_pt": "\"Evening\" não é \"evéning\" — a força vai no EEV, não no ning",
         "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Good morning, how are you?", "phrase_pt": "Bom dia, como você está?",
         "phonetic": "gud · MOR-ning · rau · ar · yu", "difficulty_level": 1, "source": "exercise_answer"},
        {"phrase_en": "It's 3 PM — Good afternoon!", "phrase_pt": "São 3 da tarde — Boa tarde!",
         "phonetic": "its · thri · pi · em · gud · af-ter-NOON", "difficulty_level": 3, "source": "example"},
    ],
    # Aula 3 — Como se apresentar
    3: [
        {"phrase_en": "My name is Carlos.", "phrase_pt": "Meu nome é Carlos.",
         "phonetic": "may · neym · iz · KAR-los", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm Maria.", "phrase_pt": "Eu sou a Maria.",
         "phonetic": "aim · ma-RI-a", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Hello, my name is João.", "phrase_pt": "Olá, meu nome é João.",
         "phonetic": "HEH-low · may · neym · iz · jo-UN", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "My name is David and I'm from Brazil.", "phrase_pt": "Meu nome é David e eu sou do Brasil.",
         "phonetic": "may · neym · iz · DAY-vid · end · aim · from · bruh-ZIL",
         "difficulty_level": 3, "source": "example"},
        {"phrase_en": "I'm Pedro. Nice to meet you!", "phrase_pt": "Eu sou o Pedro. Prazer em conhecer!",
         "phonetic": "aim · PEH-dro · nais · tu · mit · yu", "difficulty_level": 2, "source": "example"},
    ],
    # Aula 4 — Como perguntar o nome
    4: [
        {"phrase_en": "What's your name?", "phrase_pt": "Qual é o seu nome?",
         "phonetic": "uats · yor · neym", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Can I have your name, please?", "phrase_pt": "Posso saber seu nome, por favor?",
         "phonetic": "ken · ai · hev · yor · neym · pliz", "difficulty_level": 3, "source": "example"},
        {"phrase_en": "What is your name?", "phrase_pt": "Qual é o seu nome?",
         "phonetic": "uat · iz · yor · neym", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Who are you?", "phrase_pt": "Quem é você?",
         "phonetic": "ru · ar · yu", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "May I ask your name?", "phrase_pt": "Posso perguntar seu nome?",
         "phonetic": "mei · ai · ask · yor · neym", "difficulty_level": 3, "source": "example"},
    ],
    # Aula 5 — Respostas educadas
    5: [
        {"phrase_en": "Nice to meet you!", "phrase_pt": "Prazer em conhecer você!",
         "phonetic": "nais · tu · mit · yu", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "Pleased to meet you.", "phrase_pt": "Prazer em conhecê-lo.",
         "phonetic": "plizd · tu · mit · yu", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Great to meet you!", "phrase_pt": "Ótimo conhecer você!",
         "phonetic": "greit · tu · mit · yu", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Nice to meet you too!", "phrase_pt": "Prazer em conhecê-lo também!",
         "phonetic": "nais · tu · mit · yu · tu", "difficulty_level": 1, "source": "exercise_answer"},
        {"phrase_en": "The pleasure is mine.", "phrase_pt": "O prazer é meu.",
         "phonetic": "thuh · PLEH-zher · iz · main",
         "warning_pt": "\"Pleasure\" — cuidado: PLEH-zher, não \"pleasure\" como \"plazer\"",
         "difficulty_level": 4, "source": "exercise_answer"},
    ],
    # Aula 6 — Idade e Aniversário
    6: [
        {"phrase_en": "How old are you?", "phrase_pt": "Quantos anos você tem?",
         "phonetic": "rau · old · ar · yu", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm 25 years old.", "phrase_pt": "Eu tenho 25 anos.",
         "phonetic": "aim · twen-ti-faiv · yirz · old", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "My birthday is December 15.", "phrase_pt": "Meu aniversário é 15 de dezembro.",
         "phonetic": "may · BIRTH-dei · iz · di-SEM-ber · fif-TEEN", "difficulty_level": 3, "source": "example"},
        {"phrase_en": "When is your birthday?", "phrase_pt": "Quando é seu aniversário?",
         "phonetic": "uen · iz · yor · BIRTH-dei", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "I was born in 1995.", "phrase_pt": "Eu nasci em 1995.",
         "phonetic": "ai · uoz · born · in · nain-tin-nain-ti-faiv", "difficulty_level": 3, "source": "example"},
    ],
    # Aula 7 — Nacionalidade e Origem
    7: [
        {"phrase_en": "Where are you from?", "phrase_pt": "De onde você é?",
         "phonetic": "uér · ar · yu · from", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm from Brazil.", "phrase_pt": "Eu sou do Brasil.",
         "phonetic": "aim · from · bruh-ZIL", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm Brazilian.", "phrase_pt": "Eu sou brasileiro(a).",
         "phonetic": "aim · bruh-ZIL-yan", "difficulty_level": 2, "source": "exercise_answer"},
        {"phrase_en": "What is your nationality?", "phrase_pt": "Qual é sua nacionalidade?",
         "phonetic": "uat · iz · yor · na-shio-NA-li-ti", "difficulty_level": 3, "source": "example"},
        {"phrase_en": "I'm from São Paulo.", "phrase_pt": "Eu sou de São Paulo.",
         "phonetic": "aim · from · sun · PAU-lo", "difficulty_level": 2, "source": "exercise_answer"},
    ],
    # Aula 8 — Profissões
    8: [
        {"phrase_en": "What do you do?", "phrase_pt": "O que você faz?",
         "phonetic": "uat · du · yu · du", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm a teacher.", "phrase_pt": "Eu sou professor(a).",
         "phonetic": "aim · uh · TI-cher", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I'm an engineer.", "phrase_pt": "Eu sou engenheiro(a).",
         "phonetic": "aim · en · en-juh-NEER",
         "warning_pt": "\"Engineer\" ≠ \"engenheiro\" — en-juh-NEER, não \"en-ge-NHEI-ro\"",
         "difficulty_level": 2, "source": "exercise_answer"},
        {"phrase_en": "I work as a nurse.", "phrase_pt": "Eu trabalho como enfermeiro(a).",
         "phonetic": "ai · uerk · ez · uh · ners", "difficulty_level": 3, "source": "example"},
        {"phrase_en": "I'm a student. I study English.", "phrase_pt": "Eu sou estudante. Eu estudo inglês.",
         "phonetic": "aim · uh · STIU-dent · ai · STA-di · IN-glish", "difficulty_level": 3, "source": "example"},
    ],
}


def seed_phrase_bank(db: Session, force: bool = False) -> dict:
    """Insere as 5 frases por aula. Idempotente — só insere se a aula está vazia.

    Args:
        db: sessão SQLAlchemy ativa
        force: se True, apaga e recria. Default False.
    Returns:
        Resumo com {inserted_lessons, total_phrases}
    """
    inserted_lessons = []
    total_phrases = 0

    for lesson_id, phrases in PHRASE_BANK_SEED.items():
        existing = (
            db.query(LessonPhraseBank)
            .filter(LessonPhraseBank.lesson_id == lesson_id)
            .count()
        )
        if existing > 0 and not force:
            continue

        if force and existing > 0:
            db.query(LessonPhraseBank).filter(
                LessonPhraseBank.lesson_id == lesson_id
            ).delete()

        for order, phrase in enumerate(phrases):
            row = LessonPhraseBank(
                lesson_id=lesson_id,
                phrase_en=phrase["phrase_en"],
                phrase_pt=phrase.get("phrase_pt"),
                phonetic=phrase.get("phonetic"),
                warning_pt=phrase.get("warning_pt"),
                difficulty_level=phrase.get("difficulty_level", 1),
                source=phrase.get("source", "example"),
                order_hint=order,
                created_at=datetime.utcnow(),
            )
            db.add(row)
            total_phrases += 1

        inserted_lessons.append(lesson_id)

    if inserted_lessons:
        db.commit()

    return {
        "inserted_lessons": inserted_lessons,
        "total_phrases": total_phrases,
    }
