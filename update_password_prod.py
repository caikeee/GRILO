#!/usr/bin/env python
"""Update password for user in Railway PostgreSQL."""

import psycopg2
from psycopg2 import sql
import os
from urllib.parse import urlparse

def update_password(db_url, username, new_password):
    try:
        parsed = urlparse(db_url)
        conn_params = {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path.lstrip('/'),
            'user': parsed.username,
            'password': parsed.password,
        }

        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()

        cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

        query = sql.SQL("""
            UPDATE users
            SET password_hash = crypt(%s, gen_salt('bf', 12))
            WHERE username = %s;
        """)

        cursor.execute(query, (new_password, username))
        conn.commit()

        affected_rows = cursor.rowcount
        if affected_rows > 0:
            print(f"Senha atualizada com sucesso para usuario '{username}'")
        else:
            print(f"Usuario '{username}' nao encontrado")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Erro: DATABASE_URL nao definida")
        exit(1)

    update_password(database_url, 'caike', '123456789asd')
