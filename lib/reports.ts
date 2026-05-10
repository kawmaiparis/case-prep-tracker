export const SCORE_DIMENSIONS = [
  "structure",
  "math",
  "creativity",
  "communication",
  "data_analysis",
] as const;

export type Dimension = (typeof SCORE_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  structure: "Structure",
  math: "Math",
  creativity: "Creativity",
  communication: "Communication",
  data_analysis: "Data Analysis",
};

type ScoreRow = {
  score_structure: number;
  score_math: number;
  score_creativity: number;
  score_communication: number;
  score_data_analysis: number;
};

const DRILLS: Record<Dimension, string[]> = {
  structure: [
    "Build a MECE issue tree for 3 different case types without notes — 60 seconds each",
    "After each branch, stress-test with 'what else could explain this?'",
    "Practice leading with the 'so what' before walking through your framework",
  ],
  math: [
    "Run 10 market-sizing calculations as mental math warmup before your next session",
    "Work through a profitability case focused only on getting numbers right quickly",
    "Practice segmentation math: break a large market into segments with different margins",
  ],
  creativity: [
    "Brainstorm 10 revenue levers before settling on your framework — no filtering",
    "For each case branch, name the counterintuitive root cause before the obvious one",
    "Study 2 BCG/Bain published cases that had non-obvious recommendations",
  ],
  communication: [
    "Record a 2-minute synthesis and watch it back — flag filler words and hedging",
    "Apply the 'so what?' test after every statement: why does the interviewer care?",
    "Practice signposting out loud: 'I want to focus on X because Y' before every branch",
  ],
  data_analysis: [
    "Read a chart in 30 seconds — state the title, units, trend, and one insight before speaking",
    "Walk through a data exhibit and generate 3 questions it raises, not just observations",
    "After spotting an insight, bridge it to a recommendation: 'This means we should...'",
  ],
};

export function avgScores(sessions: ScoreRow[]): Record<Dimension, number> {
  if (!sessions.length) {
    return Object.fromEntries(
      SCORE_DIMENSIONS.map((d) => [d, 0])
    ) as Record<Dimension, number>;
  }

  const totals = Object.fromEntries(
    SCORE_DIMENSIONS.map((d) => [d, 0])
  ) as Record<Dimension, number>;

  for (const s of sessions) {
    totals.structure += s.score_structure;
    totals.math += s.score_math;
    totals.creativity += s.score_creativity;
    totals.communication += s.score_communication;
    totals.data_analysis += s.score_data_analysis;
  }

  return Object.fromEntries(
    SCORE_DIMENSIONS.map((d) => [d, totals[d] / sessions.length])
  ) as Record<Dimension, number>;
}

export type DrillPlanItem = {
  dimension: Dimension;
  label: string;
  avgScore: number;
  drills: string[];
};

export function drillPlan(sessions: ScoreRow[], n = 10): DrillPlanItem[] {
  const recent = sessions.slice(0, n);
  if (!recent.length) return [];

  const avgs = avgScores(recent);
  const ranked = [...SCORE_DIMENSIONS].sort((a, b) => avgs[a] - avgs[b]);

  return ranked.slice(0, 2).map((dim) => ({
    dimension: dim,
    label: DIMENSION_LABELS[dim],
    avgScore: avgs[dim],
    drills: DRILLS[dim],
  }));
}

export function weakestDimension(sessions: ScoreRow[], n = 10): Dimension | null {
  if (!sessions.length) return null;
  const avgs = avgScores(sessions.slice(0, n));
  return SCORE_DIMENSIONS.reduce((a, b) => (avgs[a] <= avgs[b] ? a : b));
}
