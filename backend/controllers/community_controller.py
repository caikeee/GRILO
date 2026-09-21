"""Controller da Comunidade (frontend/community.html).

Espaço público de pauta — não é chat. Qualquer usuário logado levanta um
tópico (sugestão, correção de conteúdo, bug, recurso ou dúvida), a
comunidade prioriza por voto, e só admin move o tópico pelos estados
(open → in_progress → resolved/declined). Cada mudança de status deixa um
comentário de sistema no tópico, pra que a decisão fique visível a quem
votou em vez de o tópico sumir sem explicação.

Votação é só upvote: downvote em comunidade pequena vira punição social e
cala quem propõe.

Endpoints:
    GET    /api/community/topics                  → feed (filtros + ordenação)
    POST   /api/community/topics                  → cria tópico
    GET    /api/community/topics/{id}             → detalhe + comentários
    POST   /api/community/topics/{id}/vote        → alterna voto
    POST   /api/community/topics/{id}/comments    → comenta
    PATCH  /api/community/topics/{id}/status      → muda status (admin)
    DELETE /api/community/topics/{id}             → remove tópico (admin)
    GET    /api/community/leaderboard             → top contribuidores
    GET    /api/community/notifications           → novidades nos tópicos do usuário
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.admin_controller import verify_admin
from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import (
    COMMUNITY_STATUSES,
    COMMUNITY_TYPES,
    CommunityComment,
    CommunityTopic,
    CommunityVote,
    User,
)

router = APIRouter(tags=["community"])
logger = logging.getLogger(__name__)

# Um tópico a cada 6h por usuário — trava de ruído, não de participação
# (votar e comentar seguem livres).
TOPIC_COOLDOWN_HOURS = 6
MAX_TAGS = 5
MAX_TAG_LEN = 24


# ── Payloads ─────────────────────────────────────────────────────────────
class _TopicCreate(BaseModel):
    type: str
    title: str = Field(min_length=5, max_length=120)
    description: str = Field(min_length=10, max_length=2000)
    lesson_slug: Optional[str] = Field(default=None, max_length=60)
    tags: Optional[List[str]] = None

    @field_validator("type")
    @classmethod
    def _valid_type(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in COMMUNITY_TYPES:
            raise ValueError(f"type deve ser um de: {', '.join(COMMUNITY_TYPES)}")
        return v

    @field_validator("title", "description")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("campo obrigatório")
        return v

    @field_validator("tags")
    @classmethod
    def _clean_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if not v:
            return None
        cleaned = []
        for tag in v:
            tag = (tag or "").strip().lower()[:MAX_TAG_LEN]
            if tag and tag not in cleaned:
                cleaned.append(tag)
        return cleaned[:MAX_TAGS] or None


class _CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)

    @field_validator("content")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("comentário vazio")
        return v


class _StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = Field(default=None, max_length=300)

    @field_validator("status")
    @classmethod
    def _valid_status(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in COMMUNITY_STATUSES:
            raise ValueError(f"status deve ser um de: {', '.join(COMMUNITY_STATUSES)}")
        return v


# ── Serialização ─────────────────────────────────────────────────────────
STATUS_LABELS = {
    "open": "Aberto",
    "in_progress": "Em andamento",
    "resolved": "Resolvido",
    "declined": "Recusado",
}


def _author_payload(user: Optional[User]) -> dict:
    if not user:
        return {"id": None, "username": "Usuário removido", "initials": "?"}
    name = user.username or "?"
    return {
        "id": user.id,
        "username": name,
        "initials": name[:2].upper(),
    }


def _topic_payload(topic: CommunityTopic, voted: bool, is_owner: bool) -> dict:
    return {
        "id": topic.id,
        "type": topic.type,
        "title": topic.title,
        "description": topic.description,
        "status": topic.status,
        "status_label": STATUS_LABELS.get(topic.status, topic.status),
        "lesson_slug": topic.lesson_slug,
        "tags": topic.tags or [],
        "vote_count": topic.vote_count,
        "comment_count": topic.comment_count,
        "created_at": topic.created_at.isoformat() if topic.created_at else None,
        "resolved_at": topic.resolved_at.isoformat() if topic.resolved_at else None,
        "author": _author_payload(topic.author),
        "has_voted": voted,
        "is_owner": is_owner,
    }


def _comment_payload(comment: CommunityComment) -> dict:
    return {
        "id": comment.id,
        "content": comment.content,
        "is_system": bool(comment.is_system),
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
        "author": _author_payload(comment.author),
    }


def _get_topic_or_404(db: Session, topic_id: int) -> CommunityTopic:
    topic = db.query(CommunityTopic).filter(CommunityTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Tópico não encontrado")
    return topic


# ── Feed ─────────────────────────────────────────────────────────────────
@router.get("/api/community/topics")
async def list_topics(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    type: Optional[str] = None,
    status: Optional[str] = None,
    sort: str = Query("trending", pattern="^(trending|newest|most_voted)$"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    """Feed de tópicos com filtro por tipo/status e ordenação."""
    query = db.query(CommunityTopic)

    if type:
        type = type.strip().lower()
        if type not in COMMUNITY_TYPES:
            raise HTTPException(status_code=400, detail="Tipo inválido")
        query = query.filter(CommunityTopic.type == type)

    if status:
        status = status.strip().lower()
        if status not in COMMUNITY_STATUSES:
            raise HTTPException(status_code=400, detail="Status inválido")
        query = query.filter(CommunityTopic.status == status)

    if sort == "newest":
        query = query.order_by(CommunityTopic.created_at.desc())
    elif sort == "most_voted":
        query = query.order_by(CommunityTopic.vote_count.desc(), CommunityTopic.created_at.desc())
    else:
        # Trending: o que ainda está em aberto sobe, e dentro disso o mais votado.
        # Resolvidos/recusados continuam acessíveis, mas não competem pelo topo.
        query = query.order_by(
            (CommunityTopic.status == "open").desc(),
            CommunityTopic.vote_count.desc(),
            CommunityTopic.created_at.desc(),
        )

    total = query.count()
    topics = query.offset(offset).limit(limit).all()

    voted_ids = set()
    if topics:
        rows = (
            db.query(CommunityVote.topic_id)
            .filter(
                CommunityVote.user_id == user_id,
                CommunityVote.topic_id.in_([t.id for t in topics]),
            )
            .all()
        )
        voted_ids = {r[0] for r in rows}

    counts = dict(
        db.query(CommunityTopic.status, func.count(CommunityTopic.id))
        .group_by(CommunityTopic.status)
        .all()
    )

    return {
        "success": True,
        "total": total,
        "open_count": counts.get("open", 0),
        "topics": [
            _topic_payload(t, t.id in voted_ids, t.user_id == user_id) for t in topics
        ],
    }


@router.post("/api/community/topics", status_code=201)
async def create_topic(
    body: _TopicCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Cria um tópico. Um por usuário a cada 6h."""
    cutoff = datetime.utcnow() - timedelta(hours=TOPIC_COOLDOWN_HOURS)
    recent = (
        db.query(CommunityTopic)
        .filter(CommunityTopic.user_id == user_id, CommunityTopic.created_at > cutoff)
        .first()
    )
    if recent:
        raise HTTPException(
            status_code=429,
            detail=f"Você já abriu um tópico nas últimas {TOPIC_COOLDOWN_HOURS}h. Aproveite para votar ou comentar nos que já existem.",
        )

    # Título idêntico ainda aberto = provável duplicata; aponta o original.
    duplicate = (
        db.query(CommunityTopic)
        .filter(
            func.lower(CommunityTopic.title) == body.title.lower(),
            CommunityTopic.status.in_(["open", "in_progress"]),
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um tópico aberto com esse título (#{duplicate.id}). Vote nele para dar mais peso.",
        )

    topic = CommunityTopic(
        user_id=user_id,
        type=body.type,
        title=body.title,
        description=body.description,
        lesson_slug=(body.lesson_slug or None) if body.type == "correction" else None,
        tags=body.tags,
        status="open",
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)

    logger.info("[COMMUNITY] topic %s created by user %s (%s)", topic.id, user_id, topic.type)
    return {"success": True, "topic": _topic_payload(topic, False, True)}


@router.get("/api/community/topics/{topic_id}")
async def get_topic(
    topic_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Detalhe de um tópico com a thread de comentários."""
    topic = _get_topic_or_404(db, topic_id)

    voted = (
        db.query(CommunityVote)
        .filter(CommunityVote.topic_id == topic_id, CommunityVote.user_id == user_id)
        .first()
        is not None
    )
    comments = (
        db.query(CommunityComment)
        .filter(CommunityComment.topic_id == topic_id)
        .order_by(CommunityComment.created_at.asc())
        .all()
    )

    return {
        "success": True,
        "topic": _topic_payload(topic, voted, topic.user_id == user_id),
        "comments": [_comment_payload(c) for c in comments],
    }


@router.post("/api/community/topics/{topic_id}/vote")
async def toggle_vote(
    topic_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Alterna o voto do usuário no tópico."""
    topic = _get_topic_or_404(db, topic_id)

    existing = (
        db.query(CommunityVote)
        .filter(CommunityVote.topic_id == topic_id, CommunityVote.user_id == user_id)
        .first()
    )

    if existing:
        db.delete(existing)
        voted = False
    else:
        db.add(CommunityVote(topic_id=topic_id, user_id=user_id))
        voted = True

    db.flush()
    topic.vote_count = (
        db.query(func.count(CommunityVote.id))
        .filter(CommunityVote.topic_id == topic_id)
        .scalar()
        or 0
    )
    db.commit()

    return {"success": True, "has_voted": voted, "vote_count": topic.vote_count}


@router.post("/api/community/topics/{topic_id}/comments", status_code=201)
async def create_comment(
    topic_id: int,
    body: _CommentCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Adiciona um comentário à thread do tópico."""
    topic = _get_topic_or_404(db, topic_id)

    comment = CommunityComment(topic_id=topic_id, user_id=user_id, content=body.content)
    db.add(comment)
    db.flush()

    topic.comment_count = (
        db.query(func.count(CommunityComment.id))
        .filter(CommunityComment.topic_id == topic_id)
        .scalar()
        or 0
    )
    db.commit()
    db.refresh(comment)

    return {
        "success": True,
        "comment": _comment_payload(comment),
        "comment_count": topic.comment_count,
    }


@router.patch("/api/community/topics/{topic_id}/status")
async def update_status(
    topic_id: int,
    body: _StatusUpdate,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Move o tópico de estado e registra a decisão na thread (admin)."""
    topic = _get_topic_or_404(db, topic_id)

    if topic.status == body.status:
        raise HTTPException(status_code=400, detail="O tópico já está nesse status")

    previous = topic.status
    topic.status = body.status
    topic.resolved_at = datetime.utcnow() if body.status in ("resolved", "declined") else None

    note = f"Status alterado de \"{STATUS_LABELS.get(previous, previous)}\" para \"{STATUS_LABELS.get(body.status, body.status)}\"."
    if body.note:
        note = f"{note} {body.note.strip()}"

    db.add(
        CommunityComment(
            topic_id=topic_id,
            user_id=admin.id,
            content=note[:500],
            is_system=True,
        )
    )
    db.flush()

    topic.comment_count = (
        db.query(func.count(CommunityComment.id))
        .filter(CommunityComment.topic_id == topic_id)
        .scalar()
        or 0
    )
    db.commit()
    db.refresh(topic)

    logger.info("[COMMUNITY] topic %s: %s → %s by admin %s", topic_id, previous, body.status, admin.id)
    return {"success": True, "topic": _topic_payload(topic, False, False)}


@router.delete("/api/community/topics/{topic_id}")
async def delete_topic(
    topic_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db),
):
    """Remove um tópico e tudo que pende dele (admin)."""
    topic = _get_topic_or_404(db, topic_id)
    db.delete(topic)
    db.commit()
    logger.info("[COMMUNITY] topic %s deleted by admin %s", topic_id, admin.id)
    return {"success": True}


@router.get("/api/community/leaderboard")
async def leaderboard(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=25),
):
    """Top contribuidores: quem teve tópicos resolvidos e quem mais propôs."""
    resolved_rows = (
        db.query(
            User.id,
            User.username,
            func.count(CommunityTopic.id).label("resolved"),
        )
        .join(CommunityTopic, CommunityTopic.user_id == User.id)
        .filter(CommunityTopic.status == "resolved")
        .group_by(User.id, User.username)
        .order_by(func.count(CommunityTopic.id).desc())
        .limit(limit)
        .all()
    )

    proposed_rows = (
        db.query(
            User.id,
            User.username,
            func.count(CommunityTopic.id).label("topics"),
        )
        .join(CommunityTopic, CommunityTopic.user_id == User.id)
        .group_by(User.id, User.username)
        .order_by(func.count(CommunityTopic.id).desc())
        .limit(limit)
        .all()
    )

    return {
        "success": True,
        "resolved": [
            {"user_id": r[0], "username": r[1], "initials": (r[1] or "?")[:2].upper(), "count": r[2]}
            for r in resolved_rows
        ],
        "proposed": [
            {"user_id": r[0], "username": r[1], "initials": (r[1] or "?")[:2].upper(), "count": r[2]}
            for r in proposed_rows
        ],
    }


@router.get("/api/community/notifications")
async def notifications(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=30),
):
    """Novidades nos tópicos que o usuário criou ou votou."""
    own_ids = [
        r[0] for r in db.query(CommunityTopic.id).filter(CommunityTopic.user_id == user_id).all()
    ]
    voted_ids = [
        r[0] for r in db.query(CommunityVote.topic_id).filter(CommunityVote.user_id == user_id).all()
    ]
    followed = set(own_ids) | set(voted_ids)
    if not followed:
        return {"success": True, "items": []}

    rows = (
        db.query(CommunityComment, CommunityTopic)
        .join(CommunityTopic, CommunityComment.topic_id == CommunityTopic.id)
        .filter(
            CommunityComment.topic_id.in_(followed),
            CommunityComment.user_id != user_id,
        )
        .order_by(CommunityComment.created_at.desc())
        .limit(limit)
        .all()
    )

    items = []
    for comment, topic in rows:
        items.append({
            "topic_id": topic.id,
            "topic_title": topic.title,
            "kind": "status" if comment.is_system else "comment",
            "preview": comment.content[:120],
            "is_own_topic": topic.user_id == user_id,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
        })

    return {"success": True, "items": items}
