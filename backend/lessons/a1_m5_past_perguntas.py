"""Lesson 23 — Perguntas no Passado (Module 5)"""

LESSON = {
    "title": "Perguntas no passado — Did you?",
    "slug": "a1-m5-past-perguntas",
    "old_slug": "soa5-past-perguntas",
    "module": 5,
    "icon": "Q?",
    "objective": "Aprenda a perguntar sobre o passado com \"did\" — o auxiliar que abre qualquer pergunta sobre o que aconteceu.",
    "sections": [
        {"id": "did-base", "title": "O auxiliar \"did\" abre a pergunta"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ you sleep well? No, I ___2___.",
        "blanks": [
            {"answer": "Did", "hint": "Para perguntas no passado simples, qual auxiliar usar: Did ou Does?",
             "options": ["Did", "Does", "Do", "Was"]},
            {"answer": "didn't", "hint": "Resposta negativa no passado: \"No, I ___\"",
             "options": ["didn't", "don't", "doesn't", "wasn't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"___ you sleep well?\" — passado", "options": ["Do", "Does", "Did"], "correct": 2,
         "hints": ["Passado = Did, para todos", "Did + sujeito + base", "Resposta: Did"]},
        {"difficulty": "easy", "q": "\"___ she call you?\" — passado", "options": ["Do", "Does", "Did"], "correct": 2,
         "hints": ["Passado: always Did", "Did (não Does) no passado", "Resposta: Did"]},
        {"difficulty": "moderate", "q": "\"Where ___ you go yesterday?\"", "options": ["do", "does", "did"], "correct": 2,
         "hints": ["yesterday = passado", "wh- + did + sujeito + base", "Resposta: did"]},
        {"difficulty": "moderate", "q": "Resposta negativa a \"Did he come?\"", "options": ["No, he didn't.", "No, he don't.", "No, he doesn't."], "correct": 0,
         "hints": ["Negativo passado = didn't", "No, he didn't.", "Resposta: No, he didn't."]},
        {"difficulty": "hard", "q": "\"Was she at the party?\" — qual resposta curta positiva?", "options": ["Yes, she was.", "Yes, she did.", "Yes, she is."], "correct": 0,
         "hints": ["was/were = to be no passado", "Curta: Yes, she was. (espelha o was da pergunta)", "Resposta: Yes, she was."]},
    ],
    "final_test": [
        {"q": "\"___ you sleep well?\" (passado)", "options": ["Do", "Does", "Did"], "correct": 2},
        {"q": "\"___ she call you?\" (passado)", "options": ["Do", "Does", "Did"], "correct": 2},
        {"q": "\"Where ___ you go yesterday?\"", "options": ["do", "does", "did"], "correct": 2},
        {"q": "Resposta negativa: \"Did he come?\"", "options": ["No, he don't.", "No, he didn't.", "No, he doesn't."], "correct": 1},
        {"q": "\"Was she at the party?\" — resposta positiva:", "options": ["Yes, she was.", "Yes, she did.", "Yes, she is."], "correct": 0},
    ],
    "coach_phrases": [
        "Did you sleep well?",
        "Did she call you?",
        "What did you do yesterday?",
        "Where did he go?",
        "Yes, I did. No, I didn't.",
    ],
}
