"""Lesson 4 — Passado (Module 1)"""

LESSON = {
    "title": "Passado — contar o que aconteceu",
    "slug": "a1-m1-passado",
    "old_slug": "passado",
    "module": 1,
    "icon": "PA",
    "objective": "Aprenda a narrar eventos passados com verbos regulares (-ed) e os irregulares mais usados. Do passado simples ao que estava acontecendo.",
    "sections": [
        {"id": "regular-ed", "title": "Verbos regulares — base + ED"},
        {"id": "irregulares", "title": "Verbos irregulares — os mais usados"},
        {"id": "estava-acontecendo", "title": "O que estava acontecendo — was/were + -ing"},
    ],
    "anchor_dialog": {
        "dialogue": "Yesterday I ___1___ to the store. She ___2___ there.",
        "blanks": [
            {"answer": "went", "hint": "Passado de \"go\" (irregular): \"go\" → \"_____\"",
             "options": ["went", "goed", "go", "gone"]},
            {"answer": "wasn't", "hint": "Negar \"she was\": forma contraída negativa.",
             "options": ["wasn't", "weren't", "didn't", "isn't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Qual é o passado de \"go\"?", "options": ["goed", "went", "gone"], "correct": 1,
         "hints": ["\"go\" é irregular — não aceita -ed", "go → went (decorar!)", "Resposta: went"]},
        {"difficulty": "easy", "q": "Complete: \"Yesterday she ___ to work.\" (walk, passado regular)", "options": ["walks", "walked", "walking"], "correct": 1,
         "hints": ["\"Walk\" é regular: walk + ed", "Passado regular = base + -ed", "Resposta: walked"]},
        {"difficulty": "moderate", "q": "Qual é o passado de \"have\"?", "options": ["haved", "had", "has"], "correct": 1,
         "hints": ["\"have\" é irregular", "have → had", "Resposta: had"]},
        {"difficulty": "moderate", "q": "Complete: \"I ___ (not/go) to the party.\"", "options": ["didn't went", "didn't go", "don't went"], "correct": 1,
         "hints": ["Negação passado: didn't + base", "❌ didn't went → ✅ didn't go", "Resposta: didn't go"]},
        {"difficulty": "hard", "q": "\"She was working when I ___.\" (arrive)", "options": ["arrive", "arrived", "was arriving"], "correct": 1,
         "hints": ["Ação que interrompeu = past simple", "\"when I arrived\" = ação pontual no passado", "Resposta: arrived"]},
    ],
    "final_test": [
        {"q": "Passado de \"go\":", "options": ["goed", "went", "gone"], "correct": 1},
        {"q": "\"I ___ (not/eat) breakfast today.\"", "options": ["didn't ate", "didn't eat", "don't eat"], "correct": 1},
        {"q": "Passado de \"have\":", "options": ["haved", "had", "has"], "correct": 1},
        {"q": "\"She ___ working when I arrived.\" (was/were)", "options": ["were", "was", "is"], "correct": 1},
        {"q": "\"Did he call?\" — resposta negativa curta:", "options": ["No, he don't.", "No, he didn't.", "No, he doesn't."], "correct": 1},
    ],
    "coach_phrases": [
        "I walked to work yesterday.",
        "She cooked dinner last night.",
        "I went to the mall.",
        "She was cooking when he arrived.",
        "What were you doing when I called?",
    ],
}
