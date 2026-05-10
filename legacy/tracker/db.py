"""
All SQLite access lives here. The rest of the app works with Session dataclasses only.
To migrate to Postgres: rewrite this file, keep the same function signatures.
"""

import sqlite3
from pathlib import Path
from typing import List

from .models import Session

DB_PATH = Path(__file__).parent.parent / "sessions.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                date                TEXT    NOT NULL,
                partner             TEXT    NOT NULL,
                case_name           TEXT,
                case_book           TEXT,
                case_type           TEXT    NOT NULL,
                industry            TEXT,
                score_structure     INTEGER CHECK(score_structure     BETWEEN 1 AND 5),
                score_math          INTEGER CHECK(score_math          BETWEEN 1 AND 5),
                score_creativity    INTEGER CHECK(score_creativity    BETWEEN 1 AND 5),
                score_communication INTEGER CHECK(score_communication BETWEEN 1 AND 5),
                notes               TEXT,
                created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)


def insert_session(session: Session) -> int:
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO sessions (
                date, partner, case_name, case_book, case_type, industry,
                score_structure, score_math, score_creativity, score_communication, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session.date,
                session.partner,
                session.case_name,
                session.case_book,
                session.case_type,
                session.industry,
                session.score_structure,
                session.score_math,
                session.score_creativity,
                session.score_communication,
                session.notes,
            ),
        )
        return cursor.lastrowid


def get_recent_sessions(n: int = 10) -> List[Session]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY date DESC, created_at DESC LIMIT ?", (n,)
        ).fetchall()
    return [_to_session(r) for r in rows]


def get_all_sessions() -> List[Session]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY date DESC, created_at DESC"
        ).fetchall()
    return [_to_session(r) for r in rows]


def _to_session(row: sqlite3.Row) -> Session:
    return Session(
        id=row["id"],
        date=row["date"],
        partner=row["partner"],
        case_name=row["case_name"],
        case_book=row["case_book"],
        case_type=row["case_type"],
        industry=row["industry"],
        score_structure=row["score_structure"],
        score_math=row["score_math"],
        score_creativity=row["score_creativity"],
        score_communication=row["score_communication"],
        notes=row["notes"],
        created_at=row["created_at"],
    )
