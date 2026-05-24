"""Lesson 24 — Negações no Passado (Module 5)"""

LESSON = {
    "title": "Negações no passado — didn't",
    "slug": "a1-m5-past-negativa",
    "old_slug": "soa5-past-negativa",
    "module": 5,
    "icon": "NO",
    "objective": "Diga o que NÃO aconteceu ontem usando \"didn't\" — a forma seca de negar no passado. Curta, prática, universal.",
    "sections": [
        {"id": "didnt", "title": "Didn't é o universal do passado"},
    ],
    "anchor_dialog": {
        "dialogue": "I ___1___ go to school. She ___2___ the answer.",
        "blanks": [
            {"answer": "didn't", "hint": "Negação de ação no passado com \"I\": didn't ou don't?",
             "options": ["didn't", "don't", "doesn't", "wasn't"]},
            {"answer": "didn't know", "hint": "\"know\" no negativo passado: didn't know ou didn't knew?",
             "options": ["didn't know", "didn't knew", "don't know", "wasn't know"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"She ___ go home.\" (negação passado)", "options": ["didn't", "don't", "doesn't"], "correct": 0,
         "hints": ["Negação passado = didn't (qualquer sujeito)", "she didn't go", "Resposta: didn't"]},
        {"difficulty": "easy", "q": "\"I didn't ___ there.\" (be)", "options": ["was", "be", "am"], "correct": 1,
         "hints": ["Depois de didn't: verbo na base", "didn't + base (não passado)", "Resposta: be"]},
        {"difficulty": "moderate", "q": "Corrija: \"I didn't went to school.\"", "options": ["I didn't go to school.", "I didn't gone to school.", "I not went to school."], "correct": 0,
         "hints": ["didn't + base (não passado)", "❌ didn't went → ✅ didn't go", "Resposta: I didn't go to school."]},
        {"difficulty": "moderate", "q": "\"He ___ at home.\" (was, negação)", "options": ["wasn't", "weren't", "didn't was"], "correct": 0,
         "hints": ["To be no passado: was/wasn't (not didn't)", "wasn't = was not", "Resposta: wasn't"]},
        {"difficulty": "hard", "q": "\"They ___ ready.\" (were, negação)", "options": ["wasn't", "weren't", "didn't were"], "correct": 1,
         "hints": ["They = plural → were/weren't", "weren't = were not", "Lembre: they/we/you usam were no passado, então a negação é weren't. → Resposta: weren't"]},
    ],
    "final_test": [
        {"q": "\"She ___ go home.\" (negação passado)", "options": ["didn't", "don't", "doesn't"], "correct": 0},
        {"q": "\"I didn't ___ there.\" (be, base)", "options": ["was", "be", "am"], "correct": 1},
        {"q": "Corrija: \"I didn't went to school.\"", "options": ["I didn't go to school.", "I didn't gone to school.", "I not went to school."], "correct": 0},
        {"q": "\"He ___ at home.\" (was, negação)", "options": ["wasn't", "weren't", "didn't was"], "correct": 0},
        {"q": "\"They ___ ready.\" (were, negação)", "options": ["wasn't", "weren't", "didn't were"], "correct": 1},
    ],
    "coach_phrases": [
        "I didn't sleep well.",
        "She didn't see the email.",
        "We didn't go to the party.",
        "They didn't finish the work.",
        "He didn't say a word.",
    ],
}
