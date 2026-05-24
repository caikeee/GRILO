"""Lesson 2 — Perguntas (Module 1)"""

LESSON = {
    "title": "Perguntas — como montar qualquer pergunta em inglês",
    "slug": "a1-m1-perguntas",
    "old_slug": "perguntas",
    "module": 1,
    "icon": "Q?",
    "objective": "Aprenda a fazer três tipos de perguntas: sim/não (Do/Does), com palavra de interrogação (What/Where/Who) e confirmatórias (isn't it?). Tudo com a lógica do auxiliar.",
    "sections": [
        {"id": "sim-nao", "title": "Perguntas de sim ou não — Do/Does"},
        {"id": "wh-questions", "title": "Perguntas abertas — What/Where/Who"},
        {"id": "tag-questions", "title": "Confirmação — Tag questions"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ you like coffee? Yes, I ___2___.",
        "blanks": [
            {"answer": "Do", "hint": "Para montar a pergunta com \"you\", precisamos de \"Do\" ou \"Does\"?",
             "options": ["Do", "Does", "Did", "Is"]},
            {"answer": "do", "hint": "Resposta curta positiva com \"I\": \"Yes, I ___\"",
             "options": ["do", "does", "did", "don't"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Qual palavra inicia a pergunta: \"___ you speak English?\"", "options": ["Do", "Does", "Did"], "correct": 0,
         "hints": ["Sujeito: \"you\" — singular ou grupo I/you/we/they?", "Do = I/you/we/they. Does = he/she/it.", "Resposta: Do"]},
        {"difficulty": "easy", "q": "\"___ she live in Rio?\" — qual auxiliar?", "options": ["Do", "Does", "Did"], "correct": 1,
         "hints": ["Sujeito: \"she\" — 3ª pessoa singular", "She/He/It = Does", "Resposta: Does"]},
        {"difficulty": "moderate", "q": "\"___ they arrive yesterday?\" — passado ou presente?", "options": ["Do", "Does", "Did"], "correct": 2,
         "hints": ["Palavra-chave: \"yesterday\" = passado", "Passado = Did, para qualquer sujeito", "Resposta: Did"]},
        {"difficulty": "moderate", "q": "Qual frase está correta?", "options": ["Where she lives?", "Where does she live?", "Where does she lives?"], "correct": 1,
         "hints": ["Pergunta com wh-: word + does/do + base", "Depois de \"does\", o verbo volta à base (sem -s)", "Resposta: Where does she live?"]},
        {"difficulty": "hard", "q": "\"Who called you?\" — por que não há \"did\" aqui?", "options": ["Erro de gramática", "\"Who\" é o sujeito da frase", "\"Who\" é sempre informal"], "correct": 1,
         "hints": ["Pergunta: quem fez a ação? Who = sujeito", "Quando wh- é o sujeito, a estrutura muda: sem auxiliar", "Resposta: Who é o sujeito"]},
    ],
    "final_test": [
        {"q": "Qual palavra abre uma pergunta de sim/não com \"she\"?", "options": ["Do", "Does", "Did"], "correct": 1},
        {"q": "\"Where ___ she live?\" — qual auxiliar?", "options": ["do", "does", "did"], "correct": 1},
        {"q": "\"Who called you?\" — por que sem \"did\"?", "options": ["Erro gramatical", "\"Who\" é o sujeito", "Regra antiga"], "correct": 1},
        {"q": "Forma correta de perguntar no passado:", "options": ["Do you went?", "Did you go?", "Does you went?"], "correct": 1},
        {"q": "\"You're from Brazil, ___ ___?\" — tag question", "options": ["isn't it?", "aren't you?", "don't you?"], "correct": 1},
    ],
    "coach_phrases": [
        "Do you like coffee?",
        "Does she work here?",
        "Did you sleep well?",
        "What do you want for dinner?",
        "You like pizza, don't you?",
    ],
}
