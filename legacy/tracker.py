#!/usr/bin/env python3
import csv
import os
from datetime import date

DATA_FILE = "sessions.csv"

FIELDS = [
    "date", "partner", "firm_target", "industry", "case_type",
    "score_structure", "score_math", "score_communication", "score_overall",
    "case_name", "notes",
]

PARTNERS = ["Annika", "Robbie", "Adam", "Mix", "Noon", "Poomer"]
FIRMS = ["BCG", "Bain", "McKinsey", "Other"]
INDUSTRIES = [
    "Technology / TMT",
    "Retail / Consumer",
    "Healthcare / Pharma",
    "Financial Services / PE",
    "Energy / Industrials",
    "Public Sector",
    "Other",
]
CASE_TYPES = [
    "Profitability",
    "Market sizing",
    "Market entry",
    "M&A / Due diligence",
    "Operations",
    "Growth strategy",
    "Pricing",
    "Other",
]


def pick(prompt, options, allow_custom=False):
    print(f"\n{prompt}")
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    if allow_custom:
        print(f"  {len(options) + 1}. Other (type name)")
    while True:
        raw = input("Choice: ").strip()
        if raw.isdigit():
            idx = int(raw)
            if 1 <= idx <= len(options):
                return options[idx - 1]
            if allow_custom and idx == len(options) + 1:
                return input("Enter name: ").strip()
        print("  Invalid — try again.")


def score_prompt(label):
    while True:
        raw = input(f"  {label} (1-5): ").strip()
        if raw.isdigit() and 1 <= int(raw) <= 5:
            return int(raw)
        print("  Enter a number between 1 and 5.")


def load_sessions():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def log_session():
    partner = pick("Partner:", PARTNERS, allow_custom=True)
    firm = pick("Target firm:", FIRMS)
    industry = pick("Industry:", INDUSTRIES)
    case_type = pick("Case type:", CASE_TYPES)

    print("\nScores:")
    s_structure = score_prompt("Structure")
    s_math = score_prompt("Math")
    s_comm = score_prompt("Communication")
    s_overall = score_prompt("Overall")

    case_name = input("\nCase name (optional, press Enter to skip): ").strip()
    notes = input("Feedback / notes (optional): ").strip()

    row = {
        "date": date.today().isoformat(),
        "partner": partner,
        "firm_target": firm,
        "industry": industry,
        "case_type": case_type,
        "score_structure": s_structure,
        "score_math": s_math,
        "score_communication": s_comm,
        "score_overall": s_overall,
        "case_name": case_name,
        "notes": notes,
    }

    write_header = not os.path.exists(DATA_FILE)
    with open(DATA_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if write_header:
            writer.writeheader()
        writer.writerow(row)

    print("\nSession logged.")


def view_sessions():
    sessions = load_sessions()
    if not sessions:
        print("\nNo sessions logged yet.")
        return

    sessions = list(reversed(sessions))
    header = (
        f"{'#':<4} {'Date':<12} {'Partner':<10} {'Firm':<8} "
        f"{'Industry':<22} {'Case Type':<18} "
        f"{'Str':<4} {'Mat':<4} {'Com':<4} {'Ovr':<4} {'Case Name'}"
    )
    print("\n" + header)
    print("-" * len(header))
    for i, s in enumerate(sessions, 1):
        print(
            f"{i:<4} {s['date']:<12} {s['partner']:<10} {s['firm_target']:<8} "
            f"{s['industry']:<22} {s['case_type']:<18} "
            f"{s['score_structure']:<4} {s['score_math']:<4} "
            f"{s['score_communication']:<4} {s['score_overall']:<4} "
            f"{s['case_name']}"
        )


def avg(values):
    return sum(values) / len(values) if values else 0.0


def summary_report():
    sessions = load_sessions()
    if not sessions:
        print("\nNo sessions logged yet.")
        return

    n = len(sessions)

    def scores(key):
        return [int(s[key]) for s in sessions]

    s_str = scores("score_structure")
    s_mat = scores("score_math")
    s_com = scores("score_communication")
    s_ovr = scores("score_overall")

    print(f"\n{'=' * 52}")
    print(f"  SUMMARY REPORT  —  {n} session{'s' if n != 1 else ''}")
    print(f"  {sessions[0]['date']}  →  {sessions[-1]['date']}")
    print(f"{'=' * 52}")

    print("\n  AVERAGE SCORES")
    print(f"  Structure    : {avg(s_str):.2f}")
    print(f"  Math         : {avg(s_mat):.2f}")
    print(f"  Communication: {avg(s_com):.2f}")
    print(f"  Overall      : {avg(s_ovr):.2f}")

    print("\n  OVERALL BY CASE TYPE  (worst → best)")
    by_type = {}
    for s in sessions:
        by_type.setdefault(s["case_type"], []).append(int(s["score_overall"]))
    for ct, vals in sorted(by_type.items(), key=lambda x: avg(x[1])):
        bar = "█" * round(avg(vals))
        print(f"  {ct:<22} {avg(vals):.2f}  {bar}  (n={len(vals)})")

    print("\n  OVERALL BY INDUSTRY  (worst → best)")
    by_ind = {}
    for s in sessions:
        by_ind.setdefault(s["industry"], []).append(int(s["score_overall"]))
    for ind, vals in sorted(by_ind.items(), key=lambda x: avg(x[1])):
        bar = "█" * round(avg(vals))
        print(f"  {ind:<25} {avg(vals):.2f}  {bar}  (n={len(vals)})")

    print("\n  SESSIONS PER PARTNER")
    by_partner = {}
    for s in sessions:
        by_partner[s["partner"]] = by_partner.get(s["partner"], 0) + 1
    for p, count in sorted(by_partner.items(), key=lambda x: -x[1]):
        print(f"  {p:<12} {count} session{'s' if count != 1 else ''}")

    if n >= 5:
        last5_avg = avg([int(s["score_overall"]) for s in sessions[-5:]])
        all_avg = avg(s_ovr)
        arrow = "↑ improving" if last5_avg > all_avg else ("↓ needs work" if last5_avg < all_avg else "→ steady")
        print(f"\n  TREND  (last 5 vs all-time overall)")
        print(f"  All-time avg : {all_avg:.2f}")
        print(f"  Last 5 avg   : {last5_avg:.2f}  {arrow}")


def main():
    print("\n=== MBB Case Prep Tracker ===")
    while True:
        print("\n  1. Log a session")
        print("  2. View all sessions")
        print("  3. Summary report")
        print("  4. Exit")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            log_session()
        elif choice == "2":
            view_sessions()
        elif choice == "3":
            summary_report()
        elif choice == "4":
            print("Goodbye.")
            break
        else:
            print("  Invalid choice.")


if __name__ == "__main__":
    main()
