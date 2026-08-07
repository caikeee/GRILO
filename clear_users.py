#!/usr/bin/env python
"""Clear all users and user progress from the database."""

from backend.database import SessionLocal
from backend.db_models import User, UserProgress

def clear_all_users():
    db = SessionLocal()
    try:
        # Delete all user progress first (foreign key constraint)
        progress_count = db.query(UserProgress).delete()
        print(f"Deletado {progress_count} registros de progresso")

        # Delete all users
        user_count = db.query(User).delete()
        print(f"Deletado {user_count} usuarios")

        db.commit()
        print("Database limpo com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"Erro ao limpar database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_users()
