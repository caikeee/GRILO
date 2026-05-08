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
    # ─────────────────────────────────────────────────────
    # Aulas standalone (IDs 1001-1008) — usadas em lessons.html
    # ─────────────────────────────────────────────────────
    # 1001 — Pronomes
    1001: [
        {"phrase_en": "I work every day.", "phrase_pt": "Eu trabalho todo dia.",
         "phonetic": "ai · uerk · EV-ri · dei", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She loves coffee.", "phrase_pt": "Ela adora café.",
         "phonetic": "shi · lavs · KO-fi", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She called me yesterday.", "phrase_pt": "Ela me ligou ontem.",
         "phonetic": "shi · kold · mi · YES-ter-dei", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Can you help us?", "phrase_pt": "Você pode nos ajudar?",
         "phonetic": "ken · yu · help · as", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "This is between you and me.", "phrase_pt": "Isso é entre você e eu.",
         "phonetic": "this · iz · bi-TUEEN · yu · end · mi",
         "warning_pt": "Em inglês é 'me', não 'I' — depois de preposição usa-se a forma de objeto.",
         "difficulty_level": 3, "source": "example"},
    ],
    # 1002 — Perguntas
    1002: [
        {"phrase_en": "Where do you live?", "phrase_pt": "Onde você mora?",
         "phonetic": "uér · du · yu · liv", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "What time is it?", "phrase_pt": "Que horas são?",
         "phonetic": "uat · taim · iz · it", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "How do you say this in English?", "phrase_pt": "Como se diz isso em inglês?",
         "phonetic": "rau · du · yu · sei · this · in · IN-glish", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Why are you late?", "phrase_pt": "Por que você está atrasado?",
         "phonetic": "uai · ar · yu · leit", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Does she speak English?", "phrase_pt": "Ela fala inglês?",
         "phonetic": "dáz · shi · spik · IN-glish",
         "warning_pt": "Use 'does' com he/she/it — não 'do'.",
         "difficulty_level": 3, "source": "example"},
    ],
    # 1003 — Negativa
    1003: [
        {"phrase_en": "I don't know.", "phrase_pt": "Eu não sei.",
         "phonetic": "ai · dont · nou", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She doesn't like coffee.", "phrase_pt": "Ela não gosta de café.",
         "phonetic": "shi · DAZ-ent · laik · KO-fi",
         "warning_pt": "Com he/she/it use 'doesn't' — não 'don't'.",
         "difficulty_level": 2, "source": "example"},
        {"phrase_en": "We aren't ready.", "phrase_pt": "Nós não estamos prontos.",
         "phonetic": "ui · arnt · RE-di", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "He didn't call yesterday.", "phrase_pt": "Ele não ligou ontem.",
         "phonetic": "ri · DI-dent · kol · YES-ter-dei", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "I won't be late.", "phrase_pt": "Eu não vou me atrasar.",
         "phonetic": "ai · uont · bi · leit", "difficulty_level": 3, "source": "example"},
    ],
    # 1004 — Passado
    1004: [
        {"phrase_en": "I worked yesterday.", "phrase_pt": "Eu trabalhei ontem.",
         "phonetic": "ai · uerkt · YES-ter-dei", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She went to the store.", "phrase_pt": "Ela foi à loja.",
         "phonetic": "shi · uent · tu · da · stor",
         "warning_pt": "'Went' é o passado de 'go' — não 'goed'.",
         "difficulty_level": 2, "source": "example"},
        {"phrase_en": "We had lunch together.", "phrase_pt": "Nós almoçamos juntos.",
         "phonetic": "ui · red · lanch · tu-GE-der", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "They saw the movie.", "phrase_pt": "Eles viram o filme.",
         "phonetic": "dei · só · da · MUVI", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "I bought a new car.", "phrase_pt": "Eu comprei um carro novo.",
         "phonetic": "ai · bót · uh · niu · car",
         "warning_pt": "'Bought' é o passado de 'buy' — não 'buyed'.",
         "difficulty_level": 3, "source": "example"},
    ],
    # 1005 — Futuro
    1005: [
        {"phrase_en": "I will call you later.", "phrase_pt": "Eu vou te ligar mais tarde.",
         "phonetic": "ai · uill · kol · yu · LEI-ter", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She is going to travel.", "phrase_pt": "Ela vai viajar.",
         "phonetic": "shi · iz · GOING · tu · TRA-vel", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "We'll meet tomorrow.", "phrase_pt": "Nós nos encontraremos amanhã.",
         "phonetic": "uil · mit · tu-MO-rou", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "I'm going to study English.", "phrase_pt": "Eu vou estudar inglês.",
         "phonetic": "aim · GOING · tu · STA-di · IN-glish", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "It will rain tonight.", "phrase_pt": "Vai chover hoje à noite.",
         "phonetic": "it · uill · rein · tu-NAIT", "difficulty_level": 3, "source": "example"},
    ],
    # 1006 — Gerúndio
    1006: [
        {"phrase_en": "I like reading books.", "phrase_pt": "Eu gosto de ler livros.",
         "phonetic": "ai · laik · RI-ding · buks",
         "warning_pt": "Após 'like', 'enjoy', 'love' — verbo no gerúndio (-ing).",
         "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She enjoys swimming.", "phrase_pt": "Ela gosta de nadar.",
         "phonetic": "shi · in-JOIS · S(U)IM-ing", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "We are working now.", "phrase_pt": "Nós estamos trabalhando agora.",
         "phonetic": "ui · ar · UER-king · nau", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "He loves playing soccer.", "phrase_pt": "Ele adora jogar futebol.",
         "phonetic": "ri · lavs · PLEI-ing · SO-ker", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "Stop talking, please.", "phrase_pt": "Pare de falar, por favor.",
         "phonetic": "stop · TO-king · pliz", "difficulty_level": 3, "source": "example"},
    ],
    # 1007 — Preposições
    1007: [
        {"phrase_en": "I live in Brazil.", "phrase_pt": "Eu moro no Brasil.",
         "phonetic": "ai · liv · in · bruh-ZIL", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "The book is on the table.", "phrase_pt": "O livro está na mesa.",
         "phonetic": "da · buk · iz · on · da · TEI-bol", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "I work at the office.", "phrase_pt": "Eu trabalho no escritório.",
         "phonetic": "ai · uerk · et · da · O-fis",
         "warning_pt": "'At' para lugar específico, 'in' para lugar amplo.",
         "difficulty_level": 2, "source": "example"},
        {"phrase_en": "She arrives at 8 PM.", "phrase_pt": "Ela chega às 8 da noite.",
         "phonetic": "shi · uh-RAIVS · et · eit · pi · em", "difficulty_level": 2, "source": "example"},
        {"phrase_en": "We meet on Mondays.", "phrase_pt": "A gente se encontra nas segundas.",
         "phonetic": "ui · mit · on · MAN-deis", "difficulty_level": 3, "source": "example"},
    ],
    # 1008 — Verbos
    1008: [
        {"phrase_en": "I have a question.", "phrase_pt": "Eu tenho uma pergunta.",
         "phonetic": "ai · rev · uh · KUES-chon", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "She is a doctor.", "phrase_pt": "Ela é médica.",
         "phonetic": "shi · iz · uh · DOK-ter", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "We are friends.", "phrase_pt": "Nós somos amigos.",
         "phonetic": "ui · ar · frends", "difficulty_level": 1, "source": "example"},
        {"phrase_en": "He has two brothers.", "phrase_pt": "Ele tem dois irmãos.",
         "phonetic": "ri · rez · tu · BRA-thers",
         "warning_pt": "Com he/she/it use 'has' — não 'have'.",
         "difficulty_level": 2, "source": "example"},
        {"phrase_en": "They make great food.", "phrase_pt": "Eles fazem comida ótima.",
         "phonetic": "dei · meik · greit · fud", "difficulty_level": 2, "source": "example"},
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
