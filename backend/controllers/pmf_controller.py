"""
PMF Controller — tracking dos eventos de funil de monetizacao + dashboard de PMF.

Eventos cobertos aqui (os outros ficam em auth/voice):
  - paywall_viewed
  - payment_completed (registro manual ou via webhook futuro)

Dashboard:
  - GET /api/admin/pmf/metrics  (admin) — JSON com as 6 metricas norteadoras
"""

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Set

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.admin_controller import verify_admin
from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import AnalyticsEvent, User
from backend.utils import track_metric_event

router = APIRouter(tags=["pmf"])


# ---------- Eventos de funil de monetizacao ----------


class PaywallViewedRequest(BaseModel):
    trigger: str = Field(default="unknown", max_length=60)  # ex: "session_limit", "voice_minutes_cap"
    plan_shown: Optional[str] = Field(default=None, max_length=40)


class PaymentCompletedRequest(BaseModel):
    plan: str = Field(max_length=40)
    amount_brl: float = Field(ge=0)
    method: str = Field(default="pix_manual", max_length=20)
    user_id: Optional[int] = None  # admin pode registrar pagamento manual de outro usuario


@router.post("/api/pmf/paywall-viewed")
async def paywall_viewed(
    body: PaywallViewedRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    track_metric_event(
        db,
        int(user_id),
        "funnel",
        "paywall_viewed",
        details={"trigger": body.trigger, "plan_shown": body.plan_shown},
    )
    return {"ok": True}


@router.post("/api/pmf/payment-completed")
async def payment_completed_self(
    body: PaymentCompletedRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Endpoint do proprio usuario confirmar pagamento (ex: apos PIX) — usado em fluxo MVP."""
    target_user = int(body.user_id) if body.user_id else int(user_id)
    track_metric_event(
        db,
        target_user,
        "funnel",
        "payment_completed",
        details={"plan": body.plan, "amount_brl": body.amount_brl, "method": body.method},
    )
    return {"ok": True}


@router.post("/api/admin/pmf/payment-record")
async def admin_record_payment(
    body: PaymentCompletedRequest,
    db: Session = Depends(get_db),
    _: User = Depends(verify_admin),
):
    """Admin registra pagamento manual de qualquer usuario (PIX, boleto, etc)."""
    if not body.user_id:
        raise HTTPException(status_code=400, detail="user_id is required for admin record")
    track_metric_event(
        db,
        int(body.user_id),
        "funnel",
        "payment_completed",
        details={
            "plan": body.plan,
            "amount_brl": body.amount_brl,
            "method": body.method,
            "recorded_by_admin": True,
        },
    )
    return {"ok": True}


# ---------- Dashboard PMF ----------


def _events_by_user_first_date(db: Session, event_name: str) -> Dict[int, date]:
    """Para cada user_id, retorna a data da PRIMEIRA ocorrencia desse evento."""
    rows = (
        db.query(AnalyticsEvent.user_id, func.min(AnalyticsEvent.created_at))
        .filter(AnalyticsEvent.event_name == event_name)
        .filter(AnalyticsEvent.user_id.isnot(None))
        .group_by(AnalyticsEvent.user_id)
        .all()
    )
    result: Dict[int, date] = {}
    for uid, ts in rows:
        if uid is None or ts is None:
            continue
        result[int(uid)] = ts.date() if hasattr(ts, "date") else date.fromisoformat(str(ts)[:10])
    return result


def _signup_date_by_user(db: Session) -> Dict[int, date]:
    """Data de signup por usuario (prioriza evento, fallback created_at do User)."""
    by_event = _events_by_user_first_date(db, "signup_completed")
    # fallback: usuarios que existem mas nao tem evento (criados antes do tracking)
    rows = db.query(User.id, User.created_at).all()
    for uid, created_at in rows:
        if uid is None or created_at is None:
            continue
        if int(uid) not in by_event:
            by_event[int(uid)] = (
                created_at.date() if hasattr(created_at, "date") else date.fromisoformat(str(created_at)[:10])
            )
    return by_event


def _voice_session_dates_by_user(db: Session) -> Dict[int, Set[date]]:
    """Para cada user, conjunto de datas em que teve voice_session_completed."""
    rows = (
        db.query(AnalyticsEvent.user_id, AnalyticsEvent.created_at)
        .filter(AnalyticsEvent.event_name == "voice_session_completed")
        .filter(AnalyticsEvent.user_id.isnot(None))
        .all()
    )
    out: Dict[int, Set[date]] = {}
    for uid, ts in rows:
        if uid is None or ts is None:
            continue
        d = ts.date() if hasattr(ts, "date") else date.fromisoformat(str(ts)[:10])
        out.setdefault(int(uid), set()).add(d)
    return out


def _iso_week_floor(d: date) -> date:
    """Segunda-feira da semana de d (semana ISO comeca segunda)."""
    return d - timedelta(days=d.weekday())


def _activation_d0(
    signups: Dict[int, date], voice_dates: Dict[int, Set[date]]
) -> Dict[str, Any]:
    """% de signups com >=1 voice_session_completed no MESMO dia."""
    if not signups:
        return {"percent": 0.0, "numerator": 0, "denominator": 0, "target": 50.0}
    activated = 0
    for uid, signup_day in signups.items():
        days = voice_dates.get(uid)
        if days and signup_day in days:
            activated += 1
    pct = round(activated / len(signups) * 100, 1)
    return {
        "percent": pct,
        "numerator": activated,
        "denominator": len(signups),
        "target": 50.0,
        "status": "ok" if pct >= 50 else ("warn" if pct >= 30 else "bad"),
    }


def _retention_cohort(
    signups: Dict[int, date],
    voice_dates: Dict[int, Set[date]],
    weeks_back: int = 8,
) -> Dict[str, Any]:
    """
    Heatmap de retencao por cohort semanal.
    Linhas: cohort (segunda-feira da semana de signup)
    Colunas: W0, W1, W2, W3, W4, W8 (% do cohort ativo naquela semana)
    """
    today = date.today()
    today_week = _iso_week_floor(today)
    cohorts: Dict[date, List[int]] = {}
    for uid, sday in signups.items():
        cw = _iso_week_floor(sday)
        cohorts.setdefault(cw, []).append(uid)

    week_offsets = [0, 1, 2, 3, 4, 8]
    rows: List[Dict[str, Any]] = []
    for cw in sorted(cohorts.keys(), reverse=True)[:weeks_back]:
        users = cohorts[cw]
        size = len(users)
        cells: Dict[str, Optional[float]] = {}
        for off in week_offsets:
            target_week = cw + timedelta(days=7 * off)
            if target_week > today_week:
                cells[f"W{off}"] = None  # futuro: nao podemos medir
                continue
            # ativos = users com pelo menos 1 voice_session_completed dentro da semana target
            week_start = target_week
            week_end = target_week + timedelta(days=7)
            active = 0
            for uid in users:
                ds = voice_dates.get(uid, set())
                if any(week_start <= d < week_end for d in ds):
                    active += 1
            cells[f"W{off}"] = round(active / size * 100, 1) if size else 0.0
        rows.append(
            {
                "cohort_week": cw.isoformat(),
                "cohort_size": size,
                "cells": cells,
            }
        )
    # destaca D7 e D30 medios (cohorts com idade suficiente)
    d7_vals = [r["cells"].get("W1") for r in rows if r["cells"].get("W1") is not None]
    d30_vals = [r["cells"].get("W4") for r in rows if r["cells"].get("W4") is not None]
    avg_d7 = round(sum(d7_vals) / len(d7_vals), 1) if d7_vals else 0.0
    avg_d30 = round(sum(d30_vals) / len(d30_vals), 1) if d30_vals else 0.0
    return {
        "rows": rows,
        "week_offsets": week_offsets,
        "avg_d7_percent": avg_d7,
        "avg_d30_percent": avg_d30,
        "target_d7": 35.0,
        "target_d30": 20.0,
        "status_d7": "ok" if avg_d7 >= 35 else ("warn" if avg_d7 >= 20 else "bad"),
        "status_d30": "ok" if avg_d30 >= 20 else ("warn" if avg_d30 >= 10 else "bad"),
    }


def _sessions_per_active_user(
    voice_dates: Dict[int, Set[date]],
    db: Session,
    weeks: int = 4,
) -> Dict[str, Any]:
    """Media de voice_session_completed por usuario ativo nas ultimas N semanas (por semana)."""
    today = date.today()
    cutoff = today - timedelta(days=7 * weeks)
    cutoff_dt = datetime.combine(cutoff, datetime.min.time())

    rows = (
        db.query(AnalyticsEvent.user_id, func.coalesce(func.sum(AnalyticsEvent.count), 0))
        .filter(AnalyticsEvent.event_name == "voice_session_completed")
        .filter(AnalyticsEvent.created_at >= cutoff_dt)
        .filter(AnalyticsEvent.user_id.isnot(None))
        .group_by(AnalyticsEvent.user_id)
        .all()
    )
    if not rows:
        return {
            "avg_sessions_per_user_per_week": 0.0,
            "active_users": 0,
            "total_sessions": 0,
            "weeks": weeks,
            "target": 2.5,
            "status": "bad",
        }
    total_sessions = sum(int(c or 0) for _, c in rows)
    active_users = len(rows)
    avg = round(total_sessions / active_users / weeks, 2)
    return {
        "avg_sessions_per_user_per_week": avg,
        "active_users": active_users,
        "total_sessions": total_sessions,
        "weeks": weeks,
        "target": 2.5,
        "status": "ok" if avg >= 2.5 else ("warn" if avg >= 1.5 else "bad"),
    }


def _minutes_per_active_user(db: Session, weeks: int = 4) -> Dict[str, Any]:
    """Media de minutos falados por usuario ativo por semana (extraido do details.duration_sec)."""
    today = date.today()
    cutoff = today - timedelta(days=7 * weeks)
    cutoff_dt = datetime.combine(cutoff, datetime.min.time())

    rows = (
        db.query(AnalyticsEvent.user_id, AnalyticsEvent.details)
        .filter(AnalyticsEvent.event_name == "voice_session_completed")
        .filter(AnalyticsEvent.created_at >= cutoff_dt)
        .filter(AnalyticsEvent.user_id.isnot(None))
        .all()
    )
    seconds_by_user: Dict[int, int] = {}
    for uid, details in rows:
        if uid is None:
            continue
        secs = 0
        if isinstance(details, dict):
            secs = int(details.get("duration_sec") or details.get("duration_seconds") or 0)
        seconds_by_user[int(uid)] = seconds_by_user.get(int(uid), 0) + secs
    if not seconds_by_user:
        return {
            "avg_minutes_per_user_per_week": 0.0,
            "active_users": 0,
            "total_minutes": 0.0,
            "weeks": weeks,
            "target": 15.0,
            "status": "bad",
        }
    total_minutes = sum(seconds_by_user.values()) / 60.0
    avg = round(total_minutes / len(seconds_by_user) / weeks, 1)
    return {
        "avg_minutes_per_user_per_week": avg,
        "active_users": len(seconds_by_user),
        "total_minutes": round(total_minutes, 1),
        "weeks": weeks,
        "target": 15.0,
        "status": "ok" if avg >= 15 else ("warn" if avg >= 8 else "bad"),
    }


def _paywall_conversion(db: Session, weeks: int = 4) -> Dict[str, Any]:
    """payment_completed / paywall_viewed nas ultimas N semanas."""
    today = date.today()
    cutoff = today - timedelta(days=7 * weeks)
    cutoff_dt = datetime.combine(cutoff, datetime.min.time())

    def _count(name: str) -> int:
        return int(
            db.query(func.coalesce(func.sum(AnalyticsEvent.count), 0))
            .filter(AnalyticsEvent.event_name == name)
            .filter(AnalyticsEvent.created_at >= cutoff_dt)
            .scalar()
            or 0
        )

    paywall = _count("paywall_viewed")
    paid = _count("payment_completed")
    pct = round(paid / paywall * 100, 1) if paywall > 0 else 0.0

    # MRR estimado a partir de details.amount_brl dos payments do periodo
    rows = (
        db.query(AnalyticsEvent.details)
        .filter(AnalyticsEvent.event_name == "payment_completed")
        .filter(AnalyticsEvent.created_at >= cutoff_dt)
        .all()
    )
    revenue = 0.0
    paying_users: Set[int] = set()
    for (details,) in rows:
        if isinstance(details, dict):
            revenue += float(details.get("amount_brl") or 0)
    paying_user_rows = (
        db.query(AnalyticsEvent.user_id)
        .filter(AnalyticsEvent.event_name == "payment_completed")
        .distinct()
        .all()
    )
    for (uid,) in paying_user_rows:
        if uid is not None:
            paying_users.add(int(uid))

    return {
        "paywall_viewed": paywall,
        "payment_completed": paid,
        "conversion_percent": pct,
        "revenue_brl_period": round(revenue, 2),
        "weeks": weeks,
        "paying_users_total": len(paying_users),
        "target": 3.0,
        "status": "ok" if pct >= 3 else ("warn" if pct >= 1 else "bad"),
    }


def _sean_ellis_eligible(db: Session, voice_dates: Dict[int, Set[date]]) -> Dict[str, Any]:
    """Quantos usuarios ja podem responder a pesquisa Sean Ellis (>=3 sessoes)."""
    counts = (
        db.query(AnalyticsEvent.user_id, func.coalesce(func.sum(AnalyticsEvent.count), 0))
        .filter(AnalyticsEvent.event_name == "voice_session_completed")
        .filter(AnalyticsEvent.user_id.isnot(None))
        .group_by(AnalyticsEvent.user_id)
        .all()
    )
    eligible = sum(1 for _, c in counts if int(c or 0) >= 3)
    return {
        "eligible_users": eligible,
        "ready_to_survey": eligible >= 30,
        "target": 30,
    }


@router.get("/api/admin/pmf/metrics")
async def get_pmf_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(verify_admin),
):
    """
    Retorna as 6 metricas norteadoras de PMF + cohort heatmap.
    Fonte: AnalyticsEvent (eventos canonicos definidos no plano de PMF).
    """
    signups = _signup_date_by_user(db)
    voice_dates = _voice_session_dates_by_user(db)

    return {
        "status": "ok",
        "generated_at": datetime.utcnow().isoformat(),
        "totals": {
            "signups_total": len(signups),
            "users_with_voice_session": len(voice_dates),
        },
        "metrics": {
            "activation_d0": _activation_d0(signups, voice_dates),
            "retention_cohort": _retention_cohort(signups, voice_dates),
            "sessions_per_user_week": _sessions_per_active_user(voice_dates, db),
            "minutes_per_user_week": _minutes_per_active_user(db),
            "paywall_conversion": _paywall_conversion(db),
            "sean_ellis_eligibility": _sean_ellis_eligible(db, voice_dates),
        },
    }
