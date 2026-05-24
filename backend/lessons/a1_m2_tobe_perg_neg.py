"""Lesson 12 — To Be Perguntas e Negativas (Module 2)"""

LESSON = {
    "title": "To be — perguntas e negativas",
    "slug": "a1-m2-tobe-perg-neg",
    "old_slug": "soa2-tobe-perg-neg",
    "module": 2,
    "icon": "BE",
    "objective": "Aprenda a perguntar e negar com to be: Is she...? / She isn't... / Are they...? / They aren't... Sem precisar de do/does — o to be se vira sozinho.",
    "sections": [
        {"id": "perguntas", "title": "Perguntas com to be — inversão simples"},
        {"id": "negativas", "title": "Negativas — isn't, aren't, I'm not"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ she from Brazil? No, she ___2___.",
        "blanks": [
            {"answer": "Is", "hint": "Para perguntar com \"she\" usando to be, qual palavra vem primeiro?",
             "options": ["Is", "Are", "Does", "Do"]},
            {"answer": "isn't", "hint": "Resposta negativa curta com \"she\": \"No, she ___\"",
             "options": ["isn't", "aren't", "don't", "doesn't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Como perguntar \"Ela é professora?\"", "options": ["She is a teacher?", "Is she a teacher?", "Does she is a teacher?"], "correct": 1,
         "hints": ["Pergunta com to be: invertemos sujeito e verbo", "Is + she + ...?", "Resposta: Is she a teacher?"]},
        {"difficulty": "easy", "q": "Complete a negativa: \"They ___ from here.\"", "options": ["isn't", "aren't", "don't"], "correct": 1,
         "hints": ["They = plural → are/aren't", "aren't = are not", "Resposta: aren't"]},
        {"difficulty": "moderate", "q": "Responda negativamente: \"Is he at home?\"", "options": ["No, he don't.", "No, he isn't.", "No, he aren't."], "correct": 1,
         "hints": ["He = singular → is/isn't", "Short answer: No, he isn't.", "Resposta: No, he isn't."]},
        {"difficulty": "moderate", "q": "Qual pergunta está correta?", "options": ["Are they happy?", "They are happy?", "Do they are happy?"], "correct": 0,
         "hints": ["Com to be, inverte sujeito e verbo", "\"Do\" não se usa com to be", "Resposta: Are they happy?"]},
        {"difficulty": "hard", "q": "Traduza: \"Você não está cansado, está?\"", "options": ["You aren't tired, are you?", "You aren't tired, isn't it?", "You don't tired, are you?"], "correct": 0,
         "hints": ["Tag question: frase negativa → tag positiva", "\"aren't you?\" espelha \"you aren't\"", "Resposta: You aren't tired, are you?"]},
    ],
    "final_test": [
        {"q": "\"___ she at home?\" (pergunta)", "options": ["Do", "Is", "Are"], "correct": 1},
        {"q": "\"They ___ from here.\" (negativa)", "options": ["isn't", "aren't", "don't"], "correct": 1},
        {"q": "Resposta negativa: \"Is he tired?\"", "options": ["No, he don't.", "No, he isn't.", "No, he aren't."], "correct": 1},
        {"q": "\"Are you ready?\" — resposta positiva curta:", "options": ["Yes, I am.", "Yes, I do.", "Yes, I be."], "correct": 0},
        {"q": "Qual pergunta está correta?", "options": ["They are ready?", "Are they ready?", "Do they are ready?"], "correct": 1},
    ],
    "coach_phrases": [
        "Is she from Brazil?",
        "No, she isn't.",
        "Are they ready?",
        "We aren't from here.",
        "It's cold today, isn't it?",
    ],
}
