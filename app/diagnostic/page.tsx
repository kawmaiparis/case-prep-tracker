import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { DiagnosticCharts } from "./DiagnosticCharts";
import type {
  DimensionPoint, TrendPoint, DimTrendPoint,
  WeekCountPoint, CalendarDay, IndustryPoint, CaseTypePoint,
} from "./DiagnosticCharts";

const OWNER_ID = "3b47bcbd-5cd7-4b0f-af46-78e1d54e3311";

type SessionRow = {
  date: string;
  industry: string | null;
  score_structure: number;
  score_math: number;
  score_creativity: number;
  score_communication: number;
  score_data_analysis: number;
  case_types: { name: string } | null;
};

const DIMS = [
  { key: "score_structure"     as const, label: "Structure" },
  { key: "score_math"          as const, label: "Math" },
  { key: "score_creativity"    as const, label: "Creativity" },
  { key: "score_communication" as const, label: "Communication" },
  { key: "score_data_analysis" as const, label: "Data Analysis" },
];

const CASE_TYPE_LABELS: Record<string, string> = {
  profitability: "Profitability", market_entry: "Market Entry",
  "m&a": "M&A", market_sizing: "Market Sizing", other: "Other",
};
const CASE_TYPE_SHORT: Record<string, string> = {
  profitability: "Profit.", market_entry: "Mkt Entry",
  "m&a": "M&A", market_sizing: "Sizing", other: "Other",
};
const INDUSTRY_SHORT: Record<string, string> = {
  "consumer goods": "Consm.", "private equity": "PE",
  automotive: "Auto", healthcare: "Health",
};

function mean(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
function fmt(n: number) { return parseFloat(n.toFixed(2)); }
function sessionAvg(s: SessionRow) {
  return mean([s.score_structure, s.score_math, s.score_creativity,
               s.score_communication, s.score_data_analysis]);
}
function getMondayKey(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function dayOfWeekISO(dateStr: string): number {
  return (new Date(dateStr + "T12:00:00Z").getUTCDay() + 6) % 7;
}

export default async function DiagnosticPage() {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("sessions")
    .select(`date, industry, score_structure, score_math, score_creativity,
             score_communication, score_data_analysis, case_types(name)`)
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

  // ── Weekly grouping (single pass) ────────────────────────────────────────
  const weekMap = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const key = getMondayKey(s.date);
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(s);
  }
  const sortedWeeks = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const trendData: TrendPoint[] = sortedWeeks.map(([, ss], i) => ({
    week: `Wk ${i + 1}`,
    avg: fmt(mean(ss.map(sessionAvg))),
  }));

  const dimTrendData: DimTrendPoint[] = sortedWeeks.map(([, ss], i) => ({
    week:          `Wk ${i + 1}`,
    structure:     fmt(mean(ss.map(s => s.score_structure))),
    math:          fmt(mean(ss.map(s => s.score_math))),
    creativity:    fmt(mean(ss.map(s => s.score_creativity))),
    communication: fmt(mean(ss.map(s => s.score_communication))),
    data_analysis: fmt(mean(ss.map(s => s.score_data_analysis))),
  }));

  const weekCountData: WeekCountPoint[] = sortedWeeks.map(([, ss], i) => ({
    week: `Wk ${i + 1}`,
    count: ss.length,
  }));

  // ── Dimension averages (ascending = weakest first) ────────────────────────
  const dimensionData: DimensionPoint[] = DIMS.map(d => ({
    name: d.label,
    avg: fmt(mean(sessions.map(s => s[d.key] as number))),
  })).sort((a, b) => a.avg - b.avg);

  // ── By case type ─────────────────────────────────────────────────────────
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

  // ── Calendar heatmap ─────────────────────────────────────────────────────
  const dateSessionMap = new Map<string, { count: number; scoreSum: number }>();
  for (const s of sessions) {
    const prev = dateSessionMap.get(s.date) ?? { count: 0, scoreSum: 0 };
    dateSessionMap.set(s.date, { count: prev.count + 1, scoreSum: prev.scoreSum + sessionAvg(s) });
  }
  const firstDateStr = sessions[0].date;
  const lastDateStr  = sessions[sessions.length - 1].date;
  const calStart = addDays(firstDateStr, -dayOfWeekISO(firstDateStr));
  const calEnd   = addDays(lastDateStr,  6 - dayOfWeekISO(lastDateStr));

  const calendarData: CalendarDay[] = [];
  let curr = calStart;
  while (curr <= calEnd) {
    const startMs  = new Date(calStart + "T12:00:00Z").getTime();
    const currMs   = new Date(curr + "T12:00:00Z").getTime();
    const dayDiff  = Math.round((currMs - startMs) / 86400000);
    const info     = dateSessionMap.get(curr);
    calendarData.push({
      date: curr,
      dayOfWeek: dayDiff % 7,
      weekIndex: Math.floor(dayDiff / 7),
      count: info?.count ?? 0,
      avg:   info ? info.scoreSum / info.count : 0,
    });
    curr = addDays(curr, 1);
  }

  // ── By industry ──────────────────────────────────────────────────────────
  const industryMap = new Map<string, number[]>();
  for (const s of sessions) {
    if (!s.industry?.trim()) continue;
    const key = s.industry.trim().toLowerCase();
    if (!industryMap.has(key)) industryMap.set(key, []);
    industryMap.get(key)!.push(sessionAvg(s));
  }
  const industryData: IndustryPoint[] = Array.from(industryMap.entries())
    .map(([ind, avgs]) => ({
      industry:      ind.charAt(0).toUpperCase() + ind.slice(1),
      shortIndustry: INDUSTRY_SHORT[ind] ?? (ind.charAt(0).toUpperCase() + ind.slice(1)),
      avg:   fmt(mean(avgs)),
      count: avgs.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ── Summary stats ────────────────────────────────────────────────────────
  const overallAvg     = fmt(mean(sessions.map(sessionAvg)));
  const half           = Math.ceil(trendData.length / 2);
  const firstHalfAvg  = mean(trendData.slice(0, half).map(w => w.avg));
  const secondHalfAvg = mean(trendData.slice(half).map(w => w.avg));
  const trend =
    secondHalfAvg > firstHalfAvg + 0.1 ? "up"
    : secondHalfAvg < firstHalfAvg - 0.1 ? "down"
    : "flat";

  // ── Recommendations ──────────────────────────────────────────────────────
  const weakest        = dimensionData[0];
  const secondWeakest  = dimensionData[1];
  const weakestType    = caseTypeData[caseTypeData.length - 1];

  const recommendations = [
    {
      badge: "warning" as const,
      label: "Top priority",
      title: `Elevate ${weakest.name}`,
      body:  `Averaging ${weakest.avg.toFixed(1)} — your lowest dimension. Force yourself to generate at least 4 distinct levers before evaluating any. Deliberate divergence before convergence.`,
    },
    {
      badge: "default" as const,
      label: "Secondary focus",
      title: `Sharpen ${secondWeakest.name}`,
      body:  `At ${secondWeakest.avg.toFixed(1)}, this is the next gap to close. Review session notes for the recurring weak spot and target one specific drill per week.`,
    },
    {
      badge: "default" as const,
      label: "Case type",
      title: `More ${weakestType.type} reps`,
      body:  `${weakestType.type} cases average ${weakestType.avg.toFixed(1)} across ${weakestType.count} session${weakestType.count !== 1 ? "s" : ""} — your lowest case type. Schedule 2 dedicated sessions before your next coach session.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <Heading as="h1">Performance Diagnostic</Heading>
        <Text muted size="xs" className="shrink-0">
          {sessions.length} sessions · {trendData.length} weeks · last {lastDateStr}
        </Text>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Overall avg" value={overallAvg.toFixed(1)} sub="out of 5" />
        <StatCard label="Sessions" value={String(sessions.length)} sub="logged" />
        <StatCard label="Weeks" value={String(trendData.length)} sub="of prep" />
        <StatCard
          label="Trend"
          value={trend === "up" ? "↑ Rising" : trend === "down" ? "↓ Slipping" : "→ Stable"}
          sub="2nd half vs 1st half"
          color={trend === "up" ? "positive" : trend === "down" ? "warning" : "default"}
        />
      </div>

      {/* Charts */}
      <DiagnosticCharts
        dimensionData={dimensionData}
        trendData={trendData}
        dimTrendData={dimTrendData}
        weekCountData={weekCountData}
        caseTypeData={caseTypeData}
        calendarData={calendarData}
        industryData={industryData}
      />

      {/* Focus areas */}
      <div className="space-y-3">
        <Heading as="h3">Focus Areas</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((r) => (
            <Card key={r.title}>
              <CardBody className="space-y-2">
                <Badge variant={r.badge}>{r.label}</Badge>
                <p className="text-sm font-semibold text-primary leading-snug">{r.title}</p>
                <Text muted size="sm" className="leading-relaxed">{r.body}</Text>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}

function StatCard({
  label, value, sub, color = "default",
}: {
  label: string; value: string; sub: string; color?: "default" | "positive" | "warning";
}) {
  const valueClass =
    color === "positive" ? "text-positive" :
    color === "warning"  ? "text-warning"  :
    "text-primary";
  return (
    <Card>
      <CardBody className="space-y-0.5">
        <Text muted size="xs">{label}</Text>
        <p className={`text-xl font-bold leading-tight ${valueClass}`}>{value}</p>
        <Text muted size="xs">{sub}</Text>
      </CardBody>
    </Card>
  );
}
