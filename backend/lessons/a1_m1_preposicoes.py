"""Lesson 5 — Preposições (Module 1)"""

LESSON = {
    "title": "Preposições — in, on, at e movimento",
    "slug": "a1-m1-preposicoes",
    "old_slug": "preposicoes",
    "module": 1,
    "icon": "IN",
    "objective": "Entenda a lógica das preposições de lugar (in/on/at) e tempo, mais as de movimento (to/from/into). Pare de adivinhar — use a lógica.",
    "sections": [
        {"id": "lugar", "title": "Lugar — in, on, at"},
        {"id": "tempo", "title": "Tempo — at, on, in"},
        {"id": "movimento", "title": "Movimento — to, from, into"},
    ],
    "anchor_dialog": {
        "dialogue": "I live ___1___ Brazil. My meeting is ___2___ Monday.",
        "blanks": [
            {"answer": "in", "hint": "País = dentro de → in, on ou at?",
             "options": ["in", "on", "at", "to"]},
            {"answer": "on", "hint": "Dia da semana = superfície → in, on ou at?",
             "options": ["on", "in", "at", "by"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Complete: \"I live ___ Brazil.\"", "options": ["in", "on", "at"], "correct": 0,
         "hints": ["País = área grande (dentro)", "in = dentro de um espaço/área", "Resposta: in"]},
        {"difficulty": "easy", "q": "Complete: \"The book is ___ the table.\"", "options": ["in", "on", "at"], "correct": 1,
         "hints": ["Sobre uma superfície plana", "on = em cima de, sobre", "Resposta: on"]},
        {"difficulty": "moderate", "q": "\"My meeting is ___ Monday.\" — qual preposição?", "options": ["in", "on", "at"], "correct": 1,
         "hints": ["Dia da semana: in, on ou at?", "on + dia da semana", "Resposta: on"]},
        {"difficulty": "moderate", "q": "\"Class starts ___ 9am.\" — qual preposição?", "options": ["in", "on", "at"], "correct": 2,
         "hints": ["Hora específica: in, on ou at?", "at + hora exata", "Resposta: at"]},
        {"difficulty": "hard", "q": "Qual frase usa a preposição ERRADA?", "options": ["I'll see you in Monday.", "She was born in 1990.", "The party starts at midnight."], "correct": 0,
         "hints": ["Veja cada preposição e seu uso", "Dia da semana usa \"on\", não \"in\"", "Resposta: \"in Monday\" está errado → on Monday"]},
    ],
    "final_test": [
        {"q": "\"I live ___ Brazil.\"", "options": ["on", "in", "at"], "correct": 1},
        {"q": "\"The meeting is ___ Monday.\"", "options": ["in", "on", "at"], "correct": 1},
        {"q": "\"Class starts ___ 9am.\"", "options": ["in", "on", "at"], "correct": 2},
        {"q": "\"She was born ___ 1990.\"", "options": ["on", "at", "in"], "correct": 2},
        {"q": "Qual está ERRADA?", "options": ["In the morning.", "At Monday.", "On July 4th."], "correct": 1},
    ],
    "coach_phrases": [
        "I live in Brazil.",
        "The book is on the table.",
        "She's at the office.",
        "My birthday is in May.",
        "I go to work at 8am.",
    ],
}
