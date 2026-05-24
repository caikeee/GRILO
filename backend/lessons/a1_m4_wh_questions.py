"""Lesson 19 — WH Questions (Module 4)"""

LESSON = {
    "title": "WH questions — perguntas abertas",
    "slug": "a1-m4-wh-questions",
    "old_slug": "soa4-wh-questions",
    "module": 4,
    "icon": "Q?",
    "objective": "Aprenda a fazer as perguntas que puxam informação real: what, where, who, when, why, how. As seis que destravam qualquer conversa.",
    "sections": [
        {"id": "cinco-wh", "title": "Seis palavras, seis respostas"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ do you live? ___2___ is your name?",
        "blanks": [
            {"answer": "Where", "hint": "Pergunta de lugar: What, Where ou When?",
             "options": ["Where", "What", "When", "Who"]},
            {"answer": "What", "hint": "Pergunta de nome/coisa: What, Who ou How?",
             "options": ["What", "Who", "How", "Where"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"___ is your name?\" — qual palavra de pergunta?", "options": ["Where", "What", "Who"], "correct": 1,
         "hints": ["Nome = coisa/informação → What", "What = o quê / qual", "Resposta: What"]},
        {"difficulty": "easy", "q": "\"___ do you live?\" — lugar", "options": ["Where", "When", "Why"], "correct": 0,
         "hints": ["Lugar = Where", "Where = onde", "Resposta: Where"]},
        {"difficulty": "moderate", "q": "\"___ does the class start?\" — horário", "options": ["Where", "When", "Why"], "correct": 1,
         "hints": ["Tempo/horário = When", "When = quando", "Resposta: When"]},
        {"difficulty": "moderate", "q": "\"___ much does it cost?\" — preço", "options": ["How", "What", "Which"], "correct": 0,
         "hints": ["Quantidade incontável = How much", "How much = quanto (preço, quantidade)", "Resposta: How"]},
        {"difficulty": "hard", "q": "Qual frase está correta?", "options": ["Where you live?", "Where do you live?", "Where does you live?"], "correct": 1,
         "hints": ["wh- + do/does + sujeito + base", "\"you\" = do (não does)", "Estrutura wh- = palavra + do/does + sujeito + base. \"You\" usa \"do\". → Resposta: Where do you live?"]},
    ],
    "final_test": [
        {"q": "\"___ is your name?\"", "options": ["Where", "What", "Who"], "correct": 1},
        {"q": "\"___ do you live?\"", "options": ["Where", "When", "Why"], "correct": 0},
        {"q": "\"___ does the class start?\"", "options": ["Where", "When", "Why"], "correct": 1},
        {"q": "\"___ much does it cost?\"", "options": ["How", "What", "Which"], "correct": 0},
        {"q": "Qual está correto?", "options": ["Where you live?", "Where do you live?", "Where does you live?"], "correct": 1},
    ],
    "coach_phrases": [
        "What is your name?",
        "Where do you work?",
        "Who is that man?",
        "When does the bus arrive?",
        "How do you say this in English?",
    ],
}
