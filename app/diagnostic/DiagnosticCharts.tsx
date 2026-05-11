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

type Props = {
  dimensionData: DimensionPoint[];
  trendData:     TrendPoint[];
  dimTrendData:  DimTrendPoint[];
  weekCountData: WeekCountPoint[];
  caseTypeData:  CaseTypePoint[];
  calendarData:  CalendarDay[];
  industryData:  IndustryPoint[];
};

// ── Constants ─────────────────────────────────────────────────────────────────
const DIM_KEYS = ["structure", "math", "creativity", "communication", "data_analysis"] as const;
const DIM_SHORT: Record<string, string> = {
  structure: "Structure", math: "Math", creativity: "Creativity",
  communication: "Comm.", data_analysis: "Data A.",
};
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// 5-series palette — cyan, mint, purple, violet, amber
const SERIES_DARK  = ["#06B6D4", "#10F4B1", "#C084FC", "#A78BFA", "#FBBF24"];
const SERIES_LIGHT = ["#0891B2", "#059669", "#9333EA", "#7C3AED", "#D97706"];

// ── Theme-aware colors ────────────────────────────────────────────────────────
type C = ReturnType<typeof useChartColors>;

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";
  return {
    accent:          dark ? "#06B6D4" : "#0891B2",
    weak:            dark ? "#C084FC" : "#9333EA",
    highlight:       dark ? "#A78BFA" : "#7C3AED",
    positive:        dark ? "#10F4B1" : "#059669",
    grid:            dark ? "#27272F" : "#E4E4E7",
    muted:           "#71717A",
    surface:         dark ? "#14141B" : "#FFFFFF",
    surfaceElevated: dark ? "#1F1F2A" : "#F4F4F5",
    primary:         dark ? "#FAFAFA" : "#18181B",
    series:          dark ? SERIES_DARK : SERIES_LIGHT,
  };
}

function tooltipBase(C: ReturnType<typeof useChartColors>) {
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

// ── Calendar heatmap (custom CSS grid, no Recharts) ───────────────────────────
function CalendarHeatmap({ data, C }: { data: CalendarDay[]; C: ReturnType<typeof useChartColors> }) {
  if (!data.length) return null;
  const numWeeks = Math.max(...data.map(d => d.weekIndex)) + 1;

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {/* Week labels */}
      <div style={{ display: "grid", gridTemplateColumns: `16px repeat(${numWeeks}, 1fr)`, gap: 3 }}>
        <span />
        {Array.from({ length: numWeeks }, (_, i) => (
          <span
            key={i}
            style={{ fontSize: 10, color: C.muted, textAlign: "center", lineHeight: 1 }}
          >
            {i % 2 === 0 ? `W${i + 1}` : ""}
          </span>
        ))}
      </div>

      {/* Day labels + cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `16px repeat(${numWeeks}, 1fr)`,
          gridTemplateRows: "repeat(7, 12px)",
          gap: 3,
        }}
      >
        {/* Day labels */}
        {DAY_LABELS.map((label, i) => (
          <span
            key={i}
            style={{
              gridColumn: 1,
              gridRow: i + 1,
              fontSize: 9,
              color: C.muted,
              lineHeight: "12px",
              textAlign: "right",
              paddingRight: 2,
            }}
          >
            {[0, 2, 4].includes(i) ? label : ""}
          </span>
        ))}

        {/* Session cells */}
        {data.map((day) => {
          const bg = day.count === 0
            ? C.surfaceElevated
            : day.avg >= 4 ? C.accent
            : day.avg >= 3 ? C.highlight
            : C.weak;
          const opacity = day.count === 0 ? 1 : 0.4 + (day.avg / 5) * 0.6;
          return (
            <div
              key={day.date}
              title={
                day.count > 0
                  ? `${day.date} · ${day.count} session${day.count > 1 ? "s" : ""} · avg ${day.avg.toFixed(1)}`
                  : day.date
              }
              style={{
                gridColumn: day.weekIndex + 2,
                gridRow: day.dayOfWeek + 1,
                backgroundColor: bg,
                opacity,
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1">
        {[
          { color: C.weak,      label: "< 3.0" },
          { color: C.highlight, label: "3.0–3.9" },
          { color: C.accent,    label: "≥ 4.0" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: color }} />
            <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DiagnosticCharts({
  dimensionData, trendData, dimTrendData, weekCountData,
  caseTypeData, calendarData, industryData,
}: Props) {
  const C = useChartColors();
  const tt = tooltipBase(C);

  const weakestIdx   = 0;
  const worstTypeIdx = caseTypeData.length - 1;
  const worstIndIdx  = industryData.length - 1;
  const avgSessions  = weekCountData.length
    ? weekCountData.reduce((s, w) => s + w.count, 0) / weekCountData.length
    : 0;

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* ── Row A: Skill Profile (5) + Progress Over Time (7) ── */}

      <div className="col-span-12 lg:col-span-5">
        <ChartCard title="Skill Profile" sub="Average score per dimension · 1–5 scale">
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

      <div className="col-span-12 lg:col-span-7">
        <ChartCard title="Progress Over Time" sub="Weekly average · violet dot = most recent week">
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

      <div className="col-span-12 lg:col-span-7">
        <ChartCard title="Dimension Trends" sub="Per-dimension weekly average · all 5 dimensions">
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

      <div className="col-span-12 lg:col-span-5">
        <ChartCard title="Sessions / Week" sub={`Volume by week · avg ${avgSessions.toFixed(1)} per week`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekCountData} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28}
                tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={(v: any) => [v, "Sessions"]} />
              <ReferenceLine y={avgSessions} stroke={C.accent} strokeDasharray="4 4"
                strokeWidth={1} strokeOpacity={0.6} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40}>
                {weekCountData.map((_, i) => (
                  <Cell key={i}
                    fill={i === weekCountData.length - 1 ? C.highlight : C.accent}
                    fillOpacity={i === weekCountData.length - 1 ? 0.9 : 0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row C: Case Type (4) + Calendar (4) + Industry (4) ── */}

      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="By Case Type" sub="Average score · worst type in purple">
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

      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="Session Calendar" sub="Each cell = one day · color = avg score">
          <CalendarHeatmap data={calendarData} C={C} />
        </ChartCard>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <ChartCard title="By Industry" sub="Average score · worst industry in purple">
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

    </div>
  );
}
