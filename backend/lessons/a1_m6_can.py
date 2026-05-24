"""Lesson 25 — CAN (Module 6)"""

LESSON = {
    "title": "CAN — saber e poder fazer",
    "slug": "a1-m6-can",
    "old_slug": "soa6-can",
    "module": 6,
    "icon": "VB",
    "objective": "Use \"can\" para dizer o que você sabe fazer, pode fazer ou para pedir permissão. Um dos verbos mais úteis do inglês cotidiano.",
    "sections": [
        {"id": "habilidade-permissao", "title": "Duas funções, uma palavra"},
    ],
    "anchor_dialog": {
        "dialogue": "I ___1___ swim. She ___2___ drive yet.",
        "blanks": [
            {"answer": "can", "hint": "Habilidade positiva: can ou could?",
             "options": ["can", "could", "must", "should"]},
            {"answer": "can't", "hint": "Habilidade negativa: can't ou doesn't can?",
             "options": ["can't", "doesn't can", "don't can", "mustn't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"I ___ swim.\" (habilidade positiva)", "options": ["can", "cans", "can to"], "correct": 0,
         "hints": ["Modal + base (sem to, sem -s)", "can swim (não can to swim)", "Resposta: can"]},
        {"difficulty": "easy", "q": "\"She ___ drive.\" (negação)", "options": ["can not drive", "can't drive", "doesn't can drive"], "correct": 1,
         "hints": ["can't = cannot (forma contraída)", "can't + base", "Resposta: can't drive"]},
        {"difficulty": "moderate", "q": "\"___ you help me?\" (pedido educado)", "options": ["Do", "Can", "Should"], "correct": 1,
         "hints": ["Pedido = Can ou Could (mais educado)", "Can you help me?", "Resposta: Can"]},
        {"difficulty": "moderate", "q": "\"She can ___.\" (swim, forma correta)", "options": ["swims", "swimming", "swim"], "correct": 2,
         "hints": ["Depois de modal: verbo na base", "can + swim (não can + swims)", "Resposta: swim"]},
        {"difficulty": "hard", "q": "Qual frase usa \"can\" INCORRETAMENTE?", "options": ["I can't go.", "She can swims.", "Can you open this?"], "correct": 1,
         "hints": ["Modal nunca muda o verbo que vem depois", "❌ can swims → ✅ can swim", "Modal nunca muda o verbo que segue — sem -s, sem -ed. → Resposta: She can swims. (a frase errada)"]},
    ],
    "final_test": [
        {"q": "\"I ___ swim.\"", "options": ["can", "cans", "can to"], "correct": 0},
        {"q": "\"She ___ drive.\" (negação)", "options": ["can not drive", "can't drive", "doesn't can drive"], "correct": 1},
        {"q": "\"___ you help me?\" (pedido)", "options": ["Do", "Can", "Should"], "correct": 1},
        {"q": "\"She can ___.\" (swim — forma correta)", "options": ["swims", "swimming", "swim"], "correct": 2},
        {"q": "Qual usa \"can\" INCORRETAMENTE?", "options": ["I can't go.", "She can swims.", "Can you open this?"], "correct": 1},
    ],
    "coach_phrases": [
        "I can swim.",
        "She can speak three languages.",
        "Can you help me?",
        "I can't come tomorrow.",
        "Can I open the window?",
    ],
}
