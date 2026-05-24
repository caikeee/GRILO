"""Lesson 18 — Frequência (Module 3)"""

LESSON = {
    "title": "Frequência — sempre, às vezes, nunca",
    "slug": "a1-m3-frequencia",
    "old_slug": "soa3-frequencia",
    "module": 3,
    "icon": "NO",
    "objective": "Aprenda a dizer com que frequência você faz cada coisa: always, often, sometimes, never. E onde colocar essas palavras na frase.",
    "sections": [
        {"id": "escala", "title": "A escala dos advérbios"},
    ],
    "anchor_dialog": {
        "dialogue": "She ___1___ wakes up early. I ___2___ forget my keys.",
        "blanks": [
            {"answer": "always", "hint": "Frequência máxima, 100% das vezes: never, always ou sometimes?",
             "options": ["always", "never", "sometimes", "usually"]},
            {"answer": "never", "hint": "Frequência zero: always, never ou usually?",
             "options": ["never", "always", "often", "rarely"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Onde vai o advérbio? \"I ___ wake up early.\" (always)", "options": ["always / antes do verbo", "always / depois do verbo", "always / no final"], "correct": 0,
         "hints": ["always/never/usually vão ANTES do verbo principal", "I always wake up...", "Resposta: antes do verbo"]},
        {"difficulty": "easy", "q": "\"She is ___ late.\" — onde vai \"never\"?", "options": ["never / antes de is", "never / depois de is", "never / no início"], "correct": 1,
         "hints": ["Depois de to be, o advérbio vai depois", "She is never late.", "Resposta: depois de is"]},
        {"difficulty": "moderate", "q": "Qual frase está correta?", "options": ["He goes always to the gym.", "He always goes to the gym.", "Always he goes to the gym."], "correct": 1,
         "hints": ["Posição padrão: antes do verbo principal", "He always goes", "Resposta: He always goes to the gym."]},
        {"difficulty": "moderate", "q": "\"I eat ___ at home.\" — frequência ~40%:", "options": ["always", "never", "sometimes"], "correct": 2,
         "hints": ["~40% = sometimes", "sometimes = às vezes", "Resposta: sometimes"]},
        {"difficulty": "hard", "q": "Traduza: \"Ela raramente reclama.\"", "options": ["She always complains.", "She rarely complains.", "She not complains."], "correct": 1,
         "hints": ["raramente = rarely / seldom", "She rarely complains.", "Resposta: She rarely complains."]},
    ],
    "final_test": [
        {"q": "Posição de \"always\": \"I ___ wake up early.\"", "options": ["always (antes)", "always (depois)", "always (final)"], "correct": 0},
        {"q": "\"She is ___ late.\" — \"never\" vai:", "options": ["antes de is", "depois de is", "no final"], "correct": 1},
        {"q": "Frequência ~40%:", "options": ["always", "never", "sometimes"], "correct": 2},
        {"q": "\"She ___ complains.\" (raramente)", "options": ["rarely complains", "complains rarely", "never complains"], "correct": 0},
        {"q": "Qual frase está correta?", "options": ["He goes always to the gym.", "He always goes to the gym.", "Always he goes to the gym."], "correct": 1},
    ],
    "coach_phrases": [
        "I always brush my teeth.",
        "She usually wakes up at 7.",
        "We often go to the beach.",
        "Sometimes I work late.",
        "He is never late.",
    ],
}
