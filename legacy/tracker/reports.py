"""
Pure aggregation and recommendation logic. No I/O, no SQL — just Session lists in, results out.
"""

from typing import Dict, List, Tuple

from .models import Session, SCORE_DIMENSIONS

# Specific drills per dimension, ordered from most impactful to supplementary.
_DRILLS: Dict[str, List[str]] = {
    "structure": [
        "Build a MECE issue tree for 3 different case types without notes — 60 seconds each",
        "After each branch, stress-test with 'what else could explain this?'",
        "Practice leading with the 'so what' before walking through your framework",
    ],
    "math": [
        "Run 10 market-sizing calculations as mental math warmup before your next session",
        "Work through a profitability case focused only on getting numbers right quickly",
        "Practice segmentation math: break a large market into segments with different margins",
    ],
    "creativity": [
        "Brainstorm 10 revenue levers before settling on your framework — no filtering",
        "For each case branch, name the counterintuitive root cause before the obvious one",
        "Study 2 BCG/Bain published cases that had non-obvious recommendations",
    ],
    "communication": [
        "Record a 2-minute synthesis and watch it back — flag filler words and hedging",
        "Apply the 'so what?' test after every statement: why does the interviewer care?",
        "Practice signposting out loud: 'I want to focus on X because Y' before every branch",
    ],
}


def avg_scores(sessions: List[Session]) -> Dict[str, float]:
    """Average score per dimension. Returns zeros if no sessions."""
    if not sessions:
        return {dim: 0.0 for dim in SCORE_DIMENSIONS}
    totals = {dim: 0 for dim in SCORE_DIMENSIONS}
    for s in sessions:
        for dim in SCORE_DIMENSIONS:
            val = getattr(s, f"score_{dim}")
            if val is not None:
                totals[dim] += val
    return {dim: totals[dim] / len(sessions) for dim in SCORE_DIMENSIONS}


def weakest_dimension(sessions: List[Session], n: int = 10) -> str:
    """Dimension with the lowest average score over the last n sessions."""
    avgs = avg_scores(sessions[:n])
    return min(avgs, key=lambda d: avgs[d])


def sessions_per_partner(sessions: List[Session]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for s in sessions:
        counts[s.partner] = counts.get(s.partner, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))


def case_type_counts(sessions: List[Session]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for s in sessions:
        counts[s.case_type] = counts.get(s.case_type, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))


def drill_plan(sessions: List[Session]) -> List[Tuple[str, float, List[str]]]:
    """
    Top 2 weakest dimensions from the last 10 sessions, each with drill suggestions.
    Returns list of (dimension, avg_score, [suggestions]).
    """
    recent = sessions[:10]
    if not recent:
        return []
    avgs = avg_scores(recent)
    ranked = sorted(avgs.items(), key=lambda x: x[1])
    return [(dim, score, _DRILLS[dim]) for dim, score in ranked[:2]]
