"""Lesson 1 — Pronomes (Module 1)"""

LESSON = {
    "title": "Pronomes — quem faz, quem recebe, de quem é",
    "slug": "a1-m1-pronomes",
    "old_slug": "pronomes",
    "module": 1,
    "icon": "PR",
    "objective": "Entenda os três papéis dos pronomes: sujeito (quem faz), objeto (quem recebe) e possessivo (de quem é). Sem decorar listas — com lógica de uso real.",
    "sections": [
        {"id": "quem-faz", "title": "Quem faz a ação — pronomes sujeito"},
        {"id": "quem-recebe", "title": "Quem recebe a ação — pronomes objeto"},
        {"id": "de-quem-e", "title": "De quem é — pronomes possessivos"},
    ],
    "anchor_dialog": {
        "dialogue": "I see that ___1___ are going to the park. Can you come with ___2___?",
        "blanks": [
            {"answer": "you", "hint": "Quem vai ao parque? Sujeito antes do verbo = você."},
            {"answer": "me", "hint": "Depois de preposição \"with\": \"come with _____.\""},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Complete: \"___ am Brazilian.\"", "options": ["I", "Me", "My"], "correct": 0,
         "hints": ["Use sujeito antes do verbo", "I = I act. Me = someone acts on me.", "Resposta: I"]},
        {"difficulty": "easy", "q": "Complete: \"She called ___\"", "options": ["I", "Me", "My"], "correct": 1,
         "hints": ["Use objeto depois do verbo", "After a verb = object", "Resposta: Me"]},
        {"difficulty": "moderate", "q": "\"with you and ___\" — qual usar?", "options": ["I", "Me", "My"], "correct": 1,
         "hints": ["Preposição (with) + objeto", "Teste: \"with me\" vs \"with I\"", "Resposta: Me"]},
        {"difficulty": "moderate", "q": "Qual frase está correta?", "options": ["Her lives here.", "She lives here.", "Her is here."], "correct": 1,
         "hints": ["Quem faz a ação? → subject", "Subject: I, you, he, she", "Resposta: She lives here."]},
        {"difficulty": "hard", "q": "Complete a frase: \"___ enjoy cooking. Can you help ___?\"", "options": ["I / I", "Me / me", "I / me"], "correct": 2,
         "hints": ["1ª lacuna: sujeito antes do verbo", "2ª lacuna: objeto depois do verbo", "1ª: antes do verbo = sujeito (I). 2ª: depois do verbo = objeto (me). → Resposta: I / me"]},
    ],
    "final_test": [
        {"q": "Em \"She calls me\", qual é a função de \"me\"?", "options": ["Sujeito", "Objeto", "Possessivo"], "correct": 1},
        {"q": "\"This is for I\" — o que está errado?", "options": ["Nada, está correto", "Deveria ser \"for me\"", "Falta o verbo"], "correct": 1},
        {"q": "Complete: \"___ am going to the party.\"", "options": ["Me", "I", "My"], "correct": 1},
        {"q": "\"The bag is ___.\" (dela)", "options": ["her", "hers", "she"], "correct": 1},
        {"q": "Qual frase está correta?", "options": ["Him is my boss.", "He is my boss.", "His is my boss."], "correct": 1},
    ],
    "coach_phrases": [
        "I work every day.",
        "She called me yesterday.",
        "Can you help us?",
        "This is my phone.",
        "The bag is hers.",
    ],
}
