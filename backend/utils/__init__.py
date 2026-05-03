from datetime import date as _date, datetime as _datetime

# XP thresholds per level (index = level - 1, value = XP needed to REACH that level)
# Level 1: 0 XP | Level 2: 200 | Level 3: 600 | Level 4: 1400 | Level 5: 2800 | Level 6: 5000
_XP_THRESHOLDS = [0, 200, 600, 1400, 2800, 5000]


def award_xp(db, user_id: int, amount: int, source: str = "general") -> dict:
    """
    Award XP to a user, update UserProgress.xp_daily, and check for level-up.
    Returns: {xp_earned, new_total, level_up, new_level, old_level}
    Silent-fail on any error (returns zeros dict).
    """
    try:
        from db_models import User, UserProgress

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1, "old_level": 1}

        old_level = user.level or 1
        old_xp = user.xp or 0

        # Update total XP
        user.xp = old_xp + amount

        # Update UserProgress.xp_daily
        up = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if up:
            up.xp_daily = (up.xp_daily or 0) + amount
        else:
            from db_models import UserProgress as UP
            db.add(UP(user_id=user_id, xp_daily=amount))
            db.flush()
            up = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()

        # Determine new level based on total XP
        new_level = 1
        for lvl, threshold in enumerate(_XP_THRESHOLDS, start=1):
            if user.xp >= threshold:
                new_level = lvl
        new_level = min(new_level, 6)
        user.level = new_level

        db.commit()

        return {
            "xp_earned": amount,
            "new_total": user.xp,
            "level_up": new_level > old_level,
            "new_level": new_level,
            "old_level": old_level,
        }
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        return {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1, "old_level": 1}


def update_streak(db, user_id: int) -> dict:
    """
    Check and update the user's daily streak.
    - Called once per login/session.
    - Increments streak if last active was yesterday, resets to 1 if gap > 1 day.
    - Awards 5 XP for maintaining streak (+5 bonus per day of streak).
    Returns: {streak, streak_bonus_xp, is_new_day}
    """
    try:
        from db_models import User, UserProgress

        today = _date.today()
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"streak": 0, "streak_bonus_xp": 0, "is_new_day": False}

        last_active = user.last_active
        if last_active:
            last_date = last_active.date() if hasattr(last_active, "date") else _date.fromisoformat(str(last_active)[:10])
        else:
            last_date = None

        if last_date == today:
            # Already active today — no change
            return {"streak": user.streak or 0, "streak_bonus_xp": 0, "is_new_day": False}

        if last_date is None or (today - last_date).days > 1:
            # Gap > 1 day or first login — reset streak
            user.streak = 1
        else:
            # Exactly yesterday — increment streak
            user.streak = (user.streak or 0) + 1

        user.last_active = _datetime.utcnow()

        # Update UserProgress
        up = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
        if up:
            up.streak_count = user.streak
            up.xp_daily = 0  # Reset daily XP at start of new day
            up.last_active_date = _datetime.utcnow()

        db.commit()

        # Streak bonus XP: 5 base + 5 per day (capped at 30 for streaks >= 5)
        streak_bonus = min(5 + (user.streak - 1) * 5, 30)

        return {"streak": user.streak, "streak_bonus_xp": streak_bonus, "is_new_day": True}
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        return {"streak": 0, "streak_bonus_xp": 0, "is_new_day": False}


def mark_activity(db, user_id: int, activity_type: str = "general") -> None:
    """Increment today's activity count for the user by type. Silent-fail on any error."""
    try:
        from db_models import UserActivity
        today = _date.today().isoformat()
        existing = (
            db.query(UserActivity)
            .filter(
                UserActivity.user_id == user_id,
                UserActivity.date == today,
                UserActivity.activity_type == activity_type,
            )
            .first()
        )
        if existing:
            existing.count += 1
        else:
            db.add(UserActivity(user_id=user_id, date=today, activity_type=activity_type))
        db.commit()
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
