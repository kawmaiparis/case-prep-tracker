from datetime import date as date_type
from typing import List, Optional

import typer
from rich import box
from rich.console import Console
from rich.table import Table

from . import db, reports
from .models import CASE_TYPES, SCORE_DIMENSIONS, Session

app = typer.Typer(help="Case interview prep tracker", add_completion=False)
console = Console()

KNOWN_PARTNERS = ["Annika", "Robbie", "Adam", "Mix", "Noon", "Poomer"]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _pick(prompt: str, options: List[str]) -> str:
    """Print a numbered menu and return the chosen option."""
    for i, opt in enumerate(options, 1):
        console.print(f"  {i}. {opt}")
    while True:
        raw = typer.prompt(prompt)
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]
        console.print(f"[red]Enter a number 1–{len(options)}[/red]")


def _score(label: str) -> int:
    """Prompt for a 1–5 score, retry until valid."""
    while True:
        raw = typer.prompt(f"  {label} (1–5)")
        if raw.isdigit() and 1 <= int(raw) <= 5:
            return int(raw)
        console.print("[red]Enter a number 1–5[/red]")


def _fmt_score(score: Optional[int]) -> str:
    """Color-coded score for Rich tables."""
    if score is None:
        return "-"
    color = {1: "red", 2: "red", 3: "yellow", 4: "green", 5: "bright_green"}[score]
    return f"[{color}]{score}[/{color}]"


# ── Commands ──────────────────────────────────────────────────────────────────

@app.command()
def log():
    """Log a new practice session."""
    db.init_db()
    console.print("\n[bold]Log a session[/bold]\n")

    today = date_type.today().isoformat()
    session_date = typer.prompt("Date", default=today)

    console.print(f"Known partners: {', '.join(KNOWN_PARTNERS)}")
    partner = typer.prompt("Partner").strip()

    case_name = typer.prompt("Case name (optional)", default="").strip() or None
    case_book = typer.prompt("Case book (optional, e.g. Kellogg 2024)", default="").strip() or None

    console.print("\nCase type:")
    case_type = _pick("Choose", CASE_TYPES)

    industry = typer.prompt("\nIndustry (optional)", default="").strip() or None

    console.print("\nScores:")
    scores = {dim: _score(dim.capitalize()) for dim in SCORE_DIMENSIONS}

    notes = typer.prompt("\nNotes (optional)", default="").strip() or None

    session = Session(
        date=session_date,
        partner=partner,
        case_name=case_name,
        case_book=case_book,
        case_type=case_type,
        industry=industry,
        score_structure=scores["structure"],
        score_math=scores["math"],
        score_creativity=scores["creativity"],
        score_communication=scores["communication"],
        notes=notes,
    )

    session_id = db.insert_session(session)
    console.print(f"\n[green]Session #{session_id} saved.[/green]")


@app.command()
def sessions(n: int = typer.Option(10, "--n", help="Number of sessions to show")):
    """Show recent sessions in a table."""
    db.init_db()
    rows = db.get_recent_sessions(n)
    if not rows:
        console.print("No sessions logged yet.")
        return

    t = Table(box=box.SIMPLE_HEAVY, show_header=True, header_style="bold")
    t.add_column("#", style="dim", no_wrap=True)
    t.add_column("Date", no_wrap=True)
    t.add_column("Partner")
    t.add_column("Case")
    t.add_column("Book")
    t.add_column("Type")
    t.add_column("Industry")
    t.add_column("Str", justify="center")
    t.add_column("Math", justify="center")
    t.add_column("Cre", justify="center")
    t.add_column("Com", justify="center")

    for s in rows:
        t.add_row(
            str(s.id),
            s.date,
            s.partner,
            s.case_name or "–",
            s.case_book or "–",
            s.case_type,
            s.industry or "–",
            _fmt_score(s.score_structure),
            _fmt_score(s.score_math),
            _fmt_score(s.score_creativity),
            _fmt_score(s.score_communication),
        )

    console.print(t)


@app.command()
def report():
    """Summary: partners, avg scores, weakest dimension, case types."""
    db.init_db()
    all_sessions = db.get_all_sessions()
    if not all_sessions:
        console.print("No sessions logged yet.")
        return

    console.print("\n[bold]Sessions by partner[/bold]")
    t = Table(box=box.SIMPLE_HEAVY)
    t.add_column("Partner")
    t.add_column("Sessions", justify="right")
    for partner, count in reports.sessions_per_partner(all_sessions).items():
        t.add_row(partner, str(count))
    console.print(t)

    console.print("\n[bold]Average scores (all time)[/bold]")
    t = Table(box=box.SIMPLE_HEAVY)
    t.add_column("Dimension")
    t.add_column("Avg", justify="right")
    avgs = reports.avg_scores(all_sessions)
    for dim, avg in sorted(avgs.items(), key=lambda x: x[1]):
        t.add_row(dim.capitalize(), f"{avg:.2f}")
    console.print(t)

    weak = reports.weakest_dimension(all_sessions, n=10)
    console.print(f"\n[bold]Weakest dimension[/bold] (last 10 sessions): [yellow]{weak.capitalize()}[/yellow]")

    console.print("\n[bold]Case types practiced[/bold]")
    t = Table(box=box.SIMPLE_HEAVY)
    t.add_column("Case type")
    t.add_column("Count", justify="right")
    for ct, count in reports.case_type_counts(all_sessions).items():
        t.add_row(ct, str(count))
    console.print(t)


@app.command()
def drill():
    """Drill plan for your next session based on weakest dimensions."""
    db.init_db()
    all_sessions = db.get_all_sessions()
    if not all_sessions:
        console.print("No sessions logged yet.")
        return

    plan = reports.drill_plan(all_sessions)
    if not plan:
        console.print("Not enough data for a drill plan.")
        return

    console.print("\n[bold]Your drill plan[/bold] — based on last 10 sessions\n")
    for dim, avg, suggestions in plan:
        console.print(f"[bold yellow]{dim.capitalize()}[/bold yellow]  avg {avg:.2f}/5")
        for s in suggestions:
            console.print(f"  • {s}")
        console.print()


@app.command()
def partners():
    """List all partners and session counts."""
    db.init_db()
    all_sessions = db.get_all_sessions()
    counts = reports.sessions_per_partner(all_sessions)
    if not counts:
        console.print("No sessions logged yet.")
        return

    t = Table(box=box.SIMPLE_HEAVY)
    t.add_column("Partner")
    t.add_column("Sessions", justify="right")
    for partner, count in counts.items():
        t.add_row(partner, str(count))
    console.print(t)
