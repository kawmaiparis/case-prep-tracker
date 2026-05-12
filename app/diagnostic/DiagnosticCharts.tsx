"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, Legend,
} from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";

// ── Types ─────────────────────────────────────────────────────────────────────
export type DimensionPoint = { name: string; avg: number };
export type TrendPoint     = { week: string; avg: number };
export type DimTrendPoint  = {
  week: string;
  structure: number; math: number; creativity: number;
  communication: number; data_analysis: number;
};
export type WeekCountPoint = { week: string; count: number };
export type CalendarDay    = { date: string; dayOfWeek: number; weekIndex: number; count: number; avg: number };
export type IndustryPoint  = { industry: string; shortIndustry: string; avg: number; count: number };
export type CaseTypePoint  = { type: string; shortType: string; avg: number; count: number };

export type ChartSubtitles = {
  skillProfile: string;
  progressTime: string;
  dimTrends:    string;
  sessionsWeek: string;
  caseType:     string;
  calendar:     string;
  industry:     string;
};

type Props = {
  dimensionData: DimensionPoint[];
  trendData:     TrendPoint[];
  dimTrendData:  DimTrendPoint[];
  weekCountData: WeekCountPoint[];
  caseTypeData:  CaseTypePoint[];
  calendarData:  CalendarDay[];
  industryData:  IndustryPoint[];
  subtitles:     ChartSubtitles;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const DIM_KEYS = ["structure", "math", "creativity", "communication", "data_analysis"] as const;
const DIM_SHORT: Record<string, string> = {
  structure: "Structure", math: "Math", creativity: "Creativity",
  communication: "Comm.", data_analysis: "Data A.",
};

// 5-series palette — cyan, mint, coral, violet, amber (all unique)
const SERIES_DARK  = ["#06B6D4", "#10F4B1", "#F43F5E", "#A78BFA", "#FBBF24"];
const SERIES_LIGHT = ["#0891B2", "#059669", "#E11D48", "#7C3AED", "#D97706"];

// ── Theme-aware colors ────────────────────────────────────────────────────────
function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";
  return {
    accent:          dark ? "#06B6D4" : "#0891B2",
    weak:            dark ? "#F43F5E" : "#E11D48",   // coral — replaces purple
    highlight:       dark ? "#A78BFA" : "#7C3AED",   // violet — Progress last dot only
    positive:        dark ? "#10F4B1" : "#059669",
    grid:            dark ? "#27272F" : "#E4E4E7",
    muted:           "#71717A",
    surface:         dark ? "#14141B" : "#FFFFFF",
    surfaceElevated: dark ? "#1F1F2A" : "#F4F4F5",
    primary:         dark ? "#FAFAFA" : "#18181B",
    series:          dark ? SERIES_DARK : SERIES_LIGHT,
  };
}

type C = ReturnType<typeof useChartColors>;

function tooltipBase(C: C) {
  return {
    backgroundColor: C.surface,
    border: `1px solid ${C.grid}`,
    borderRadius: 6,
    color: C.primary,
    fontSize: 12,
  };
}

// ── Chart card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardBody className="flex flex-col gap-1 h-full">
        <Heading as="h3">{title}</Heading>
        <p className="text-xs text-muted mb-1">{sub}</p>
        {children}
      </CardBody>
    </Card>
  );
}

// ── Week-strip calendar (8 most-recent weeks, most-recent-first) ──────────────
function WeekStripCalendar({ data, C }: { data: CalendarDay[]; C: C }) {
  if (!data.length) return null;

  const weekMap = new Map<number, CalendarDay[]>();
  for (const d of data) {
    if (!weekMap.has(d.weekIndex)) weekMap.set(d.weekIndex, []);
    weekMap.get(d.weekIndex)!.push(d);
  }

  const allWeekIndices = Array.from(weekMap.keys()).sort((a, b) => a - b);
  const recentWeeks    = allWeekIndices.slice(-8).reverse();

  const DAY_COLS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col gap-1 mt-1 overflow-x-auto">
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", gap: 4 }}>
        <span />
        {DAY_COLS.map(d => (
          <span key={d} style={{ fontSize: 10, color: C.muted, textAlign: "center" }}>{d}</span>
        ))}
      </div>

      {/* Week rows */}
      {recentWeeks.map((wi) => {
        const days      = weekMap.get(wi) ?? [];
        const dayByDOW  = new Map(days.map(d => [d.dayOfWeek, d]));
        const monday    = days.find(d => d.dayOfWeek === 0);
        const weekLabel = monday ? monday.date.slice(5).replace("-", "/") : `W${wi + 1}`;

        return (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", gap: 4 }}>
            <span style={{ fontSize: 10, color: C.muted, lineHeight: "30px", whiteSpace: "nowrap" }}>
              {weekLabel}
            </span>
            {Array.from({ length: 7 }, (_, dow) => {
              const day        = dayByDOW.get(dow);
              const hasSession = !!(day && day.count > 0);
              const dotColor   = !hasSession ? "transparent"
                : day.avg >= 3 ? C.accent   // cyan for ≥ 3.0 (medium and high)
                : C.weak;                    // coral for < 3.0
              const dotSize = !hasSession ? 0
                : day.count >= 3 ? 10
                : day.count === 2 ? 8
                : 6;

              return (
                <div
                  key={dow}
                  title={
                    day && hasSession
                      ? `${day.date} · ${day.count} session${day.count > 1 ? "s" : ""} · avg ${day.avg.toFixed(1)}`
                      : day?.date ?? ""
                  }
                  style={{
                    height: 30,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    backgroundColor: hasSession ? C.surfaceElevated : "transparent",
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: 10, color: hasSession ? C.primary : C.muted, lineHeight: 1 }}>
                    {day ? day.date.slice(8) : ""}
                  </span>
                  <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: dotColor }} />
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1">
        {[
          { color: C.weak,   label: "< 3.0" },
          { color: C.accent, label: "≥ 3.0" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
            <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: C.muted }}>· dot size = session count</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DiagnosticCharts({
  dimensionData, trendData, dimTrendData, weekCountData,
  caseTypeData, calendarData, industryData, subtitles,
}: Props) {
  const C = useChartColors();
  const tt = tooltipBase(C);

  const weakestIdx   = 0;
  const worstTypeIdx = caseTypeData.length - 1;
  const worstIndIdx  = industryData.length - 1;

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* ── Row A: Skill Profile (5) + Progress Over Time (7) ── */}

      <div className="col-span-12 md:col-span-6 lg:col-span-5">
        <ChartCard title="Skill Profile" sub={subtitles.skillProfile}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dimensionData} layout="vertical" margin={{ left: 4, right: 28, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={88}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} cursor={{ fill: C.grid }}
                formatter={(v: any) => [Number(v).toFixed(2), "Avg"]} />
              <Bar dataKey="avg" radius={[0, 3, 3, 0]} maxBarSize={18}
                label={{ position: "right", fill: C.muted, fontSize: 11, formatter: (v: any) => Number(v).toFixed(1) } as any}>
                {dimensionData.map((e, i) => (
                  <Cell key={e.name} fill={i === weakestIdx ? C.weak : C.accent} fillOpacity={i === weakestIdx ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-7">
        {/* violet dot on last point is the one permitted highlight use */}
        <ChartCard title="Progress Over Time" sub={subtitles.progressTime}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[2.5, 4.5]} ticks={[2.5, 3.0, 3.5, 4.0, 4.5]} width={36}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={(v: any) => [Number(v).toFixed(2), "Avg score"]} />
              <ReferenceLine y={3.5} stroke={C.grid} strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="avg" stroke={C.accent} strokeWidth={2}
                activeDot={{ r: 5, strokeWidth: 0 }}
                dot={(props: any) => {
                  const isLast = props.index === trendData.length - 1;
                  return <circle key={props.index} cx={props.cx} cy={props.cy}
                    r={isLast ? 5 : 3} fill={isLast ? C.highlight : C.accent} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row B: Dimension Trends (7) + Sessions / Week (5) ── */}

      <div className="col-span-12 md:col-span-7 lg:col-span-7">
        <ChartCard title="Dimension Trends" sub={subtitles.dimTrends}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dimTrendData} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1.5, 5]} ticks={[2, 3, 4, 5]} width={28}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt}
                formatter={(v: any, key: any) => [Number(v).toFixed(2), DIM_SHORT[key] ?? key]} />
              <Legend
                iconType="circle" iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                formatter={(key) => <span style={{ color: C.muted }}>{DIM_SHORT[key] ?? key}</span>}
              />
              {DIM_KEYS.map((dim, i) => (
                <Line key={dim} type="monotone" dataKey={dim}
                  stroke={C.series[i]} strokeWidth={1.5}
                  dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-5">
        <ChartCard title="Sessions / Week" sub={subtitles.sessionsWeek}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekCountData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={(v: any) => [v, "Sessions"]} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40} fill={C.accent} fillOpacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row C: Case Type (6) + Industry (6) ── */}

      <div className="col-span-12 md:col-span-6">
        <ChartCard title="By Case Type" sub={subtitles.caseType}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={caseTypeData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="shortType" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[2.5, 4.5]} ticks={[3.0, 3.5, 4.0, 4.5]} width={32}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt}
                formatter={((v: any, _: any, item: any) => [
                  `${Number(v).toFixed(2)}  (n=${item.payload?.count ?? "?"})`, "Avg",
                ]) as any}
                labelFormatter={(l: any) => caseTypeData.find(d => d.shortType === l)?.type ?? l}
              />
              <Bar dataKey="avg" radius={[3, 3, 0, 0]} maxBarSize={52}>
                {caseTypeData.map((e, i) => (
                  <Cell key={e.type} fill={i === worstTypeIdx ? C.weak : C.accent}
                    fillOpacity={i === worstTypeIdx ? 1 : 0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-12 md:col-span-6">
        <ChartCard title="By Industry" sub={subtitles.industry}>
          {industryData.length === 0 ? (
            <p className="text-xs text-muted mt-2">No industry tags on sessions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={industryData} margin={{ left: 0, right: 8, top: 8, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="shortIndustry" angle={-35} textAnchor="end" interval={0}
                  tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[2.5, 4.5]} ticks={[3.0, 3.5, 4.0, 4.5]} width={32}
                  tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tt}
                  formatter={((v: any, _: any, item: any) => [
                    `${Number(v).toFixed(2)}  (n=${item.payload?.count ?? "?"})`, "Avg",
                  ]) as any}
                  labelFormatter={(l: any) => industryData.find(d => d.shortIndustry === l)?.industry ?? l}
                />
                <Bar dataKey="avg" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {industryData.map((e, i) => (
                    <Cell key={e.industry} fill={i === worstIndIdx ? C.weak : C.accent}
                      fillOpacity={i === worstIndIdx ? 1 : 0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row D: Session Calendar (full-width week strip) ── */}

      <div className="col-span-12">
        <ChartCard title="Session Calendar" sub={subtitles.calendar}>
          <WeekStripCalendar data={calendarData} C={C} />
        </ChartCard>
      </div>

    </div>
  );
}
