"""Lesson 16 — Terceira Pessoa S (Module 3)"""

LESSON = {
    "title": "Terceira pessoa pega o S",
    "slug": "a1-m3-third-person-s",
    "old_slug": "soa3-third-person-s",
    "module": 3,
    "icon": "VB",
    "objective": "Memorize a regra mais quebrada pelo brasileiro: ele/ela/isso (he/she/it) sempre adiciona um S no verbo. He works, she studies, it rains.",
    "sections": [
        {"id": "regra-do-s", "title": "A regra do S — sem exceções"},
    ],
    "anchor_dialog": {
        "dialogue": "He ___1___ to music. She ___2___ French.",
        "blanks": [
            {"answer": "listens", "hint": "listen + s/es/ies? \"listen\" termina em consoante comum.",
             "options": ["listens", "listen", "listenes", "listening"]},
            {"answer": "teaches", "hint": "\"teach\" termina em -ch: teach + ___?",
             "options": ["teaches", "teachs", "teach", "teached"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"work\" com \"he\" no presente simples:", "options": ["work", "works", "workies"], "correct": 1,
         "hints": ["work termina em consoante comum → +s", "work → works", "Resposta: works"]},
        {"difficulty": "easy", "q": "\"go\" com \"she\" no presente simples:", "options": ["gos", "goes", "go"], "correct": 1,
         "hints": ["go termina em -o → +es", "go → goes", "Resposta: goes"]},
        {"difficulty": "moderate", "q": "\"carry\" com \"he\":", "options": ["carrys", "carries", "carring"], "correct": 1,
         "hints": ["carry: consoante + y → ies", "carry → carries", "Resposta: carries"]},
        {"difficulty": "moderate", "q": "\"have\" com \"she\":", "options": ["haves", "hase", "has"], "correct": 2,
         "hints": ["\"have\" é irregular", "have → has (único irregular)", "Resposta: has"]},
        {"difficulty": "hard", "q": "\"She ___ (not/study) on Sundays.\"", "options": ["doesn't studies", "doesn't study", "don't study"], "correct": 1,
         "hints": ["She = doesn't. Depois de doesn't: base form", "❌ doesn't studies → ✅ doesn't study", "Resposta: doesn't study"]},
    ],
    "final_test": [
        {"q": "\"work\" com \"he\":", "options": ["work", "works", "workies"], "correct": 1},
        {"q": "\"go\" com \"she\":", "options": ["gos", "goes", "go"], "correct": 1},
        {"q": "\"carry\" com \"he\":", "options": ["carrys", "carries", "carrying"], "correct": 1},
        {"q": "\"have\" com \"she\":", "options": ["haves", "have", "has"], "correct": 2},
        {"q": "\"study\" com \"she\" (negativa):", "options": ["doesn't studies", "doesn't study", "don't studies"], "correct": 1},
    ],
    "coach_phrases": [
        "He works at a bank.",
        "She lives in Rio.",
        "It rains a lot here.",
        "My brother studies Spanish.",
        "She watches TV at night.",
    ],
}
