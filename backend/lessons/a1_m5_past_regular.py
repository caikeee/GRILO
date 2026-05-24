"""Lesson 22 — Past Simple Regular (Module 5)"""

LESSON = {
    "title": "Past simple — verbos regulares (-ed)",
    "slug": "a1-m5-past-regular",
    "old_slug": "soa5-past-regular",
    "module": 5,
    "icon": "PA",
    "objective": "Aprenda a contar o que aconteceu ontem com a regra mais simples do passado: adicione -ed no verbo. Worked, studied, played.",
    "sections": [
        {"id": "regra-ed", "title": "A regra principal: verbo + ED"},
    ],
    "anchor_dialog": {
        "dialogue": "Yesterday I ___1___ to the gym. She ___2___ the report.",
        "blanks": [
            {"answer": "walked", "hint": "\"walk\" no passado regular: walk + _____?",
             "options": ["walked", "walk", "walkt", "walking"]},
            {"answer": "finished", "hint": "\"finish\" no passado regular: finish + _____?",
             "options": ["finished", "finish", "finishs", "finishing"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"walk\" no passado regular:", "options": ["walkt", "walked", "walking"], "correct": 1,
         "hints": ["Verbo regular: base + ed", "walk → walked", "Resposta: walked"]},
        {"difficulty": "easy", "q": "\"love\" no passado:", "options": ["loved", "loveed", "lovet"], "correct": 0,
         "hints": ["Termina em -e: base + d (apenas d)", "love → loved", "Resposta: loved"]},
        {"difficulty": "moderate", "q": "\"stop\" no passado (vogal+consoante breve):", "options": ["stoped", "stopped", "stopd"], "correct": 1,
         "hints": ["CVC curto: dobrar a consoante + ed", "stop → stopped", "Resposta: stopped"]},
        {"difficulty": "moderate", "q": "\"study\" no passado:", "options": ["studyed", "studid", "studied"], "correct": 2,
         "hints": ["consoante + y → ied", "study → studied", "Resposta: studied"]},
        {"difficulty": "hard", "q": "\"walked\" se pronuncia como:", "options": ["/walkɛd/", "/walkt/", "/walkd/"], "correct": 1,
         "hints": ["Após som surdo (k), -ed soa /t/", "walked = /walkt/", "Resposta: /walkt/"]},
    ],
    "final_test": [
        {"q": "\"walk\" no passado:", "options": ["walkt", "walked", "walking"], "correct": 1},
        {"q": "\"love\" no passado:", "options": ["loved", "loveed", "lovet"], "correct": 0},
        {"q": "\"stop\" no passado:", "options": ["stoped", "stopped", "stopd"], "correct": 1},
        {"q": "\"study\" no passado:", "options": ["studyed", "studied", "studid"], "correct": 1},
        {"q": "\"walked\" se pronuncia como:", "options": ["/walkɛd/", "/walkt/", "/walkd/"], "correct": 1},
    ],
    "coach_phrases": [
        "I worked yesterday.",
        "She studied for the test.",
        "They played football.",
        "We talked for hours.",
        "He stopped at the red light.",
    ],
}
