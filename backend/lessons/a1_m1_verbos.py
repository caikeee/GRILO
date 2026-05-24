"""Lesson 6 — Verbos (Module 1)"""

LESSON = {
    "title": "Verbos essenciais — to be, modais e phrasals",
    "slug": "a1-m1-verbos",
    "old_slug": "verbos",
    "module": 1,
    "icon": "VB",
    "objective": "Domine o verbo mais importante do inglês (to be) e os modais que mudam o tom de cada frase: can, must, should, would. Mais os phrasal verbs mais usados.",
    "sections": [
        {"id": "tobe", "title": "To be — identidade e estado"},
        {"id": "modais", "title": "Modais — can, must, should, would"},
        {"id": "phrasals", "title": "Phrasal verbs — look up, give up e mais"},
    ],
    "anchor_dialog": {
        "dialogue": "She ___1___ a teacher. I ___2___ drive a car.",
        "blanks": [
            {"answer": "is", "hint": "Conjugação de \"to be\" com \"she\": am, is ou are?",
             "options": ["is", "am", "are", "be"]},
            {"answer": "can", "hint": "Habilidade/possibilidade: qual modal usar?",
             "options": ["can", "must", "should", "will"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Complete: \"She ___ a teacher.\" (to be, presente)", "options": ["am", "is", "are"], "correct": 1,
         "hints": ["To be com \"she\" (3ª pessoa)", "she = is", "Resposta: is"]},
        {"difficulty": "easy", "q": "\"I ___ swim.\" — qual modal para habilidade?", "options": ["can", "must", "should"], "correct": 0,
         "hints": ["Habilidade/capacidade: can, must ou should?", "can = conseguir fazer algo", "Resposta: can"]},
        {"difficulty": "moderate", "q": "Qual frase expressa conselho?", "options": ["You must stop.", "You should rest.", "You can go."], "correct": 1,
         "hints": ["must = obrigação forte. can = possibilidade.", "should = conselho suave", "Resposta: You should rest."]},
        {"difficulty": "moderate", "q": "\"Look ___ the word in the dictionary.\" (phrasal)", "options": ["up", "at", "on"], "correct": 0,
         "hints": ["Phrasal verb: buscar informação = look ___", "look up = pesquisar/consultar", "Resposta: up"]},
        {"difficulty": "hard", "q": "Qual frase usa o modal corretamente?", "options": ["She can to swim.", "She can swims.", "She can swim."], "correct": 2,
         "hints": ["Depois de modal (can/must/should), o verbo fica na base", "❌ can to swim / can swims → ✅ can swim", "Resposta: She can swim."]},
    ],
    "final_test": [
        {"q": "\"She ___ a doctor.\" (to be, presente)", "options": ["am", "is", "are"], "correct": 1},
        {"q": "\"I ___ swim.\" (habilidade)", "options": ["can", "must", "should"], "correct": 0},
        {"q": "\"You ___ rest.\" (conselho suave)", "options": ["must", "should", "can"], "correct": 1},
        {"q": "\"Look ___ the word.\" (phrasal: pesquisar)", "options": ["at", "up", "on"], "correct": 1},
        {"q": "Modal + verbo: qual está certo?", "options": ["She can swims.", "She can swim.", "She cans swim."], "correct": 1},
    ],
    "coach_phrases": [
        "I'm a student.",
        "She's tired.",
        "I can swim.",
        "You should rest.",
        "Look it up online.",
    ],
}
