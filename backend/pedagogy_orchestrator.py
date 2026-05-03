"""
Pedagogical Orchestration - SIMPLES E FUNCIONAL
Onboarding: 3 perguntas + 1 aplicação prática = usuário ready para aprender
"""

import os
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy.orm import Session
from backend.db_models import Conversation, User
from typing import Dict, Optional
import logging

logger = logging.getLogger("grilo.pedagogy_orchestrator")
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")


# ==================== ONBOARDING MESSAGES ====================

def get_welcome_message() -> str:
    """Welcome message - tutor introduces itself"""
    return """Hi! 👋 I'm GRILO, your English tutor.

My goal is to teach you in a simple and practical way, using things you really enjoy.

Ready to start? I need to understand how you learn better. 🚀"""


def get_question_why_learn() -> str:
    """Question 1: Why do you want to learn English?"""
    return "Why do you want to learn English? (ex: travel, work, hobby, movies...)"


def get_question_interests() -> str:
    """Question 2: What do you like to do daily?"""
    return "What do you like to do daily? (ex: music, games, cooking, sports...)"


def generate_practical_demo(why: str, interests: str) -> str:
    """
    Question 3: Practical application
    Creates scenario: 'If you traveled today and needed to speak English about [interest], you would say...'
    """
    
    prompt = f"""You are a practical English tutor. The student:
- Wants to learn because: {why}
- Likes: {interests}

Create a REALISTIC scenario where the student is traveling TODAY and needs to speak English about something related to '{interests}'.

Be specific and practical. Example:
"If you went to an Italian restaurant in Rome TODAY and ordered a dish you love, you would say:
- 'I'd like the pasta carbonara please'
- 'Is it spicy?'"

Now do the same for the student's interest. Answer in 3-4 lines, in English only. Be practical and motivating."""
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        demo = response.choices[0].message.content.strip()
        return f"""Great! Let me show you how this works in practice:

{demo}

That's how we teach here: real-world context you can actually use. Ready to begin? 🎯"""
        
    except Exception as e:
        logger.error(f"Error generating demo: {str(e)}")
        return f"""Perfect! So let's focus on {interests} and {why}.

Now let's practice with real situations from your daily life. I'll teach you English you can ACTUALLY use. Let's go! 🎯"""


# ==================== NORMAL TUTORING ====================

def _build_system_prompt(why: str, interest: str) -> str:
    """Build the system prompt for the English tutor - 100% English immersion."""
    return f"""You are GRILO, an English tutor. You ONLY speak English - this is an English immersion learning experience.

STUDENT PROFILE:
- Motivation: {why}
- Interests: {interest}

ABSOLUTE RULES:
1. RESPOND DIRECTLY to what the student asked - never change the subject
2. Teach 1-3 relevant words/phrases in English with translations between brackets [like this]
3. NEVER repeat the same phrase, word or structure twice in the same response
4. Be concise: maximum 80 words
5. Use maximum 1 emoji
6. End with ONE short follow-up question
7. If they ask something NOT about English, briefly answer and bring back to learning
8. If it's a simple greeting (hi, good morning, etc), greet them and ask what they want to learn
9. Vary your responses - never use the same format/template repeatedly
10. Relate naturally to their interests when it makes sense, but do NOT force

CRITICAL LANGUAGE REQUIREMENT:
- Your response MUST be 100% in English ONLY
- Do NOT use Portuguese under any circumstances
- Do NOT code-switch or mix languages
- Every single word must be in English
- This is an English immersion experience - English-only is essential"""


async def generate_normal_tutoring_response(
    user_message: str,
    user: 'User',
    db: Session,
    history: list = None
) -> str:
    """
    Gera resposta do tutor usando system prompt + histórico real de conversa.
    O histórico permite que o AI mantenha contexto e coerência.
    """
    
    why = user.learning_why or "aprender inglês"
    interest = user.daily_interests or "vários assuntos"
    
    # Build messages array with system prompt
    messages = [{"role": "system", "content": _build_system_prompt(why, interest)}]
    
    # Include conversation history (last 20 messages for context window efficiency)
    if history:
        history_slice = history[-20:] if len(history) > 20 else history
        for item in history_slice:
            role = item.get("role", "user")
            content = item.get("content", "")
            if role in ("user", "assistant") and content.strip():
                messages.append({"role": role, "content": content})
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    logger.info(f"[generate_normal] Messages: {len(messages)} (system + {len(messages)-2} history + 1 current)")
    logger.debug(f"[generate_normal] System prompt language: ENGLISH ONLY")
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=250
        )
        
        assistant_response = response.choices[0].message.content.strip()
        
        if not assistant_response or len(assistant_response) < 10:
            raise Exception("Empty or too short response from API")
        
        logger.info(f"[generate_normal] OK | {len(assistant_response)} chars")
        return assistant_response
        
    except Exception as e:
        logger.error(f"[generate_normal] Error: {str(e)}")
        # Simple, honest fallback — don't pretend to know what the user said
        return "Desculpe, tive um problema ao processar sua mensagem. Pode repetir de outra forma? Estou aqui para te ajudar a aprender inglês! 😊"


# ==================== MAIN ORCHESTRATOR ====================

async def orchestrate_pedagogical_response(
    user_message: str,
    user_id: int,
    db: Session,
    history: Optional[list] = None
) -> Dict:
    """
    Orquestra resposta baseada no passo do onboarding.
    
    Fluxo:
    0 → Welcome
    1 → Pergunta: Por que quer aprender?
    2 → Pergunta: O que você gosta de fazer?
    3 → Demo prática
    4+ → Conversa normal
    """
    logger.info(f"[orchestrate] user_id={user_id}")
    
    try:
        # Buscar usuário
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User {user_id} não encontrado")
            return {'response': 'Erro: usuário não encontrado', 'stage': 'error'}
        
        step = user.onboarding_step
        logger.debug(f"[orchestrate] user_step={step} | message={user_message[:50] if user_message else '(empty)'}...")
        
        # PASSO 0: Welcome
        if step == 0:
            user.onboarding_step = 1
            db.commit()
            logger.info(f"[orchestrate] Advancing to step 1 (why_learn)")
            return {
                'response': get_welcome_message() + "\n\n" + get_question_why_learn(),
                'stage': 'onboarding_why',
                'teaching_context': 'Apresentação e primeira pergunta',
                'interests': []
            }
        
        # PASSO 1: Captura "Por que quer aprender?"
        if step == 1:
            user.learning_why = user_message
            user.onboarding_step = 2
            db.commit()
            logger.info(f"[orchestrate] Captured why_learn: {user_message[:50]}...")
            
            # Response validating and continuing
            first_word = user_message.split()[0].capitalize() if user_message else "That"
            return {
                'response': f"Awesome! {first_word} is a great reason. 🎯\n\n{get_question_interests()}",
                'stage': 'onboarding_interests',
                'teaching_context': 'Capturada motivação, perguntando interesses',
                'interests': []
            }
        
        # PASSO 2: Captura interesses e gera DEMO PRÁTICA
        if step == 2:
            user.daily_interests = user_message
            user.onboarding_step = 3
            db.commit()
            
            why = user.learning_why or "aprender"
            interests = user_message
            
            logger.info(f"[orchestrate] Generating practical demo... - ENGLISH IMMERSION")
            demo_response = generate_practical_demo(why, interests)
            
            logger.info(f"[orchestrate] Advancing to step 3 (ready to learn) - ENGLISH IMMERSION")
            return {
                'response': demo_response,
                'stage': 'onboarding_demo',
                'teaching_context': 'Practical demo - ready to learn',
                'interests': [interests]
            }
        
        # PASSO 3+: Conversa normal
        if step >= 3:
            # Se não tinha marcado como completo, marcar agora
            if user.onboarding_step == 3:
                user.onboarding_step = 4
                db.commit()
                logger.info(f"[orchestrate] Onboarding complete, now in learning mode - ENGLISH IMMERSION")
            
            # Resposta pedagógica normal com histórico de conversa para contexto
            response = await generate_normal_tutoring_response(
                user_message, user, db, history=history or []
            )
            
            return {
                'response': response,
                'stage': 'learning',
                'teaching_context': f"Ensinando sobre interesses do aluno: {user.daily_interests}",
                'interests': [user.daily_interests] if user.daily_interests else []
            }
        
    except Exception as e:
        logger.error(f"[orchestrate] ERROR: {str(e)}", exc_info=True)
        return {
            'response': 'There was an error. Can you repeat your message?',
            'stage': 'error',
            'interests': []
        }
