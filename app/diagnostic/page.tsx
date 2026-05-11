import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { DiagnosticCharts } from "./DiagnosticCharts";
import type { DimensionPoint, TrendPoint, CaseTypePoint } from "./DiagnosticCharts";

const OWNER_ID = "3b47bcbd-5cd7-4b0f-af46-78e1d54e3311";

type SessionRow = {
  date: string;
  score_structure: number;
  score_math: number;
  score_creativity: number;
  score_communication: number;
  score_data_analysis: number;
  case_types: { name: string } | null;
};

const DIMS: { key: keyof Omit<SessionRow, "date" | "case_types">; label: string }[] = [
  { key: "score_structure",     label: "Structure" },
  { key: "score_math",          label: "Math" },
  { key: "score_creativity",    label: "Creativity" },
  { key: "score_communication", label: "Communication" },
  { key: "score_data_analysis", label: "Data Analysis" },
];

const CASE_TYPE_LABELS: Record<string, string> = {
  profitability: "Profitability",
  market_entry:  "Market Entry",
  "m&a":         "M&A",
  market_sizing: "Market Sizing",
  other:         "Other",
};

const CASE_TYPE_SHORT: Record<string, string> = {
  profitability: "Profit.",
  market_entry:  "Mkt Entry",
  "m&a":         "M&A",
  market_sizing: "Sizing",
  other:         "Other",
};

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sessionAvg(s: SessionRow) {
  return mean([
    s.score_structure, s.score_math, s.score_creativity,
    s.score_communication, s.score_data_analysis,
  ]);
}

function fmt(n: number, dp = 2) {
  return parseFloat(n.toFixed(dp));
}

export default async function DiagnosticPage() {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("sessions")
    .select(`date, score_structure, score_math, score_creativity, score_communication, score_data_analysis, case_types(name)`)
    .eq("user_id", OWNER_ID)
    .order("date", { ascending: true });

  const sessions: SessionRow[] = data ?? [];

  if (error || sessions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Heading as="h1">Performance Diagnostic</Heading>
        <Text muted className="mt-2">No session data found.</Text>
      </div>
    );
  }

  // ── Dimension averages (ascending = weakest first, shows at bottom of chart) ──
  const dimensionData: DimensionPoint[] = DIMS.map((d) => ({
    name: d.label,
    avg: fmt(mean(sessions.map((s) => s[d.key] as number))),
  })).sort((a, b) => a.avg - b.avg);

  // ── Weekly trend ──
  const weekMap = new Map<string, number[]>();
  for (const s of sessions) {
    const d = new Date(s.date + "T00:00:00");
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(sessionAvg(s));
  }
  const trendData: TrendPoint[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, avgs], i) => ({ week: `Wk ${i + 1}`, avg: fmt(mean(avgs)) }));

  // ── By case type ──
  const typeMap = new Map<string, number[]>();
  for (const s of sessions) {
    const type = (s.case_types as { name: string } | null)?.name ?? "other";
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(sessionAvg(s));
  }
  const caseTypeData: CaseTypePoint[] = Array.from(typeMap.entries())
    .map(([type, avgs]) => ({
      type:      CASE_TYPE_LABELS[type] ?? type,
      shortType: CASE_TYPE_SHORT[type] ?? type,
      avg:       fmt(mean(avgs)),
      count:     avgs.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ── Summary stats ──
  const overallAvg = fmt(mean(sessions.map(sessionAvg)));
  const firstHalfAvg = mean(trendData.slice(0, Math.ceil(trendData.length / 2)).map((w) => w.avg));
  const secondHalfAvg = mean(trendData.slice(Math.ceil(trendData.length / 2)).map((w) => w.avg));
  const trend =
    secondHalfAvg > firstHalfAvg + 0.1 ? "up"
    : secondHalfAvg < firstHalfAvg - 0.1 ? "down"
    : "flat";
  const lastDate = sessions[sessions.length - 1].date;

  // ── Recommendations ──
  const weakest      = dimensionData[0];
  const secondWeakest = dimensionData[1];
  const weakestType  = caseTypeData[caseTypeData.length - 1];

  const recommendations = [
    {
      badge:   "warning" as const,
      label:   "Top priority",
      title:   `Elevate ${weakest.name}`,
      body:    `Averaging ${weakest.avg.toFixed(1)} — your lowest dimension. Force yourself to generate at least 4 distinct levers before evaluating any. Deliberate divergence before convergence.`,
    },
    {
      badge:   "default" as const,
      label:   "Secondary focus",
      title:   `Sharpen ${secondWeakest.name}`,
      body:    `At ${secondWeakest.avg.toFixed(1)}, this is the next gap to close. Review session notes for the recurring weak spot and target one specific drill per week.`,
    },
    {
      badge:   "default" as const,
      label:   "Case type",
      title:   `More ${weakestType.type} reps`,
      body:    `${weakestType.type} cases average ${weakestType.avg.toFixed(1)} across ${weakestType.count} session${weakestType.count !== 1 ? "s" : ""} — your lowest case type. Schedule 2 dedicated sessions before your next coach session.`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div>
        <Heading as="h1">Performance Diagnostic</Heading>
        <Text muted size="sm" className="mt-1">
          {sessions.length} sessions · {trendData.length} weeks · Last session {lastDate}
        </Text>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Overall avg" value={overallAvg.toFixed(1)} sub="out of 5" />
        <StatCard label="Sessions" value={String(sessions.length)} sub="logged" />
        <StatCard label="Weeks" value={String(trendData.length)} sub="of prep" />
        <StatCard
          label="Trend"
          value={trend === "up" ? "↑ Rising" : trend === "down" ? "↓ Slipping" : "→ Stable"}
          sub="2nd half vs 1st half"
          accent={trend === "up"}
        />
      </div>

      {/* Charts */}
      <DiagnosticCharts
        dimensionData={dimensionData}
        trendData={trendData}
        caseTypeData={caseTypeData}
      />

      {/* Recommendations */}
      <div className="space-y-3">
        <Heading as="h3">Focus Areas</Heading>
        {recommendations.map((r) => (
          <Card key={r.title}>
            <CardBody className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={r.badge}>{r.label}</Badge>
                <span className="text-sm font-semibold text-primary">{r.title}</span>
              </div>
              <Text muted size="sm">{r.body}</Text>
            </CardBody>
          </Card>
        ))}
      </div>

    </div>
  );
}

function StatCard({
  label, value, sub, accent = false,
}: {
  label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-0.5">
        <Text muted size="xs">{label}</Text>
        <p className={`text-xl font-bold leading-tight ${accent ? "text-accent" : "text-primary"}`}>
          {value}
        </p>
        <Text muted size="xs">{sub}</Text>
      </CardBody>
    </Card>
  );
}
