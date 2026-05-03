# GRILO - Quiz Sistema Independente
# 100 Perguntas de Inglês Nível Básico (A1 - CEFR)
# Sistema de quizzes desacoplado do chat - funciona de forma standalone
# Desenvolvido com metodologia didática validada para aprendizado de inglês

from typing import List, Dict, Optional, Tuple
from enum import Enum
import random

class QuestionCategory(Enum):
    """Categorias de perguntas baseadas em CEFR A1"""
    VOCABULARY = "Vocabulary"
    GRAMMAR = "Grammar"
    COMPREHENSION = "Comprehension"
    LISTENING = "Listening"

class DifficultyLevel(Enum):
    """Níveis de dificuldade"""
    VERY_EASY = 1      # Perguntas básicas, conceitos introdutórios
    EASY = 2           # Conceitos bem estabelecidos
    INTERMEDIATE = 3   # Aplicação de conceitos
    CHALLENGING = 4    # Uso contextual, compreensão textual

# ==================== BANCO DE 100 PERGUNTAS ====================

QUIZ_QUESTIONS = [
    # ==================== SEÇÃO 1: GREETINGS & POLITE PHRASES (1-10) ====================
    {
        "id": 1,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Greetings",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you say when you meet someone in the morning?",
        "options": ["Good morning", "Good evening", "Good night", "Goodbye"],
        "correct": 0,
        "explanation": "'Good morning' is the correct greeting for the morning time.",
        "pedagogical_notes": "Basic greeting used from sunrise until noon. Common in formal and informal contexts."
    },
    {
        "id": 2,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Greetings",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How do you ask someone's name?",
        "options": ["What is your name?", "Where are you?", "How old are you?", "What is this?"],
        "correct": 0,
        "explanation": "'What is your name?' is the standard question to ask someone's name.",
        "pedagogical_notes": "Essential question for introductions. Can also use informal versions like 'What's your name?'"
    },
    {
        "id": 3,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Greetings",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Which is a polite way to say goodbye?",
        "options": ["Goodbye", "Hello", "Hi", "Hey"],
        "correct": 0,
        "explanation": "'Goodbye' is a formal and polite way to say farewell.",
        "pedagogical_notes": "Formal farewell. Alternatives: 'See you later', 'Take care', 'Have a nice day'."
    },
    {
        "id": 4,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Polite Phrases",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you say when you want something?",
        "options": ["Please", "Sorry", "Thank you", "Excuse me"],
        "correct": 0,
        "explanation": "'Please' is used when asking for something politely.",
        "pedagogical_notes": "Magic word in English. Demonstrates politeness and respect in communication."
    },
    {
        "id": 5,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Polite Phrases",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you say to thank someone?",
        "options": ["Thank you", "Hello", "Excuse me", "Please"],
        "correct": 0,
        "explanation": "'Thank you' is the correct way to express gratitude.",
        "pedagogical_notes": "Essential for polite communication. Can be shortened to 'Thanks' in informal contexts."
    },
    {
        "id": 6,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Greetings",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a casual way to say hello?",
        "options": ["Hi", "Good morning", "Goodbye", "Welcome"],
        "correct": 0,
        "explanation": "'Hi' is an informal and casual greeting.",
        "pedagogical_notes": "Used in casual, friendly contexts. More relaxed than 'Hello' or 'Good morning'."
    },
    {
        "id": 7,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Polite Phrases",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What do you say when you accidentally bump into someone?",
        "options": ["Excuse me", "Thank you", "Please", "Sorry"],
        "correct": 3,
        "explanation": "'Sorry' is the most appropriate when you've made a mistake or caused inconvenience.",
        "pedagogical_notes": "Both 'Excuse me' and 'Sorry' are correct depending on context. 'Sorry' for past actions, 'Excuse me' for getting attention."
    },
    {
        "id": 8,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Verb: To Be",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Complete: My name ___ John.",
        "options": ["am", "is", "are", "be"],
        "correct": 1,
        "explanation": "Use 'is' with third person singular. 'My name is John.'",
        "pedagogical_notes": "The verb 'to be' is foundational for English. 'Name' is 3rd person singular, requires 'is'."
    },
    {
        "id": 9,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Polite Phrases",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How do you ask for help politely?",
        "options": ["Can you help me?", "Help me!", "You must help me.", "Help right now."],
        "correct": 0,
        "explanation": "'Can you help me?' is a polite way to request help.",
        "pedagogical_notes": "Modal verb 'can' with questions demonstrates politeness. 'Can you...' is more polite than imperative commands."
    },
    {
        "id": 10,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Greetings",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you say when you meet someone you know?",
        "options": ["How are you?", "What is your name?", "Where are you from?", "Do you speak English?"],
        "correct": 0,
        "explanation": "'How are you?' is a common friendly greeting.",
        "pedagogical_notes": "This is a greeting, not a genuine question about health. In English culture, people expect brief positive responses."
    },

    # ==================== SEÇÃO 2: PERSONAL INFORMATION (11-25) ====================
    {
        "id": 11,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Verb: To Be",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "I ___ a student.",
        "options": ["am", "is", "are", "be"],
        "correct": 0,
        "explanation": "Use 'am' with first person singular. 'I am a student.'",
        "pedagogical_notes": "First person singular always uses 'am'. Remember: I am, you are, he/she/it is."
    },
    {
        "id": 12,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Verb: To Be",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "You ___ from Brazil.",
        "options": ["am", "is", "are", "be"],
        "correct": 2,
        "explanation": "Use 'are' with second person. 'You are from Brazil.'",
        "pedagogical_notes": "Second person (you) always uses 'are', whether singular or plural."
    },
    {
        "id": 13,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Verb: To Be",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "They ___ happy.",
        "options": ["am", "is", "are", "be"],
        "correct": 2,
        "explanation": "Use 'are' with third person plural. 'They are happy.'",
        "pedagogical_notes": "Any plural subject uses 'are'. Examples: they, we, you (plural), John and Mary."
    },
    {
        "id": 14,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Family",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Who is your father's wife?",
        "options": ["Mother", "Sister", "Aunt", "Grandmother"],
        "correct": 0,
        "explanation": "Your father's wife is your mother.",
        "pedagogical_notes": "Family vocabulary is essential for A1 level. Building logical relationships helps memory retention."
    },
    {
        "id": 15,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Family",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a son's sister called?",
        "options": ["Brother", "Sister", "Cousin", "Aunt"],
        "correct": 1,
        "explanation": "A son's sister is called a sister.",
        "pedagogical_notes": "Direct family relationships. Important for describing family members."
    },
    {
        "id": 16,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Family",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Who are your parents' parents?",
        "options": ["Grandparents", "Aunts and Uncles", "Cousins", "Siblings"],
        "correct": 0,
        "explanation": "Your parents' parents are your grandparents.",
        "pedagogical_notes": "Extended family vocabulary. Grandparents = avós (grandpa, grandma, grandmother, grandfather)."
    },
    {
        "id": 17,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Pronouns",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "He ___ a teacher.",
        "options": ["am", "is", "are", "be"],
        "correct": 1,
        "explanation": "Use 'is' with he. 'He is a teacher.'",
        "pedagogical_notes": "Third person singular masculine. Pattern: he/she/it + is"
    },
    {
        "id": 18,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Pronouns",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "She ___ 25 years old.",
        "options": ["am", "is", "are", "be"],
        "correct": 1,
        "explanation": "Use 'is' with she. 'She is 25 years old.'",
        "pedagogical_notes": "Third person singular feminine. Age is expressed with 'years old'."
    },
    {
        "id": 19,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Occupations",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is someone who teaches called?",
        "options": ["Teacher", "Doctor", "Engineer", "Chef"],
        "correct": 0,
        "explanation": "A person who teaches is called a teacher.",
        "pedagogical_notes": "Occupations are common in conversations about work and careers. Base word + -er = one who does (teach → teacher)."
    },
    {
        "id": 20,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Occupations",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What is someone who works in a hospital called?",
        "options": ["Doctor", "Nurse", "Teacher", "Chef"],
        "correct": 0,
        "explanation": "Both 'Doctor' and 'Nurse' work in hospitals, but 'Doctor' is the main answer.",
        "pedagogical_notes": "Hospital professions: doctor, nurse, surgeon, pharmacist. Accept both doctor and nurse."
    },
    {
        "id": 21,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "My friend is very ___ (cheerful/happy).",
        "options": ["nice", "bad", "sad", "angry"],
        "correct": 0,
        "explanation": "'Nice' is an appropriate adjective for cheerful/happy.",
        "pedagogical_notes": "Adjectives describe qualities. Nice = agradável, simpático. Adverb 'very' intensifies the adjective."
    },
    {
        "id": 22,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Possessive Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "___ name is Maria.",
        "options": ["My", "His", "Her", "Your"],
        "correct": 2,
        "explanation": "Use 'Her' for the female name Maria. 'Her name is Maria.'",
        "pedagogical_notes": "Possessive adjectives: my, your, his, her, its, our, their. Common error: students confuse 'her' and 'his'."
    },
    {
        "id": 23,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Possessive Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "___ book is on the table.",
        "options": ["My", "His", "Her", "Your"],
        "correct": 0,
        "explanation": "'My' shows possession to the speaker. 'My book is on the table.'",
        "pedagogical_notes": "First person possessive. Key vocabulary: table = mesa, on top of."
    },
    {
        "id": 24,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Personal Information",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How do you ask about someone's age?",
        "options": ["How old are you?", "How are you?", "Where are you?", "What is your name?"],
        "correct": 0,
        "explanation": "'How old are you?' is the question to ask someone's age.",
        "pedagogical_notes": "Standard age question. Response format: 'I am [number] years old' or 'I'm [number]'."
    },
    {
        "id": 25,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Personal Information",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How do you ask about someone's nationality?",
        "options": ["Where are you from?", "What is your name?", "How are you?", "What do you do?"],
        "correct": 0,
        "explanation": "'Where are you from?' is the question to ask about someone's nationality.",
        "pedagogical_notes": "Nationality question. Responses use country names or nationalities (e.g., 'I'm from Brazil. I'm Brazilian')."
    },

    # ==================== SEÇÃO 3: NUMBERS (26-35) ====================
    {
        "id": 26,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What number comes after 5?",
        "options": ["6", "5", "4", "7"],
        "correct": 0,
        "explanation": "The number that comes after 5 is 6.",
        "pedagogical_notes": "Cardinal numbers 1-20 are essential. Pattern recognition helps learning."
    },
    {
        "id": 27,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How do you spell the number 10?",
        "options": ["Ten", "Tin", "Tan", "Tun"],
        "correct": 0,
        "explanation": "The number 10 is spelled 'Ten'.",
        "pedagogical_notes": "Number spelling is important for phone numbers, dates, etc. Ten is a base number for others (11-19, 20-90)."
    },
    {
        "id": 28,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the number between 12 and 14?",
        "options": ["13", "12", "14", "15"],
        "correct": 0,
        "explanation": "The number between 12 and 14 is 13.",
        "pedagogical_notes": "Sequencing and understanding number relationships. Teens (13-19) have unique pronunciation patterns."
    },
    {
        "id": 29,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How many legs does a dog have?",
        "options": ["4", "2", "6", "8"],
        "correct": 0,
        "explanation": "A dog has 4 legs.",
        "pedagogical_notes": "Practical vocab application. Helps teach 'have/has' + number + noun combinations."
    },
    {
        "id": 30,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How many fingers does a person have on one hand?",
        "options": ["5", "4", "6", "10"],
        "correct": 0,
        "explanation": "A person has 5 fingers on one hand.",
        "pedagogical_notes": "Body parts + numbers. Total 10 fingers on both hands. Common expression: 'count on your fingers'."
    },
    {
        "id": 31,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What is 5 + 3?",
        "options": ["8", "7", "9", "6"],
        "correct": 0,
        "explanation": "5 + 3 = 8.",
        "pedagogical_notes": "Math operations in English: plus (+), minus (-), times (×), divided by (÷). Real-world application of numbers."
    },
    {
        "id": 32,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What is 10 - 2?",
        "options": ["8", "9", "7", "6"],
        "correct": 0,
        "explanation": "10 - 2 = 8.",
        "pedagogical_notes": "Subtraction in English context. Common phrasing: 'subtract', 'minus', 'take away'."
    },
    {
        "id": 33,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How many days are in a week?",
        "options": ["7", "5", "6", "8"],
        "correct": 0,
        "explanation": "There are 7 days in a week.",
        "pedagogical_notes": "Time units. Days of week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday."
    },
    {
        "id": 34,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How many months are in a year?",
        "options": ["12", "10", "11", "13"],
        "correct": 0,
        "explanation": "There are 12 months in a year.",
        "pedagogical_notes": "Months: January, February, March, April, May, June, July, August, September, October, November, December. Seasonal patterns."
    },
    {
        "id": 35,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Numbers and Ordinal",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the first letter of the alphabet?",
        "options": ["A", "B", "C", "Z"],
        "correct": 0,
        "explanation": "The first letter of the alphabet is A.",
        "pedagogical_notes": "Alphabet is A-Z (26 letters). Ordinals: first, second, third, etc. Used for listing and sequencing."
    },

    # ==================== SEÇÃO 4: COMMON OBJECTS & PLACES (36-50) ====================
    {
        "id": 36,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you use to write on paper?",
        "options": ["Pen", "Table", "Door", "Window"],
        "correct": 0,
        "explanation": "A pen is used to write on paper.",
        "pedagogical_notes": "Common classroom/office objects. Verb: write with a pen. Related: pencil, marker, crayon."
    },
    {
        "id": 37,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you use to sit on?",
        "options": ["Chair", "Table", "Door", "Window"],
        "correct": 0,
        "explanation": "A chair is for sitting on.",
        "pedagogical_notes": "Furniture vocabulary. Common classroom item. Verb: sit on. Related: couch, bench, stool."
    },
    {
        "id": 38,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "What is used to eat food?",
        "options": ["Fork", "Spoon", "Knife", "All of the above"],
        "correct": 3,
        "explanation": "Fork, spoon, and knife are all eating utensils.",
        "pedagogical_notes": "Cutlery/utensils. Used at table for eating. Also: plate, glass, napkin, fork for salad, etc."
    },
    {
        "id": 39,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "What do you drink water from?",
        "options": ["Glass", "Plate", "Cup", "Both A and C"],
        "correct": 3,
        "explanation": "You can drink water from a glass or a cup.",
        "pedagogical_notes": "Drinking containers. Glass = vidro (copo de vidro), Cup = xícara/caneca. Verb: drink from."
    },
    {
        "id": 40,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Places",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Where can you buy food?",
        "options": ["Supermarket", "School", "Park", "Hospital"],
        "correct": 0,
        "explanation": "A supermarket is where you can buy food.",
        "pedagogical_notes": "Places in town. Verb: buy at/in. Also: grocery store, market, bakery, butcher."
    },
    {
        "id": 41,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Places",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Where do students study?",
        "options": ["School", "Hospital", "Restaurant", "Park"],
        "correct": 0,
        "explanation": "Students study in school.",
        "pedagogical_notes": "Educational places. Also: university, library, classroom. Verb: study at."
    },
    {
        "id": 42,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Places",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Where do you sleep?",
        "options": ["Bedroom", "Kitchen", "Bathroom", "Living room"],
        "correct": 0,
        "explanation": "You sleep in a bedroom.",
        "pedagogical_notes": "House rooms. Verb: sleep in. Also: bed (on), bedroom (in)."
    },
    {
        "id": 43,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Places",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Where do you cook food?",
        "options": ["Kitchen", "Bedroom", "Bathroom", "Living room"],
        "correct": 0,
        "explanation": "You cook food in a kitchen.",
        "pedagogical_notes": "House rooms. Verb: cook in. Kitchen equipment: stove, oven, sink, refrigerator."
    },
    {
        "id": 44,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a vehicle used for transportation?",
        "options": ["Car", "Table", "Chair", "Door"],
        "correct": 0,
        "explanation": "A car is a vehicle used for transportation.",
        "pedagogical_notes": "Transportation vocabulary. Also: bus, train, plane, bicycle. Verb: drive/ride in."
    },
    {
        "id": 45,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you wear on your feet?",
        "options": ["Shoes", "Hat", "Shirt", "Pants"],
        "correct": 0,
        "explanation": "Shoes are worn on your feet.",
        "pedagogical_notes": "Clothing/footwear. Also: socks, boots, slippers. Verb: wear. Structure: 'I wear shoes'."
    },
    {
        "id": 46,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you wear to keep warm?",
        "options": ["Coat", "Shoes", "Hat", "Glasses"],
        "correct": 0,
        "explanation": "A coat is worn to keep warm.",
        "pedagogical_notes": "Winter clothing. Also: jacket, sweater, scarf, gloves, hat. Practical vocabulary for weather contexts."
    },
    {
        "id": 47,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What do you use to see in the dark?",
        "options": ["Flashlight", "Mirror", "Glasses", "Candle"],
        "correct": 0,
        "explanation": "A flashlight is used to see in the dark.",
        "pedagogical_notes": "Tools/equipment. Also: lamp, light bulb, candle. Real-world application."
    },
    {
        "id": 48,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What is used to tell time?",
        "options": ["Clock", "Calendar", "Watch", "All of the above"],
        "correct": 3,
        "explanation": "Clock, calendar, and watch can all be used to tell time.",
        "pedagogical_notes": "Time-telling devices. Clock = no punho, Watch = relógio de pulso. Phrases: 'What time is it?'"
    },
    {
        "id": 49,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Objects",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What do you use to open a door?",
        "options": ["Key", "Lock", "Handle", "Both A and C"],
        "correct": 3,
        "explanation": "You can use a key or a handle to open a door.",
        "pedagogical_notes": "Door-related vocabulary. Key = chave (opens locks), Handle = puxador/maçaneta (mechanical opening)."
    },
    {
        "id": 50,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Places",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Where do sick people go?",
        "options": ["Hospital", "School", "Park", "Restaurant"],
        "correct": 0,
        "explanation": "Sick people go to a hospital.",
        "pedagogical_notes": "Health/medical places. Also: doctor's office, clinic. Verb: go to the hospital. Adjective: sick."
    },

    # ==================== SEÇÃO 5: COLORS & ADJECTIVES (51-60) ====================
    {
        "id": 51,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Colors",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What color is the sky on a clear day?",
        "options": ["Blue", "Green", "Red", "Yellow"],
        "correct": 0,
        "explanation": "The sky is blue on a clear day.",
        "pedagogical_notes": "Nature colors. Variations: light blue, dark blue, sky blue. Poetic vocabulary."
    },
    {
        "id": 52,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Colors",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What color is snow?",
        "options": ["White", "Blue", "Green", "Yellow"],
        "correct": 0,
        "explanation": "Snow is white.",
        "pedagogical_notes": "Winter imagery. Other white things: clouds, milk, paper, table. Adjective use: 'white snow' or 'The snow is white'."
    },
    {
        "id": 53,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Colors",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "What color is an orange?",
        "options": ["Orange", "Red", "Yellow", "Brown"],
        "correct": 0,
        "explanation": "An orange is orange (by name).",
        "pedagogical_notes": "Color-noun homonym. Orange can refer to both the fruit and the color. Learn: the orange fruit has orange color."
    },
    {
        "id": 54,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "The weather is ___.",
        "options": ["sunny", "quickly", "run", "happy"],
        "correct": 0,
        "explanation": "'Sunny' is an adjective used to describe weather.",
        "pedagogical_notes": "Adjectives describe nouns. Weather adjectives: sunny, rainy, cloudy, cold, warm, hot, windy."
    },
    {
        "id": 55,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "This coffee is ___.",
        "options": ["hot", "quickly", "run", "jump"],
        "correct": 0,
        "explanation": "'Hot' is an adjective used to describe temperature.",
        "pedagogical_notes": "Temperature adjectives: hot, warm, cool, cold. 'Too hot', 'very hot'. Common with drinks and foods."
    },
    {
        "id": 56,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "That song is ___.",
        "options": ["beautiful", "quickly", "run", "jump"],
        "correct": 0,
        "explanation": "'Beautiful' is an adjective used to describe something aesthetically pleasing.",
        "pedagogical_notes": "Aesthetic adjectives: beautiful, pretty, lovely, nice. Common with: songs, pictures, days, people."
    },
    {
        "id": 57,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the opposite of big?",
        "options": ["Small", "Large", "Huge", "Tall"],
        "correct": 0,
        "explanation": "The opposite of big is small.",
        "pedagogical_notes": "Opposites are useful for vocabulary retention. Big ↔ small/little, large ↔ small."
    },
    {
        "id": 58,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the opposite of happy?",
        "options": ["Sad", "Angry", "Tired", "Hungry"],
        "correct": 0,
        "explanation": "The opposite of happy is sad.",
        "pedagogical_notes": "Emotion opposites: happy ↔ sad, angry ↔ calm/peaceful, tired ↔ energetic. Important for emotional expression."
    },
    {
        "id": 59,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the opposite of hot?",
        "options": ["Cold", "Warm", "Cool", "Hot"],
        "correct": 0,
        "explanation": "The opposite of hot is cold.",
        "pedagogical_notes": "Temperature opposites: hot ↔ cold, warm ↔ cool. Weather and physical sensations context."
    },
    {
        "id": 60,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Adjectives",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "The movie was ___.",
        "options": ["interesting", "quickly", "sleep", "eat"],
        "correct": 0,
        "explanation": "'Interesting' is an adjective describing something engaging.",
        "pedagogical_notes": "Entertainment adjectives: interesting, boring, exciting, funny, scary. Structure: 'The [noun] is/was [adjective]'."
    },

    # ==================== SEÇÃO 6: FOOD & DRINKS (61-70) ====================
    {
        "id": 61,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you eat for breakfast?",
        "options": ["Cereal", "Rice", "Pasta", "Beef"],
        "correct": 0,
        "explanation": "Cereal is a common breakfast food.",
        "pedagogical_notes": "Meal times: breakfast (café da manhã), lunch (almoço), dinner (jantar). Common: eggs, toast, bacon, juice."
    },
    {
        "id": 62,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a common fruit?",
        "options": ["Apple", "Rice", "Bread", "Cheese"],
        "correct": 0,
        "explanation": "An apple is a common fruit.",
        "pedagogical_notes": "Fruits vocabulary. Also: banana, orange, grape, strawberry. Healthy food discussion."
    },
    {
        "id": 63,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a common vegetable?",
        "options": ["Carrot", "Apple", "Banana", "Pear"],
        "correct": 0,
        "explanation": "A carrot is a common vegetable.",
        "pedagogical_notes": "Vegetables vocabulary. Also: tomato, lettuce, cucumber, potato, broccoli. Nutritional discussions."
    },
    {
        "id": 64,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Drinks",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What beverage do you drink in the morning?",
        "options": ["Coffee", "Soup", "Sauce", "Oil"],
        "correct": 0,
        "explanation": "Coffee is a common morning beverage.",
        "pedagogical_notes": "Morning drink. Also: tea, juice, milk. Routine vocabulary for daily habits."
    },
    {
        "id": 65,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Drinks",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a healthy drink?",
        "options": ["Water", "Coffee", "Juice", "Tea"],
        "correct": 0,
        "explanation": "Water is the healthiest drink.",
        "pedagogical_notes": "Health/wellness vocabulary. All options are drinks; water is healthiest according to health education."
    },
    {
        "id": 66,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is made from flour and water?",
        "options": ["Bread", "Butter", "Cheese", "Meat"],
        "correct": 0,
        "explanation": "Bread is made from flour and water.",
        "pedagogical_notes": "Basic ingredients. Bread is a staple. Also learn: yeast, salt. Verb: bake."
    },
    {
        "id": 67,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you cook with?",
        "options": ["Oil", "Water", "Flour", "Sugar"],
        "correct": 0,
        "explanation": "Oil is commonly used for cooking.",
        "pedagogical_notes": "Cooking ingredients. Also: butter, salt, spices. Verbs: cook with, fry, boil."
    },
    {
        "id": 68,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a meal called when eaten at noon?",
        "options": ["Lunch", "Breakfast", "Dinner", "Snack"],
        "correct": 0,
        "explanation": "The meal eaten at noon is called lunch.",
        "pedagogical_notes": "Meal times. Lunch = almoço (midday meal). Also: breakfast (morning), dinner (evening), snack (between meals)."
    },
    {
        "id": 69,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the main meal of the day?",
        "options": ["Dinner", "Breakfast", "Lunch", "Snack"],
        "correct": 0,
        "explanation": "Dinner is typically the main meal of the day.",
        "pedagogical_notes": "Based on Western habits. Varies culturally. Dinner = jantar (evening meal, main meal in many countries)."
    },
    {
        "id": 70,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Food",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is eaten between meals?",
        "options": ["Snack", "Breakfast", "Lunch", "Dinner"],
        "correct": 0,
        "explanation": "A snack is eaten between meals.",
        "pedagogical_notes": "Eating habits. Snack = lanche/merenda. Examples: fruit, cookies, nuts, yogurt. Common for energy between meals."
    },

    # ==================== SEÇÃO 7: TIMES & DAYS (71-80) ====================
    {
        "id": 71,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Days",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What day comes after Monday?",
        "options": ["Tuesday", "Sunday", "Wednesday", "Friday"],
        "correct": 0,
        "explanation": "Tuesday comes after Monday.",
        "pedagogical_notes": "Days sequence. Monday → Tuesday → Wednesday → Thursday → Friday → Saturday → Sunday."
    },
    {
        "id": 72,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Days",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the first day of the week?",
        "options": ["Monday", "Sunday", "Tuesday", "Wednesday"],
        "correct": 1,
        "explanation": "Sunday is typically considered the first day of the week in many English-speaking countries.",
        "pedagogical_notes": "Varies by country. In US/UK, Sunday is first. In EU/Brazil, Monday is first. Convention context is important."
    },
    {
        "id": 73,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Days",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "How many days are in a weekend?",
        "options": ["2", "1", "3", "5"],
        "correct": 0,
        "explanation": "A weekend has 2 days (Saturday and Sunday).",
        "pedagogical_notes": "Weekend = fim de semana. Days off from work/school in most countries. Saturday + Sunday."
    },
    {
        "id": 74,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Time",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What time is it when the sun is at its highest?",
        "options": ["Noon", "Morning", "Evening", "Night"],
        "correct": 0,
        "explanation": "Noon is when the sun is highest in the sky (12:00 PM).",
        "pedagogical_notes": "12:00 PM = noon/midday. Used for scheduling, meal times. 12:00 AM = midnight."
    },
    {
        "id": 75,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Time",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What time do most people sleep?",
        "options": ["Night", "Morning", "Afternoon", "Noon"],
        "correct": 0,
        "explanation": "Most people sleep at night.",
        "pedagogical_notes": "Sleep time = noite. Time periods: morning (sunrise-noon), afternoon (noon-sunset), evening (sunset-night), night (dark hours)."
    },
    {
        "id": 76,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Prepositions of Time",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "I go to work ___ Mondays.",
        "options": ["on", "in", "at", "by"],
        "correct": 0,
        "explanation": "Use 'on' before specific days. 'I go to work on Mondays.'",
        "pedagogical_notes": "Prepositions: ON = day of week, IN = month/year/season, AT = specific time, BY = before a deadline."
    },
    {
        "id": 77,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Prepositions of Time",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "She was born ___ July.",
        "options": ["in", "on", "at", "by"],
        "correct": 0,
        "explanation": "Use 'in' before months. 'She was born in July.'",
        "pedagogical_notes": "'In' with months, years, seasons. 'She was born in 1995, in summer, in July'."
    },
    {
        "id": 78,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Prepositions of Time",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "I wake up ___ 7 AM.",
        "options": ["at", "on", "in", "by"],
        "correct": 0,
        "explanation": "Use 'at' before specific times. 'I wake up at 7 AM.'",
        "pedagogical_notes": "'At' with specific time. 'At 7 o'clock', 'at noon', 'at midnight', 'at dawn'."
    },
    {
        "id": 79,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Time",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is a month?",
        "options": ["A period of about 30 days", "A period of 7 days", "A period of 365 days", "A period of 24 hours"],
        "correct": 0,
        "explanation": "A month is a period of about 30 days.",
        "pedagogical_notes": "Time units: day (24 hours), week (7 days), month (~30 days), year (365 days). Important for calendars."
    },
    {
        "id": 80,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Time",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What season comes after summer?",
        "options": ["Autumn", "Winter", "Spring", "Summer"],
        "correct": 0,
        "explanation": "Autumn comes after summer.",
        "pedagogical_notes": "Seasons: Spring → Summer → Autumn → Winter (Northern Hemisphere). Also called Fall in US English."
    },

    # ==================== SEÇÃO 8: SIMPLE ACTIONS & VERBS (81-90) ====================
    {
        "id": 81,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Simple Present",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "I ___ coffee every morning.",
        "options": ["drink", "drinks", "drinking", "drank"],
        "correct": 0,
        "explanation": "Use 'drink' with 'I' in simple present. 'I drink coffee every morning.'",
        "pedagogical_notes": "Simple present for habits. Pattern: I/you/we/they + verb (no -s), he/she/it + verb-s."
    },
    {
        "id": 82,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Simple Present",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "He ___ to the gym on Mondays.",
        "options": ["goes", "go", "going", "went"],
        "correct": 0,
        "explanation": "Use 'goes' with 'he' in simple present. 'He goes to the gym on Mondays.'",
        "pedagogical_notes": "3rd person singular: he/she/it + verb-s. Go → goes (irregular). Describes regular activities."
    },
    {
        "id": 83,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Simple Present",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "They ___ English very well.",
        "options": ["speak", "speaks", "speaking", "spoke"],
        "correct": 0,
        "explanation": "Use 'speak' with 'they' in simple present. 'They speak English very well.'",
        "pedagogical_notes": "Plural subject 'they' uses base form. Structure: [plural] + [base verb]. Often used for language skills."
    },
    {
        "id": 84,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Actions",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you do when you are tired?",
        "options": ["Sleep", "Run", "Jump", "Eat"],
        "correct": 0,
        "explanation": "When you are tired, you sleep.",
        "pedagogical_notes": "Physical state → appropriate action. Tired = cansado → sleep. Verb: sleep."
    },
    {
        "id": 85,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Actions",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you do when you are hungry?",
        "options": ["Eat", "Sleep", "Run", "Read"],
        "correct": 0,
        "explanation": "When you are hungry, you eat.",
        "pedagogical_notes": "Hungry = faminto/com fome → eat. Verb: eat. Physical need vocabulary."
    },
    {
        "id": 86,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Actions",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What do you do with a book?",
        "options": ["Read", "Eat", "Drink", "Write"],
        "correct": 0,
        "explanation": "You read a book.",
        "pedagogical_notes": "Object-action relationship. Book → read. Also: write in, draw in, highlight in. Literacy activities."
    },
    {
        "id": 87,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Questions",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "What is the question form of 'You like pizza'?",
        "options": ["Do you like pizza?", "You do like pizza?", "Like you pizza?", "Pizza you like?"],
        "correct": 0,
        "explanation": "The question form is 'Do you like pizza?'",
        "pedagogical_notes": "Yes/No questions with 'do/does'. Pattern: Do + [subject] + [verb]? Inverted word order in English."
    },
    {
        "id": 88,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Negation",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "I ___ like apples.",
        "options": ["don't", "doesn't", "do", "does"],
        "correct": 0,
        "explanation": "Use 'don't' with 'I' for negation. 'I don't like apples.'",
        "pedagogical_notes": "Negation with 'do/does+not' (don't/doesn't). Pattern: [subject] + don't/doesn't + [verb]."
    },
    {
        "id": 89,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Negation",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "She ___ like cats.",
        "options": ["doesn't", "don't", "does", "do"],
        "correct": 0,
        "explanation": "Use 'doesn't' with 'she' for negation. 'She doesn't like cats.'",
        "pedagogical_notes": "3rd person singular negation: he/she/it doesn't. Common mistake: students use 'don't' with 3rd person."
    },
    {
        "id": 90,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Actions",
        "difficulty": DifficultyLevel.CHALLENGING.value,
        "text": "What is the opposite of 'start'?",
        "options": ["Stop", "Begin", "Continue", "Finish"],
        "correct": 0,
        "explanation": "The opposite of 'start' is 'stop'.",
        "pedagogical_notes": "Antonyms. Start ≠ stop. Also: begin ≠ end, visit ≠ leave."
    },

    # ==================== SEÇÃO 9: COMPREHENSION & COMMUNICATION (91-100) ====================
    {
        "id": 91,
        "category": QuestionCategory.COMPREHENSION.value,
        "subcategory": "Reading",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "Read: 'My name is John. I am 25 years old. I am from England.' What is John's nationality?",
        "options": ["English", "American", "Australian", "Canadian"],
        "correct": 0,
        "explanation": "The text says 'I am from England,' so John is English.",
        "pedagogical_notes": "Reading comprehension from explicit information. Key phrase: 'from England'. Nationality = English."
    },
    {
        "id": 92,
        "category": QuestionCategory.COMPREHENSION.value,
        "subcategory": "Reading",
        "difficulty": DifficultyLevel.INTERMEDIATE.value,
        "text": "Read: 'Mary likes to play tennis every Saturday.' When does Mary play tennis?",
        "options": ["On Saturday", "Every day", "On Sunday", "On Monday"],
        "correct": 0,
        "explanation": "The text says Mary plays tennis every Saturday.",
        "pedagogical_notes": "Text comprehension for specific details. Key phrase: 'every Saturday'. Frequency word recognition."
    },
    {
        "id": 93,
        "category": QuestionCategory.COMPREHENSION.value,
        "subcategory": "Reading",
        "difficulty": DifficultyLevel.CHALLENGING.value,
        "text": "Read: 'Tom has two brothers and one sister.' How many siblings does Tom have?",
        "options": ["3", "2", "4", "1"],
        "correct": 0,
        "explanation": "Tom has 2 brothers + 1 sister = 3 siblings.",
        "pedagogical_notes": "Math comprehension combined with reading. Logical deduction: 2+1=3. Sibling terminology."
    },
    {
        "id": 94,
        "category": QuestionCategory.LISTENING.value,
        "subcategory": "Formal Greetings",
        "difficulty": DifficultyLevel.CHALLENGING.value,
        "text": "If someone says 'How do you do?', what should you say?",
        "options": ["How do you do?", "I'm fine", "What?", "Hello"],
        "correct": 0,
        "explanation": "'How do you do?' is a formal greeting and the response is 'How do you do?'",
        "pedagogical_notes": "Formal greeting convention. Archaic/very formal in modern usage. Response is echo/repeat of greeting."
    },
    {
        "id": 95,
        "category": QuestionCategory.VOCABULARY.value,
        "subcategory": "Questions",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "Which question asks about someone's job?",
        "options": ["What do you do?", "How are you?", "Where are you?", "What is your name?"],
        "correct": 0,
        "explanation": "'What do you do?' is the question to ask about someone's occupation.",
        "pedagogical_notes": "Multiple meanings: could mean hobby or job depending on context. In introductions = job/profession."
    },
    {
        "id": 96,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Articles",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "___ apple is red.",
        "options": ["The", "A", "An", "Some"],
        "correct": 0,
        "explanation": "Use 'The' for a specific apple. 'The apple is red.'",
        "pedagogical_notes": "Definite article 'the' = specific item (você sabe qual). 'A/An' = indefinite (qualquer um). Context dependent."
    },
    {
        "id": 97,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Articles",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "___ cat is sleeping.",
        "options": ["A", "The", "An", "Some"],
        "correct": 1,
        "explanation": "Use 'The' for a specific cat. 'The cat is sleeping.'",
        "pedagogical_notes": "Specific reference (you know which cat). Without context, would use 'A cat' (indefinite)."
    },
    {
        "id": 98,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Plurals",
        "difficulty": DifficultyLevel.VERY_EASY.value,
        "text": "What is the plural of 'book'?",
        "options": ["Books", "Bookes", "Book", "Bookz"],
        "correct": 0,
        "explanation": "The plural of 'book' is 'books'.",
        "pedagogical_notes": "Regular plurals: add -s to most nouns. Most common pluralization pattern."
    },
    {
        "id": 99,
        "category": QuestionCategory.GRAMMAR.value,
        "subcategory": "Plurals",
        "difficulty": DifficultyLevel.EASY.value,
        "text": "What is the plural of 'child'?",
        "options": ["Children", "Childs", "Childes", "Child"],
        "correct": 0,
        "explanation": "'Child' has an irregular plural form: 'children'.",
        "pedagogical_notes": "Irregular plurals: child→children, man→men, person→people, foot→feet. Common high-frequency words."
    },
    {
        "id": 100,
        "category": QuestionCategory.COMPREHENSION.value,
        "subcategory": "Reading",
        "difficulty": DifficultyLevel.CHALLENGING.value,
        "text": "Read: 'Sarah likes ice cream. She eats ice cream on hot days.' What does Sarah eat on hot days?",
        "options": ["Ice cream", "Hot food", "Cold water", "Cake"],
        "correct": 0,
        "explanation": "The text says Sarah eats ice cream on hot days.",
        "pedagogical_notes": "Inference from explicit text. Key phrase: 'eats ice cream on hot days'."
    }
]

# ==================== UTILITY FUNCTIONS ====================

def get_all_questions() -> List[Dict]:
    """Retorna todas as 100 perguntas."""
    return QUIZ_QUESTIONS

def get_questions_by_category(category: str) -> List[Dict]:
    """Filtra perguntas por categoria."""
    valid_categories = [c.value for c in QuestionCategory]
    if category not in valid_categories:
        raise ValueError(f"Categoria inválida. Opções: {valid_categories}")
    return [q for q in QUIZ_QUESTIONS if q["category"] == category]

def get_questions_by_difficulty(difficulty: int) -> List[Dict]:
    """Filtra perguntas por nível de dificuldade."""
    if difficulty < 1 or difficulty > 4:
        raise ValueError("Dificuldade deve estar entre 1 e 4")
    return [q for q in QUIZ_QUESTIONS if q["difficulty"] == difficulty]

def get_question_by_id(question_id: int) -> Optional[Dict]:
    """Busca uma pergunta específica pelo ID."""
    for question in QUIZ_QUESTIONS:
        if question["id"] == question_id:
            return question
    return None

def get_random_questions(count: int = 10, category: Optional[str] = None, 
                         difficulty: Optional[int] = None) -> List[Dict]:
    """Retorna perguntas aleatórias com filtros opcionais."""
    if count < 1 or count > len(QUIZ_QUESTIONS):
        raise ValueError(f"Count deve estar entre 1 e {len(QUIZ_QUESTIONS)}")
    
    filtered = QUIZ_QUESTIONS
    
    if category:
        filtered = get_questions_by_category(category)
    
    if difficulty:
        filtered = [q for q in filtered if q["difficulty"] == difficulty]
    
    if count > len(filtered):
        raise ValueError(f"Não há {count} perguntas com os filtros especificados")
    
    return random.sample(filtered, count)

def get_quiz_statistics() -> Dict:
    """Retorna estatísticas do quiz."""
    stats = {
        "total_questions": len(QUIZ_QUESTIONS),
        "by_category": {},
        "by_difficulty": {
            "very_easy": 0,
            "easy": 0,
            "intermediate": 0,
            "challenging": 0
        },
        "by_subcategory": {}
    }
    
    for question in QUIZ_QUESTIONS:
        # Por categoria
        cat = question["category"]
        stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
        
        # Por dificuldade
        diff = question["difficulty"]
        diff_name = list(DifficultyLevel)[diff - 1].name.lower()
        stats["by_difficulty"][diff_name] += 1
        
        # Por subcategoria
        subcat = question["subcategory"]
        if subcat not in stats["by_subcategory"]:
            stats["by_subcategory"][subcat] = 0
        stats["by_subcategory"][subcat] += 1
    
    return stats

def validate_answer(question_id: int, answer_index: int) -> Tuple[bool, Dict]:
    """Valida uma resposta e retorna resultado detalhado."""
    question = get_question_by_id(question_id)
    if not question:
        raise ValueError(f"Pergunta {question_id} não encontrada")
    
    is_correct = answer_index == question["correct"]
    
    return is_correct, {
        "is_correct": is_correct,
        "user_answer": question["options"][answer_index] if 0 <= answer_index < len(question["options"]) else None,
        "correct_answer": question["options"][question["correct"]],
        "explanation": question["explanation"],
        "pedagogical_notes": question.get("pedagogical_notes", "")
    }


if __name__ == "__main__":
    # Testes
    print(f"Total de perguntas: {len(get_all_questions())}")
    print(f"\nEstatísticas:\n{get_quiz_statistics()}")
    print(f"\nPergunta aleatória:\n{get_random_questions(1)[0]}")
