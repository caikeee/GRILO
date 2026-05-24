"""Lesson 21 — Rotina (Module 4)"""

LESSON = {
    "title": "Vocabulário de rotina e lugares",
    "slug": "a1-m4-rotina",
    "old_slug": "soa4-rotina",
    "module": 4,
    "icon": "PR",
    "objective": "Construa o repertório de palavras que sustentam qualquer conversa sobre o dia a dia: home, work, gym, school + os verbos da rotina.",
    "sections": [
        {"id": "lugares-verbos", "title": "Os lugares e os verbos que andam com eles"},
        {"id": "descrevendo-rotina", "title": "Descrevendo um dia completo em inglês"},
    ],
    "anchor_dialog": {
        "dialogue": "I ___1___ up at 7am. Then I ___2___ breakfast.",
        "blanks": [
            {"answer": "wake", "hint": "Verbo de rotina para começar o dia: wake ou woke?",
             "options": ["wake", "woke", "get", "stand"]},
            {"answer": "have", "hint": "\"Tomar café da manhã\" em inglês: have ou eat breakfast?",
             "options": ["have", "eat", "do", "make"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "\"Acordar\" em inglês:", "options": ["wake up", "get up", "stand up"], "correct": 0,
         "hints": ["Wake up = acordar (abrir os olhos)", "wake up ≠ get up (get up = sair da cama)", "Resposta: wake up"]},
        {"difficulty": "easy", "q": "\"Tomar café da manhã\" em inglês:", "options": ["eat breakfast", "have breakfast", "do breakfast"], "correct": 1,
         "hints": ["Em inglês, usa \"have\" para refeições", "have breakfast / lunch / dinner", "Resposta: have breakfast"]},
        {"difficulty": "moderate", "q": "\"She ___ to work at 8.\" (go, present simple, she)", "options": ["go", "goes", "is going"], "correct": 1,
         "hints": ["She + go → goes (3ª pessoa)", "Hábito de rotina = present simple", "Resposta: goes"]},
        {"difficulty": "moderate", "q": "\"I ___ home at 6pm.\" (come)", "options": ["come", "comes", "go"], "correct": 0,
         "hints": ["I = sem -s", "come home (não go home — já estou vindo)", "Resposta: come"]},
        {"difficulty": "hard", "q": "Descreva sua rotina: \"Eu sempre _____ às 7h e _____ às 23h.\"", "options": ["wake up / go to bed", "wakes up / go to bed", "wake up / sleep"], "correct": 0,
         "hints": ["I (sem -s) + wake up. go to bed = dormir formalmente.", "I wake up... I go to bed", "Resposta: wake up / go to bed"]},
    ],
    "final_test": [
        {"q": "\"Acordar\" em inglês:", "options": ["get up", "wake up", "stand up"], "correct": 1},
        {"q": "\"Tomar café\" = have ou eat?", "options": ["eat breakfast", "have breakfast", "do breakfast"], "correct": 1},
        {"q": "\"She ___ to work at 8.\" (go, presente, she)", "options": ["go", "goes", "going"], "correct": 1},
        {"q": "\"I ___ home at 6.\" (come, presente, I)", "options": ["come", "comes", "go"], "correct": 0},
        {"q": "\"Ir dormir\" em inglês:", "options": ["go to sleep", "go to bed", "Ambas corretas"], "correct": 2},
    ],
    "coach_phrases": [
        "I go to work at 8am.",
        "She goes home at 6.",
        "We stay home on Sundays.",
        "I arrive at the office at 9.",
        "First, I wake up and make coffee.",
    ],
}
