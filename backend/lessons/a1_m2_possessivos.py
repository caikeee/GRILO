"""Lesson 13 — Possessivos (Module 2)"""

LESSON = {
    "title": "Possessivos — my, your, his, her e os independentes",
    "slug": "a1-m2-possessivos",
    "old_slug": "soa2-possessivos",
    "module": 2,
    "icon": "PR",
    "objective": "Aprenda a dizer \"meu\", \"seu\", \"dele\", \"dela\" em inglês — e a diferença entre \"my bag\" (antes do objeto) e \"the bag is mine\" (sem o objeto depois).",
    "sections": [
        {"id": "lista-uso", "title": "Os possessivos e quando usar cada um"},
    ],
    "anchor_dialog": {
        "dialogue": "This is ___1___ phone. That car is ___2___.",
        "blanks": [
            {"answer": "my", "hint": "Possessivo de \"eu\" antes de substantivo: my, mine ou me?",
             "options": ["my", "mine", "me", "I"]},
            {"answer": "hers", "hint": "Possessivo de \"ela\" sem substantivo depois: her ou hers?",
             "options": ["hers", "her", "she", "his"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Complete: \"This is ___ bag.\" (minha)", "options": ["my", "mine", "me"], "correct": 0,
         "hints": ["Antes do substantivo (bag está na frase)", "my + substantivo", "Resposta: my"]},
        {"difficulty": "easy", "q": "Complete: \"The bag is ___.\" (dela)", "options": ["her", "hers", "she"], "correct": 1,
         "hints": ["O substantivo não aparece depois", "Possessivo sozinho = hers (not her)", "Resposta: hers"]},
        {"difficulty": "moderate", "q": "Complete: \"___ car is fast.\" (dele)", "options": ["Him", "His", "He"], "correct": 1,
         "hints": ["Possessivo de he: His + substantivo", "\"Him\" é objeto, não possessivo", "Resposta: His"]},
        {"difficulty": "moderate", "q": "\"This coffee is ___.\" (seu, informal, de você)", "options": ["your", "yours", "you"], "correct": 1,
         "hints": ["Possessivo sem substantivo = yours", "your bag = yours (sem bag)", "Resposta: yours"]},
        {"difficulty": "hard", "q": "Qual frase está correta?", "options": ["That is their house.", "That is theirs house.", "That house is their."], "correct": 0,
         "hints": ["their + substantivo = possessivo adj", "\"theirs\" fica sozinho (sem substantivo depois)", "Resposta: That is their house."]},
    ],
    "final_test": [
        {"q": "\"This is ___ bag.\" (minha)", "options": ["my", "mine", "me"], "correct": 0},
        {"q": "\"The bag is ___.\" (dela)", "options": ["her", "hers", "she"], "correct": 1},
        {"q": "\"___ car is fast.\" (dele)", "options": ["Him", "His", "He"], "correct": 1},
        {"q": "\"That coffee is ___.\" (seu, de você)", "options": ["your", "yours", "you"], "correct": 1},
        {"q": "Qual está correto?", "options": ["That is theirs house.", "That is their house.", "That house is their."], "correct": 1},
    ],
    "coach_phrases": [
        "This is my phone.",
        "Your idea is great.",
        "His name is John.",
        "Her car is new.",
        "The bag is hers, not mine.",
    ],
}
