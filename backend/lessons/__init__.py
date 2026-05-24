"""
Lesson data registry. Each lesson lives in its own module.
Slug format: a1-m{module}-{topic} (hyphens in slug, underscores in filename)
"""
from .a1_m1_pronomes import LESSON as a1_m1_pronomes
from .a1_m1_perguntas import LESSON as a1_m1_perguntas
from .a1_m1_negativa import LESSON as a1_m1_negativa
from .a1_m1_passado import LESSON as a1_m1_passado
from .a1_m1_preposicoes import LESSON as a1_m1_preposicoes
from .a1_m1_verbos import LESSON as a1_m1_verbos
from .a1_m2_alfabeto import LESSON as a1_m2_alfabeto
from .a1_m2_numeros import LESSON as a1_m2_numeros
from .a1_m2_cumprimentos import LESSON as a1_m2_cumprimentos
from .a1_m2_tobe_afirm import LESSON as a1_m2_tobe_afirm
from .a1_m2_pronomes_sujeito import LESSON as a1_m2_pronomes_sujeito
from .a1_m2_tobe_perg_neg import LESSON as a1_m2_tobe_perg_neg
from .a1_m2_possessivos import LESSON as a1_m2_possessivos
from .a1_m2_this_that import LESSON as a1_m2_this_that
from .a1_m3_present_afirm import LESSON as a1_m3_present_afirm
from .a1_m3_third_person_s import LESSON as a1_m3_third_person_s
from .a1_m3_present_continuous import LESSON as a1_m3_present_continuous
from .a1_m3_frequencia import LESSON as a1_m3_frequencia
from .a1_m4_wh_questions import LESSON as a1_m4_wh_questions
from .a1_m4_prep_tempo import LESSON as a1_m4_prep_tempo
from .a1_m4_rotina import LESSON as a1_m4_rotina
from .a1_m5_past_regular import LESSON as a1_m5_past_regular
from .a1_m5_past_perguntas import LESSON as a1_m5_past_perguntas
from .a1_m5_past_negativa import LESSON as a1_m5_past_negativa
from .a1_m6_can import LESSON as a1_m6_can
from .a1_m6_like_ing import LESSON as a1_m6_like_ing
from .a1_m6_want_to import LESSON as a1_m6_want_to

# ID → slug mapping (sequential, 1-indexed)
LESSON_REGISTRY = {
    1:  ("a1-m1-pronomes",          a1_m1_pronomes),
    2:  ("a1-m1-perguntas",         a1_m1_perguntas),
    3:  ("a1-m1-negativa",          a1_m1_negativa),
    4:  ("a1-m1-passado",           a1_m1_passado),
    5:  ("a1-m1-preposicoes",       a1_m1_preposicoes),
    6:  ("a1-m1-verbos",            a1_m1_verbos),
    7:  ("a1-m2-alfabeto",          a1_m2_alfabeto),
    8:  ("a1-m2-numeros",           a1_m2_numeros),
    9:  ("a1-m2-cumprimentos",      a1_m2_cumprimentos),
    10: ("a1-m2-tobe-afirm",        a1_m2_tobe_afirm),
    11: ("a1-m2-pronomes-sujeito",  a1_m2_pronomes_sujeito),
    12: ("a1-m2-tobe-perg-neg",     a1_m2_tobe_perg_neg),
    13: ("a1-m2-possessivos",       a1_m2_possessivos),
    14: ("a1-m2-this-that",         a1_m2_this_that),
    15: ("a1-m3-present-afirm",     a1_m3_present_afirm),
    16: ("a1-m3-third-person-s",    a1_m3_third_person_s),
    17: ("a1-m3-present-continuous",a1_m3_present_continuous),
    18: ("a1-m3-frequencia",        a1_m3_frequencia),
    19: ("a1-m4-wh-questions",      a1_m4_wh_questions),
    20: ("a1-m4-prep-tempo",        a1_m4_prep_tempo),
    21: ("a1-m4-rotina",            a1_m4_rotina),
    22: ("a1-m5-past-regular",      a1_m5_past_regular),
    23: ("a1-m5-past-perguntas",    a1_m5_past_perguntas),
    24: ("a1-m5-past-negativa",     a1_m5_past_negativa),
    25: ("a1-m6-can",               a1_m6_can),
    26: ("a1-m6-like-ing",          a1_m6_like_ing),
    27: ("a1-m6-want-to",           a1_m6_want_to),
}

# Slug → (id, lesson_data)
SLUG_TO_ID = {slug: lesson_id for lesson_id, (slug, _) in LESSON_REGISTRY.items()}

def get_lesson_by_id(lesson_id: int):
    entry = LESSON_REGISTRY.get(lesson_id)
    if entry:
        slug, lesson = entry
        return {"id": lesson_id, "slug": slug, **lesson}
    return None

def get_id_by_slug(slug: str) -> int | None:
    return SLUG_TO_ID.get(slug)
