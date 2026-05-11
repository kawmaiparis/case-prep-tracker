"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";

export type DimensionPoint = { name: string; avg: number };
export type TrendPoint     = { week: string; avg: number };
export type CaseTypePoint  = { type: string; shortType: string; avg: number; count: number };

type Props = {
  dimensionData: DimensionPoint[];
  trendData:     TrendPoint[];
  caseTypeData:  CaseTypePoint[];
};

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = !mounted || resolvedTheme !== "light";

  return {
    accent:    dark ? "#06B6D4" : "#0891B2",
    weak:      dark ? "#C084FC" : "#9333EA",
    highlight: dark ? "#A78BFA" : "#7C3AED",
    grid:      dark ? "#27272F" : "#E4E4E7",
    muted:     "#71717A",
    surface:   dark ? "#14141B" : "#FFFFFF",
    primary:   dark ? "#FAFAFA" : "#18181B",
  };
}

export function DiagnosticCharts({ dimensionData, trendData, caseTypeData }: Props) {
  const C = useChartColors();

  const tooltipStyle = {
    backgroundColor: C.surface,
    border: `1px solid ${C.grid}`,
    borderRadius: 6,
    color: C.primary,
    fontSize: 12,
  };

  const weakestIdx  = 0;
  const worstTypeIdx = caseTypeData.length - 1;

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* ── Skill Profile — col 1-5 on lg ── */}
      <div className="col-span-12 lg:col-span-5">
        <Card className="h-full">
          <CardBody className="flex flex-col gap-1">
            <Heading as="h3">Skill Profile</Heading>
            <p className="text-xs text-muted mb-2">Average score per dimension · 1–5 scale</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={dimensionData}
                layout="vertical"
                margin={{ left: 4, right: 28, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={88}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: C.grid }}
                  formatter={(v: any) => [Number(v).toFixed(2), "Avg"]}
                />
                <Bar dataKey="avg" radius={[0, 3, 3, 0]} maxBarSize={18} label={{ position: "right", fill: C.muted, fontSize: 11, formatter: (v: any) => Number(v).toFixed(1) } as any}>
                  {dimensionData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={i === weakestIdx ? C.weak : C.accent}
                      fillOpacity={i === weakestIdx ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* ── Progress Over Time — col 6-12 on lg ── */}
      <div className="col-span-12 lg:col-span-7">
        <Card className="h-full">
          <CardBody className="flex flex-col gap-1">
            <Heading as="h3">Progress Over Time</Heading>
            <p className="text-xs text-muted mb-2">Weekly average · violet dot = most recent session</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={trendData}
                margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[2.5, 4.5]}
                  ticks={[2.5, 3.0, 3.5, 4.0, 4.5]}
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: any) => [Number(v).toFixed(2), "Avg score"]}
                />
                <ReferenceLine y={3.5} stroke={C.grid} strokeDasharray="4 4" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke={C.accent}
                  strokeWidth={2}
                  dot={(props: any) => {
                    const isLast = props.index === trendData.length - 1;
                    return (
                      <circle
                        key={props.index}
                        cx={props.cx}
                        cy={props.cy}
                        r={isLast ? 5 : 3}
                        fill={isLast ? C.highlight : C.accent}
                      />
                    );
                  }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* ── Performance by Case Type — full width (V3-C will split this row) ── */}
      <div className="col-span-12">
        <Card>
          <CardBody className="flex flex-col gap-1">
            <Heading as="h3">Performance by Case Type</Heading>
            <p className="text-xs text-muted mb-2">Average score · session count in tooltip · worst case type in purple</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={caseTypeData}
                margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis
                  dataKey="shortType"
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[2.5, 4.5]}
                  ticks={[2.5, 3.0, 3.5, 4.0, 4.5]}
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={((v: any, _: any, item: any) => [
                    `${Number(v).toFixed(2)}  (n=${item.payload?.count ?? "?"})`,
                    "Avg score",
                  ]) as any}
                  labelFormatter={(label: any) =>
                    caseTypeData.find((d) => d.shortType === label)?.type ?? label
                  }
                />
                <Bar dataKey="avg" radius={[3, 3, 0, 0]} maxBarSize={64}>
                  {caseTypeData.map((entry, i) => (
                    <Cell
                      key={entry.type}
                      fill={i === worstTypeIdx ? C.weak : C.accent}
                      fillOpacity={i === worstTypeIdx ? 1 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

    </div>
  );
}
