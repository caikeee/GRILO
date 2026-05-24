"""Lesson 7 — Alfabeto (Module 2)"""

LESSON = {
    "title": "Alfabeto e pronúncia — soletrar com confiança",
    "slug": "a1-m2-alfabeto",
    "old_slug": "soa1-alfabeto",
    "module": 2,
    "icon": "AB",
    "objective": "Aprenda os sons do alfabeto inglês que diferem do português e domine a pronúncia de letras-armadilha: A, E, G, H, R, W, Y. Soletrar em inglês sem travar.",
    "sections": [
        {"id": "letras-sons", "title": "Letras e sons — o que muda do português"},
        {"id": "soletrar", "title": "Praticar soletrar — nomes e palavras comuns"},
    ],
    "anchor_dialog": {
        "dialogue": "The letter ___1___ sounds like \"ei\". ___2___ is pronounced \"double-you\".",
        "blanks": [
            {"answer": "A", "hint": "Qual letra do alfabeto tem o som \"ei\"?",
             "options": ["A", "E", "I", "H"]},
            {"answer": "W", "hint": "Qual letra tem o nome incomum \"double-you\"?",
             "options": ["W", "V", "U", "Y"]},
        ],
    },
    "scaffolded_exercises": [
        {"difficulty": "easy", "q": "Qual é o som da letra \"A\" em inglês?", "options": ["ah", "ei", "aa"], "correct": 1,
         "hints": ["Pense no nome da letra, não no som do português", "\"A\" se chama \"ei\" em inglês", "Resposta: ei"]},
        {"difficulty": "easy", "q": "Como se soletra \"Rio\" em inglês? Qual letra vem primeiro?", "options": ["R — ar", "R — rr", "R — re"], "correct": 0,
         "hints": ["A letra R em inglês tem som de \"ar\"", "R = ar, I = ai, O = ou", "Resposta: ar"]},
        {"difficulty": "moderate", "q": "Qual letra tem o nome \"double-you\"?", "options": ["V", "W", "U"], "correct": 1,
         "hints": ["Letra incomum com nome composto", "\"Double\" = duplo. Pense na forma visual da letra.", "Resposta: W"]},
        {"difficulty": "moderate", "q": "Como se pronuncia o som \"TH\" em inglês (think)?", "options": ["d", "t", "th (língua nos dentes)"], "correct": 2,
         "hints": ["TH não existe em português", "É necessário colocar a ponta da língua entre os dentes", "Resposta: th (língua nos dentes)"]},
        {"difficulty": "hard", "q": "Soletrar \"Brazil\" em inglês: qual a sequência correta?", "options": ["B-R-A-Z-I-L", "B-R-E-Z-I-L", "B-R-A-S-I-L"], "correct": 0,
         "hints": ["Em inglês, Brazil tem Z (não S)", "B(bi) R(ar) A(ei) Z(zi) I(ai) L(el)", "Resposta: B-R-A-Z-I-L"]},
    ],
    "final_test": [
        {"q": "Som da letra \"A\" em inglês:", "options": ["ah", "ei", "aa"], "correct": 1},
        {"q": "Letra com nome \"double-you\":", "options": ["V", "W", "U"], "correct": 1},
        {"q": "Som TH (think) em inglês:", "options": ["d", "t", "língua nos dentes"], "correct": 2},
        {"q": "\"Brazil\" em inglês tem qual letra no lugar do S?", "options": ["Z", "C", "SS"], "correct": 0},
        {"q": "Qual letra soa \"ar\" em inglês?", "options": ["A", "R", "L"], "correct": 1},
    ],
    "coach_phrases": [
        "How do you spell your name?",
        "It starts with the letter B.",
        "W is pronounced double-you.",
        "The letter A sounds like 'ei'.",
        "Brazil is spelled B-R-A-Z-I-L.",
    ],
}
