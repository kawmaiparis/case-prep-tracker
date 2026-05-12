import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { DiagnosticCharts } from "./DiagnosticCharts";
import type {
  DimensionPoint, TrendPoint, DimTrendPoint,
  WeekCountPoint, CalendarDay, IndustryPoint, CaseTypePoint,
  ChartSubtitles,
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
  { key: "score_structure"     as const, label: "Structure",     dimKey: "structure"     },
  { key: "score_math"          as const, label: "Math",          dimKey: "math"          },
  { key: "score_creativity"    as const, label: "Creativity",    dimKey: "creativity"    },
  { key: "score_communication" as const, label: "Communication", dimKey: "communication" },
  { key: "score_data_analysis" as const, label: "Data Analysis", dimKey: "data_analysis" },
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

const DIM_HYPOTHESIS: Record<string, string> = {
  "Structure":     "Familiar frameworks applied before the case context is fully understood",
  "Math":          "Mental arithmetic slows under time pressure, compounding estimation errors",
  "Creativity":    "Structured thinking crowds out lateral options before they surface",
  "Communication": "Analysis leads rather than the implication, losing the thread for the interviewer",
  "Data Analysis": "Pattern-matching on exhibit shape before stress-testing the underlying numbers",
};
const DIM_TEST: Record<string, string> = {
  "Structure":     "Next 3 cases: build a bespoke issue tree before referencing any standard framework",
  "Math":          "10 timed mental-math drills before each session this week; target under 20 sec/calculation",
  "Creativity":    "Open 3 cases with no framework; generate 6 options before structuring any",
  "Communication": "Record one synthesis per session; cut any sentence that doesn't open with an implication",
  "Data Analysis": "Per chart: write 2 questions the data raises before stating any insight",
};

function fmtDate(iso: string) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [, m, d] = iso.split("-");
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

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
function getDimVal(w: DimTrendPoint, dim: string): number {
  const map: Record<string, number> = {
    structure: w.structure, math: w.math, creativity: w.creativity,
    communication: w.communication, data_analysis: w.data_analysis,
  };
  return map[dim] ?? 0;
}
function getDimTrend(dimKey: string, dimTrendData: DimTrendPoint[]): "improving" | "flat" | "declining" {
  if (dimTrendData.length < 2) return "flat";
  const half   = Math.ceil(dimTrendData.length / 2);
  const first  = mean(dimTrendData.slice(0, half).map(w => getDimVal(w, dimKey)));
  const second = mean(dimTrendData.slice(half).map(w => getDimVal(w, dimKey)));
  return second > first + 0.1 ? "improving" : second < first - 0.1 ? "declining" : "flat";
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

  // ── Weekly grouping (single pass) ──────────────────────────────────────────
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

  // ── Dimension averages ─────────────────────────────────────────────────────
  const dimensionData: DimensionPoint[] = DIMS.map(d => ({
    name: d.label,
    avg:  fmt(mean(sessions.map(s => s[d.key] as number))),
  })).sort((a, b) => a.avg - b.avg);

  // ── By case type ───────────────────────────────────────────────────────────
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
      avg:   fmt(mean(avgs)),
      count: avgs.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  // ── Calendar heatmap ───────────────────────────────────────────────────────
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
    const startMs = new Date(calStart + "T12:00:00Z").getTime();
    const currMs  = new Date(curr    + "T12:00:00Z").getTime();
    const dayDiff = Math.round((currMs - startMs) / 86400000);
    const info    = dateSessionMap.get(curr);
    calendarData.push({
      date: curr, dayOfWeek: dayDiff % 7, weekIndex: Math.floor(dayDiff / 7),
      count: info?.count ?? 0, avg: info ? info.scoreSum / info.count : 0,
    });
    curr = addDays(curr, 1);
  }

  // ── By industry ────────────────────────────────────────────────────────────
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

  // ── Summary stats ──────────────────────────────────────────────────────────
  const overallAvg    = fmt(mean(sessions.map(sessionAvg)));
  const half          = Math.ceil(trendData.length / 2);
  const trend =
    mean(trendData.slice(half).map(w => w.avg)) > mean(trendData.slice(0, half).map(w => w.avg)) + 0.1 ? "up"
    : mean(trendData.slice(half).map(w => w.avg)) < mean(trendData.slice(0, half).map(w => w.avg)) - 0.1 ? "down"
    : "flat";

  // ── Chart subtitles (Fix 5 — data-driven takeaways) ───────────────────────
  const weakest       = dimensionData[0];
  const secondWeakest = dimensionData[1];
  const weakestType   = caseTypeData[caseTypeData.length - 1];
  const worstInd      = industryData[industryData.length - 1];

  // Skill Profile
  const skillGap      = fmt(secondWeakest.avg - weakest.avg);
  const skillSub      = `${weakest.name} ${weakest.avg.toFixed(1)} — ${skillGap.toFixed(1)} pts below next weakest dimension`;

  // Progress Over Time
  const startAvg      = trendData[0].avg;
  const endAvg        = trendData[trendData.length - 1].avg;
  const dips          = trendData.filter((w, i) => i > 0 && w.avg < trendData[i - 1].avg - 0.05).length;
  const progressSub   = `+${(endAvg - startAvg).toFixed(1)} avg from week 1 to ${trendData.length}${dips === 0 ? "; no weekly regression" : `; ${dips} week${dips > 1 ? "s" : ""} with dip`}`;

  // Dimension Trends — fastest improving vs most stagnant
  const dimChanges = DIMS.map(d => {
    const h = Math.ceil(dimTrendData.length / 2);
    return {
      label:  d.label,
      change: mean(dimTrendData.slice(h).map(w => getDimVal(w, d.dimKey)))
              - mean(dimTrendData.slice(0, h).map(w => getDimVal(w, d.dimKey))),
    };
  }).sort((a, b) => b.change - a.change);
  const fastest    = dimChanges[0];
  const stagnant   = dimChanges[dimChanges.length - 1];
  const dimTrendsSub = `${fastest.label} +${fastest.change.toFixed(1)} since midpoint; ${stagnant.label} ${stagnant.change >= 0 ? "+" : ""}${stagnant.change.toFixed(1)}`;

  // Sessions / week
  const avgPerWeek    = sessions.length / weekCountData.length;
  const weeksHit4     = weekCountData.filter(w => w.count >= 4).length;
  const sessionsWeekSub = `${avgPerWeek.toFixed(1)} avg/week; hit 4+ sessions in ${weeksHit4} of ${weekCountData.length} weeks`;

  // By Case Type
  const caseTypeAvg   = mean(caseTypeData.map(c => c.avg));
  const caseTypeSub   = `${weakestType.type} lowest at ${weakestType.avg.toFixed(1)} — ${fmt(caseTypeAvg - weakestType.avg).toFixed(1)} below case-type avg`;

  // Calendar
  const DAY_NAMES     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayTotals     = Array.from({ length: 7 }, (_, i) => ({
    day:   DAY_NAMES[i],
    total: calendarData.filter(d => d.dayOfWeek === i).reduce((s, d) => s + d.count, 0),
  })).sort((a, b) => b.total - a.total);
  const weekendTotal  = calendarData.filter(d => d.dayOfWeek >= 5).reduce((s, d) => s + d.count, 0);
  const top2Days      = dayTotals.slice(0, 2).map(d => d.day).join("–");
  const calSub        = weekendTotal / sessions.length < 0.1
    ? `Practice clusters ${top2Days}; weekends rarely used`
    : `Spread through the week; strongest on ${top2Days}`;

  // By Industry
  const industrySub   = industryData.length === 0
    ? "No industry data"
    : `${worstInd.industry} lowest at ${worstInd.avg.toFixed(1)} across ${worstInd.count} session${worstInd.count !== 1 ? "s" : ""}`;

  const subtitles: ChartSubtitles = {
    skillProfile: skillSub,
    progressTime: progressSub,
    dimTrends:    dimTrendsSub,
    sessionsWeek: sessionsWeekSub,
    caseType:     caseTypeSub,
    calendar:     calSub,
    industry:     industrySub,
  };

  // ── Recommendations (Fix 3 — analytical copy) ─────────────────────────────
  const wTrend    = getDimTrend(DIMS.find(d => d.label === weakest.name)!.dimKey, dimTrendData);
  const sw        = DIMS.find(d => d.label === secondWeakest.name)!;
  const swTrend   = getDimTrend(sw.dimKey, dimTrendData);
  const caseGap   = fmt(overallAvg - weakestType.avg);

  const recommendations = [
    {
      primary: true,
      badge:   "warning" as const,
      label:   "Top priority",
      title:   `Elevate ${weakest.name}`,
      body:    `${weakest.name} ${weakest.avg.toFixed(1)} — ${skillGap.toFixed(1)} pts below next weakest; trend ${wTrend} over ${dimTrendData.length} weeks. Hypothesis: ${DIM_HYPOTHESIS[weakest.name]}. Test: ${DIM_TEST[weakest.name]}.`,
    },
    {
      primary: false,
      badge:   "default" as const,
      label:   "Secondary focus",
      title:   `Sharpen ${secondWeakest.name}`,
      body:    `${secondWeakest.name} ${secondWeakest.avg.toFixed(1)} — ${fmt(overallAvg - secondWeakest.avg).toFixed(1)} below overall avg; ${swTrend} over the period. Hypothesis: ${DIM_HYPOTHESIS[secondWeakest.name]}. Test: ${DIM_TEST[secondWeakest.name]}.`,
    },
    {
      primary: false,
      badge:   "default" as const,
      label:   "Case type",
      title:   `More ${weakestType.type} reps`,
      body:    `${weakestType.type} avg ${weakestType.avg.toFixed(1)} across ${weakestType.count} session${weakestType.count !== 1 ? "s" : ""} — ${caseGap.toFixed(1)} below overall. Hypothesis: lower rep count reduces pattern recognition for this case type. Test: 2 dedicated ${weakestType.type} sessions this week; replay the highest-scoring session structure exactly.`,
    },
  ];

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <Heading as="h1">Performance Diagnostic</Heading>
        <Text muted size="xs" className="sm:shrink-0">
          {sessions.length} sessions · {trendData.length} weeks · last {fmtDate(lastDateStr)}
        </Text>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Overall avg" value={overallAvg.toFixed(1)} sub="out of 5" />
        <StatCard label="Sessions"    value={String(sessions.length)} sub="logged" />
        <StatCard label="Weeks"       value={String(trendData.length)} sub="of prep" />
        <StatCard
          label="Trend"
          value={trend === "up" ? "↑ Rising" : trend === "down" ? "↓ Slipping" : "→ Stable"}
          sub="2H vs 1H"
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
        subtitles={subtitles}
      />

      {/* Focus areas — Fix 3 */}
      <div className="space-y-3">
        <Heading as="h3">Focus Areas</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((r) => (
            <Card
              key={r.title}
              style={r.primary ? {
                borderLeftWidth: "3px",
                borderLeftColor: "var(--warning)",
                backgroundColor: "var(--warning-bg)",
              } : undefined}
            >
              <CardBody className="space-y-2">
                <Badge variant={r.badge}>{r.label}</Badge>
                <p className={`text-sm leading-snug text-primary ${r.primary ? "font-bold" : "font-semibold"}`}>
                  {r.title}
                </p>
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
        <p className={`text-lg sm:text-xl font-bold leading-tight ${valueClass}`}>{value}</p>
        <Text muted size="xs">{sub}</Text>
      </CardBody>
    </Card>
  );
}
