from dataclasses import dataclass
from typing import Optional

SCORE_DIMENSIONS = ["structure", "math", "creativity", "communication"]

CASE_TYPES = ["profitability", "market_entry", "ma", "market_sizing", "other"]


@dataclass
class Session:
    date: str
    partner: str
    case_type: str
    score_structure: int
    score_math: int
    score_creativity: int
    score_communication: int
    case_name: Optional[str] = None
    case_book: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[str] = None
