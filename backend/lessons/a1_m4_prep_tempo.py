"""Lesson 20 — Preposições de Tempo (Module 4)"""

LESSON = {
    "title": "Preposições de tempo — at, on, in",
    "slug": "a1-m4-prep-tempo",
    "old_slug": "soa4-prep-tempo",
    "module": 4,
    "icon": "IN",
    "objective": "Aprenda a lógica das três preposições que organizam o tempo em inglês: at para horas, on para dias, in para meses e anos.",
    "sections": [
        {"id": "logica-tempo", "title": "A regra dos três níveis"},
    ],
    "anchor_dialog": {
        "dialogue": "My birthday is ___1___ July. The class is ___2___ 3pm.",
        "blanks": [
            {"answer": "in", "hint": "Mês = período amplo: in, on ou at?",
             "options": ["in", "on", "at", "by"]},
            {"answer": "at", "hint": "Hora exata: in, on ou at?",
             "options": ["at", "in", "on", "for"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"My birthday is ___ July.\"", "options": ["in", "on", "at"], "correct": 0,
         "hints": ["Mês = período amplo", "in + mês", "Resposta: in"]},
        {"difficulty": "easy", "q": "\"The meeting is ___ Monday.\"", "options": ["in", "on", "at"], "correct": 1,
         "hints": ["Dia da semana = on", "on + dia", "Resposta: on"]},
        {"difficulty": "moderate", "q": "\"Class starts ___ 9am.\"", "options": ["in", "on", "at"], "correct": 2,
         "hints": ["Hora específica = at", "at + hora", "Resposta: at"]},
        {"difficulty": "moderate", "q": "\"I study ___ the morning.\"", "options": ["in", "on", "at"], "correct": 0,
         "hints": ["Período do dia: morning/afternoon/evening = in", "in the morning / afternoon / evening", "Resposta: in"]},
        {"difficulty": "hard", "q": "\"She works ___ night.\" — exceção!", "options": ["in", "on", "at"], "correct": 2,
         "hints": ["night é exceção: usa \"at\" (não \"in\")", "at night (exceção ao padrão)", "Resposta: at"]},
    ],
    "final_test": [
        {"q": "\"My birthday is ___ July.\"", "options": ["in", "on", "at"], "correct": 0},
        {"q": "\"The meeting is ___ Monday.\"", "options": ["in", "on", "at"], "correct": 1},
        {"q": "\"Class starts ___ 9am.\"", "options": ["in", "on", "at"], "correct": 2},
        {"q": "\"I study ___ the morning.\"", "options": ["in", "on", "at"], "correct": 0},
        {"q": "\"She studies ___ night.\" (exceção!)", "options": ["in", "on", "at"], "correct": 2},
    ],
    "coach_phrases": [
        "The meeting is at 3pm.",
        "I work on Monday.",
        "My birthday is in May.",
        "See you at noon.",
        "I exercise in the morning.",
    ],
}
