"""Lesson 3 — Negativa (Module 1)"""

LESSON = {
    "title": "Negativa — como dizer NÃO em inglês",
    "slug": "a1-m1-negativa",
    "old_slug": "negativa",
    "module": 1,
    "icon": "NO",
    "objective": "Domine as três formas de negar: com to be (isn't/aren't), com ações no presente (don't/doesn't) e no passado (didn't). Mais a negação com never, nobody, nothing.",
    "sections": [
        {"id": "tobe-neg", "title": "Negar com to be — isn't, aren't"},
        {"id": "acoes-neg", "title": "Negar ações — don't, doesn't"},
        {"id": "passado-neg", "title": "Negar no passado — didn't"},
        {"id": "never-nobody", "title": "Never, nobody, nothing"},
    ],
    "anchor_dialog": {
        "dialogue": "She ___1___ eat meat. They ___2___ happy.",
        "blanks": [
            {"answer": "doesn't", "hint": "Negar ação de \"she\" no presente: don't ou doesn't?",
             "options": ["doesn't", "don't", "isn't", "wasn't"]},
            {"answer": "aren't", "hint": "Negar estado com \"they\" usando to be: isn't ou aren't?",
             "options": ["aren't", "isn't", "don't", "weren't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Negue: \"She is a doctor.\"", "options": ["She isn't a doctor.", "She don't a doctor.", "She doesn't a doctor."], "correct": 0,
         "hints": ["To be se nega sozinho: is + not", "isn't = is not (forma contraída)", "Resposta: She isn't a doctor."]},
        {"difficulty": "easy", "q": "Complete: \"I ___ eat meat.\" (presente, hábito)", "options": ["don't", "doesn't", "isn't"], "correct": 0,
         "hints": ["Negar ação com \"I\": don't ou doesn't?", "I/you/we/they = don't", "Resposta: don't"]},
        {"difficulty": "moderate", "q": "Corrija: \"She doesn't likes coffee.\"", "options": ["She don't like coffee.", "She doesn't like coffee.", "She isn't like coffee."], "correct": 1,
         "hints": ["Depois de \"doesn't\", o verbo volta à base", "❌ doesn't likes → ✅ doesn't like", "Resposta: She doesn't like coffee."]},
        {"difficulty": "moderate", "q": "Negue no passado: \"He went home.\"", "options": ["He didn't went home.", "He doesn't go home.", "He didn't go home."], "correct": 2,
         "hints": ["Passado negativo: didn't + base", "didn't já carrega o passado — verbo fica na base", "Resposta: He didn't go home."]},
        {"difficulty": "hard", "q": "Qual frase está correta em inglês padrão?", "options": ["I don't know nothing.", "I never know nothing.", "I don't know anything."], "correct": 2,
         "hints": ["Inglês evita dupla negação", "\"don't + anything\" = negação correta", "Resposta: I don't know anything."]},
    ],
    "final_test": [
        {"q": "\"She ___ like coffee.\" — presente, ação", "options": ["don't", "doesn't", "isn't"], "correct": 1},
        {"q": "Corrija: \"She doesn't likes pizza.\"", "options": ["She don't like pizza.", "She doesn't like pizza.", "She isn't like pizza."], "correct": 1},
        {"q": "Negar no passado: \"He went home.\"", "options": ["He didn't went home.", "He didn't go home.", "He don't go home."], "correct": 1},
        {"q": "\"I ___ know anything.\" (nunca) — forma correta", "options": ["don't never know", "never know", "never knew"], "correct": 1},
        {"q": "Qual usa dupla negação (errada em inglês padrão)?", "options": ["I don't know anything.", "I never eat meat.", "I don't know nothing."], "correct": 2},
    ],
    "coach_phrases": [
        "I'm not ready yet.",
        "She doesn't like loud music.",
        "I didn't sleep well.",
        "I never drink soda.",
        "There's nothing in the fridge.",
    ],
}
