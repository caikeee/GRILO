"""Lesson 14 — This, That, These, Those (Module 2)"""

LESSON = {
    "title": "This, That, These, Those — apontando objetos",
    "slug": "a1-m2-this-that",
    "old_slug": "soa2-this-that",
    "module": 2,
    "icon": "PR",
    "objective": "Aprenda a apontar para coisas em inglês com a distância e quantidade certas: perto/longe, um/vários. This, that, these, those.",
    "sections": [
        {"id": "quatro-formas", "title": "Quatro palavras, duas dimensões"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ is my bag (aqui). ___2___ are your keys (ali).",
        "blanks": [
            {"answer": "This", "hint": "Coisa perto, singular: this ou these?",
             "options": ["This", "These", "That", "Those"]},
            {"answer": "Those", "hint": "Coisas longe, plural: that ou those?",
             "options": ["Those", "That", "These", "This"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Objeto perto de você, singular:", "options": ["this", "these", "that"], "correct": 0,
         "hints": ["Perto = this (singular) ou these (plural)", "Singular + perto = this", "Resposta: this"]},
        {"difficulty": "easy", "q": "Coisas longe, no plural:", "options": ["this", "those", "that"], "correct": 1,
         "hints": ["Longe plural = those", "\"those\" = plural de \"that\"", "Resposta: those"]},
        {"difficulty": "moderate", "q": "\"___ are my keys.\" (aqui, plural)", "options": ["This", "These", "Those"], "correct": 1,
         "hints": ["Perto + plural = these", "\"keys\" é plural", "Resposta: These"]},
        {"difficulty": "moderate", "q": "\"___ is your car?\" \"The blue one.\" — qual demonstrativo?", "options": ["What", "Which", "That"], "correct": 1,
         "hints": ["Escolha entre opções específicas = which", "which = qual (entre opções)", "Resposta: Which"]},
        {"difficulty": "hard", "q": "\"Is ___ your coffee?\" \"No, ___ is mine.\" (longe/perto)", "options": ["that / this", "this / that", "those / these"], "correct": 0,
         "hints": ["1ª: longe (pointing at the cup) = that", "2ª: perto (pointing at yours) = this", "Resposta: that / this"]},
    ],
    "final_test": [
        {"q": "Objeto perto, singular:", "options": ["this", "these", "that"], "correct": 0},
        {"q": "Objetos longe, plural:", "options": ["this", "that", "those"], "correct": 2},
        {"q": "\"___ are my keys.\" (aqui, plural)", "options": ["This", "These", "Those"], "correct": 1},
        {"q": "\"___ is your bag?\" — escolha entre opções", "options": ["What", "Which", "That"], "correct": 1},
        {"q": "\"Is ___ your car?\" (longe)", "options": ["this", "these", "that"], "correct": 2},
    ],
    "coach_phrases": [
        "This is my book.",
        "That car is fast.",
        "These shoes are new.",
        "Those people are friends.",
        "What is that?",
    ],
}
