"""Lesson 8 — Números (Module 2)"""

LESSON = {
    "title": "Números — 1 a 1000 e ordinais",
    "slug": "a1-m2-numeros",
    "old_slug": "soa1-numeros",
    "module": 2,
    "icon": "12",
    "objective": "Aprenda a dizer e escrever números em inglês: de 1 a 20, dezenas (20/30/40…), centenas. Mais os ordinais (first, second, third…) pra datas e posições.",
    "sections": [
        {"id": "basicos", "title": "1 a 20 — os números que mais aparecem"},
        {"id": "dezenas-centenas", "title": "Dezenas, centenas e armadilhas"},
    ],
    "anchor_dialog": {
        "dialogue": "I have ___1___ brothers. My sister is ___2___ years old.",
        "blanks": [
            {"answer": "two", "hint": "Como escrever o número 2 em inglês?",
             "options": ["two", "twelve", "twenty", "ten"]},
            {"answer": "fifteen", "hint": "Como escrever 15 em inglês? (atenção: teen ou ty?)",
             "options": ["fifteen", "fifty", "fiveteen", "fourteen"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Como se escreve o número 5 em inglês?", "options": ["fife", "five", "fíve"], "correct": 1,
         "hints": ["Número pequeno, 1-5", "5 = five (rima com \"hive\")", "Resposta: five"]},
        {"difficulty": "easy", "q": "Como se escreve 13 em inglês?", "options": ["thirty", "thirten", "thirteen"], "correct": 2,
         "hints": ["13 = teen (não \"ty\")", "13 = thir + teen", "Resposta: thirteen"]},
        {"difficulty": "moderate", "q": "Qual a diferença entre \"thirteen\" e \"thirty\"?", "options": ["São a mesma coisa", "13 vs 30", "30 vs 13"], "correct": 1,
         "hints": ["-teen = 13-19. -ty = 20/30/40…", "thirTEEN = 13. THIRty = 30", "Resposta: 13 vs 30"]},
        {"difficulty": "moderate", "q": "Como se diz \"segundo\" (ordinal) em inglês?", "options": ["second", "secondth", "two"], "correct": 0,
         "hints": ["Ordinais: 1st, 2nd, 3rd, 4th…", "2nd = second (irregular)", "Resposta: second"]},
        {"difficulty": "hard", "q": "Qual está escrito corretamente?", "options": ["fourty", "forty", "fourtie"], "correct": 1,
         "hints": ["40 é exceção — não segue o padrão \"four + ty\"", "40 = forty (sem o \"u\"!)", "Resposta: forty"]},
    ],
    "final_test": [
        {"q": "Como escrever 13 em inglês?", "options": ["thirty", "thirteen", "thirten"], "correct": 1},
        {"q": "Como escrever 40 em inglês? (atenção à grafia)", "options": ["fourty", "forty", "forety"], "correct": 1},
        {"q": "O \"segundo\" em ordinal:", "options": ["second", "secondth", "two"], "correct": 0},
        {"q": "Qual é a diferença entre \"fifteen\" e \"fifty\"?", "options": ["São iguais", "15 vs 50", "50 vs 15"], "correct": 1},
        {"q": "Como se escreve 100?", "options": ["a hundred", "one hundred", "Ambas corretas"], "correct": 2},
    ],
    "coach_phrases": [
        "I have two brothers.",
        "She is fifteen years old.",
        "The price is forty dollars.",
        "It's the second floor.",
        "There are a hundred people here.",
    ],
}
