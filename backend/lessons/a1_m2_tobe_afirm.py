"""Lesson 10 — To Be Afirmativo (Module 2)"""

LESSON = {
    "title": "To be — afirmativas e contrações",
    "slug": "a1-m2-tobe-afirm",
    "old_slug": "soa1-tobe-afirm",
    "module": 2,
    "icon": "BE",
    "objective": "Domine o verbo mais importante do inglês em frases afirmativas: I am, You are, He/She/It is, We/They are. E as contrações naturais: I'm, you're, she's.",
    "sections": [
        {"id": "conjugacao", "title": "Conjugação completa — am, is, are"},
        {"id": "contracoes", "title": "Contrações — I'm, you're, she's, they're"},
    ],
    "anchor_dialog": {
        "dialogue": "I ___1___ Brazilian. My friends ___2___ from São Paulo.",
        "blanks": [
            {"answer": "am", "hint": "To be com \"I\": am, is ou are?",
             "options": ["am", "is", "are", "be"]},
            {"answer": "are", "hint": "To be com \"my friends\" (plural): am, is ou are?",
             "options": ["are", "is", "am", "were"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Complete: \"I ___ a student.\"", "options": ["am", "is", "are"], "correct": 0,
         "hints": ["I + to be = ?", "I am (única combinação possível)", "Resposta: am"]},
        {"difficulty": "easy", "q": "Complete: \"She ___ from Brazil.\"", "options": ["am", "is", "are"], "correct": 1,
         "hints": ["She = 3ª pessoa singular", "he/she/it = is", "Resposta: is"]},
        {"difficulty": "moderate", "q": "Complete a contração: \"They ___ ready.\"", "options": ["They're", "Theyre", "They is"], "correct": 0,
         "hints": ["they + are = contração", "they're = they are", "Resposta: They're"]},
        {"difficulty": "moderate", "q": "Qual frase está correta?", "options": ["He are my friend.", "He am my friend.", "He is my friend."], "correct": 2,
         "hints": ["he/she/it = is", "❌ he are / he am → ✅ he is", "Resposta: He is my friend."]},
        {"difficulty": "hard", "q": "Traduza: \"Nós somos uma equipe e eles são os melhores.\"", "options": ["We are a team and they are the best.", "We is a team and they is the best.", "We are a team and they is the best."], "correct": 0,
         "hints": ["we = are, they = are", "Ambos são plurais → are", "Resposta: We are a team and they are the best."]},
    ],
    "final_test": [
        {"q": "\"I ___ Brazilian.\"", "options": ["am", "is", "are"], "correct": 0},
        {"q": "\"She ___ from Rio.\"", "options": ["am", "is", "are"], "correct": 1},
        {"q": "\"We ___ a team.\"", "options": ["am", "is", "are"], "correct": 2},
        {"q": "Qual frase está correta?", "options": ["He are my friend.", "He is my friend.", "He am my friend."], "correct": 1},
        {"q": "Contração de \"They are\":", "options": ["They're", "Theyre", "Their"], "correct": 0},
    ],
    "coach_phrases": [
        "I'm Brazilian.",
        "She's a teacher.",
        "We're a team.",
        "They're from Rio.",
        "He is my best friend.",
    ],
}
