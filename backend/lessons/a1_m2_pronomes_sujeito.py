"""Lesson 11 — Pronomes Sujeito (Module 2)"""

LESSON = {
    "title": "Pronomes sujeito — I, you, he, she, it, we, they",
    "slug": "a1-m2-pronomes-sujeito",
    "old_slug": "soa2-pronomes-sujeito",
    "module": 2,
    "icon": "PR",
    "objective": "Aprenda a usar os 7 pronomes sujeito com precisão: quando usar \"it\" para clima, \"they\" para grupos e evitar o erro mais comum — \"him is\" em vez de \"he is\".",
    "sections": [
        {"id": "sete-pronomes", "title": "Os 7 pronomes e seus usos"},
        {"id": "casos-especiais", "title": "Casos especiais — it e they"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ is my boss. ___2___ work together every day.",
        "blanks": [
            {"answer": "He", "hint": "Pronome sujeito masculino singular: He, Him ou His?",
             "options": ["He", "Him", "His", "She"]},
            {"answer": "We", "hint": "Pronome sujeito para \"eu e outros\": I, We ou Us?",
             "options": ["We", "Us", "They", "I"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Qual pronome substitui \"Carlos\"?", "options": ["He", "She", "They"], "correct": 0,
         "hints": ["Carlos = nome masculino", "Masculino singular = He", "Resposta: He"]},
        {"difficulty": "easy", "q": "Qual pronome para \"o cachorro\"?", "options": ["He", "She", "It"], "correct": 2,
         "hints": ["Animal (gênero não especificado) = It", "It = coisas e animais (gênero neutro)", "Resposta: It"]},
        {"difficulty": "moderate", "q": "Complete: \"___ is raining.\" — qual pronome?", "options": ["He", "It", "They"], "correct": 1,
         "hints": ["Em inglês, frases impessoais PRECISAM de sujeito", "\"It\" é usado para clima e situações impessoais", "Resposta: It"]},
        {"difficulty": "moderate", "q": "\"Ana e eu\" = ?", "options": ["I and Ana", "Me and Ana", "Ana and I"], "correct": 2,
         "hints": ["Em inglês, a educação pede que o outro venha primeiro", "Ana and I (não \"I and Ana\")", "Resposta: Ana and I"]},
        {"difficulty": "hard", "q": "Qual frase usa pronome ERRADO?", "options": ["She goes to school.", "Him is my teacher.", "They study together."], "correct": 1,
         "hints": ["Pronome vem antes do verbo = sujeito", "\"Him\" é objeto, não sujeito", "Resposta: Him is my teacher (errado — deveria ser \"He\")"]},
    ],
    "final_test": [
        {"q": "Pronome sujeito masculino singular:", "options": ["Him", "He", "His"], "correct": 1},
        {"q": "Pronome para clima/situação: \"___ is raining.\"", "options": ["He", "She", "It"], "correct": 2},
        {"q": "\"Ana e eu\" em inglês (ordem correta):", "options": ["I and Ana", "Me and Ana", "Ana and I"], "correct": 2},
        {"q": "Pronome sujeito plural (eles/elas):", "options": ["Them", "Their", "They"], "correct": 2},
        {"q": "Qual frase usa pronome errado?", "options": ["She goes to school.", "Him is my teacher.", "They study together."], "correct": 1},
    ],
    "coach_phrases": [
        "He is my boss.",
        "She lives in Rio.",
        "It is raining outside.",
        "We work together.",
        "They study English every day.",
    ],
}
