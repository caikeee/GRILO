"""Lesson 9 — Cumprimentos (Module 2)"""

LESSON = {
    "title": "Cumprimentos — como se apresentar e cumprimentar",
    "slug": "a1-m2-cumprimentos",
    "old_slug": "soa1-cumprimentos",
    "module": 2,
    "icon": "HI",
    "objective": "Domine as saudações do dia a dia: Good morning/afternoon/evening, How are you?, Nice to meet you. E entenda quando usar cada uma — inclusive o informal 'What's up?'",
    "sections": [
        {"id": "saudacoes", "title": "Saudações — bom dia, boa tarde, boa noite"},
        {"id": "apresentacoes", "title": "Apresentações e respostas educadas"},
    ],
    "anchor_dialog": {
        "dialogue": "___1___ morning! How ___2___ you?",
        "blanks": [
            {"answer": "Good", "hint": "Saudação pela manhã em inglês: \"Good ___\"",
             "options": ["Good", "Nice", "Fine", "Great"]},
            {"answer": "are", "hint": "Pergunta de cortesia: \"How ___ you?\" — qual forma do to be?",
             "options": ["are", "is", "am", "do"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Que saudação usar às 8 da manhã?", "options": ["Good night", "Good morning", "Good evening"], "correct": 1,
         "hints": ["Manhã: até ~12h", "Good morning = bom dia", "Resposta: Good morning"]},
        {"difficulty": "easy", "q": "\"Good night\" significa:", "options": ["Boa noite (ao encontrar)", "Boa noite (ao se despedir)", "Boa tarde"], "correct": 1,
         "hints": ["\"Good night\" é despedida, não saudação ao chegar", "\"Good evening\" = ao encontrar alguém à noite", "Resposta: ao se despedir"]},
        {"difficulty": "moderate", "q": "Como responder \"How are you?\"", "options": ["I am fine, thanks.", "I fine.", "Yes, I am."], "correct": 0,
         "hints": ["Resposta completa + educada", "Fine / Good / Great + thanks", "Resposta: I am fine, thanks."]},
        {"difficulty": "moderate", "q": "\"Nice to meet you\" — quando usar?", "options": ["Ao se despedir", "Ao conhecer alguém pela primeira vez", "Para pedir desculpa"], "correct": 1,
         "hints": ["Esta frase é para apresentações", "Ao conhecer = \"Nice to meet you\"", "Resposta: ao conhecer alguém pela primeira vez"]},
        {"difficulty": "hard", "q": "Alguém diz \"What's up?\" — qual a melhor resposta casual?", "options": ["I'm fine, thank you very much.", "Not much, you?", "Good morning!"], "correct": 1,
         "hints": ["\"What's up?\" é informal", "Resposta casual: \"Not much\", \"Good\", \"Nothing much\"", "Resposta: Not much, you?"]},
    ],
    "final_test": [
        {"q": "Saudação para a tarde (12h–18h):", "options": ["Good morning", "Good afternoon", "Good evening"], "correct": 1},
        {"q": "\"Good night\" se usa:", "options": ["Ao encontrar alguém à noite", "Ao se despedir para dormir", "Em qualquer horário"], "correct": 1},
        {"q": "Resposta para \"How are you?\":", "options": ["I fine.", "I am fine, thanks.", "Yes, fine."], "correct": 1},
        {"q": "\"Nice to meet you\" — quando usar?", "options": ["Ao se despedir", "Ao conhecer alguém", "Como agradecimento"], "correct": 1},
        {"q": "\"What's up?\" é:", "options": ["Formal", "Ofensivo", "Informal/casual"], "correct": 2},
    ],
    "coach_phrases": [
        "Good morning! How are you?",
        "I'm fine, thanks. And you?",
        "Nice to meet you.",
        "Good evening! Have a seat.",
        "What's up? Not much, you?",
    ],
}
