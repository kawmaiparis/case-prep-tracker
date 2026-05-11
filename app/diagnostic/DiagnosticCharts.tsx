"use client";

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";

const C = {
  accent:  "#3B82F6",
  weak:    "#F59E0B",
  grid:    "#26262A",
  muted:   "#8B8B93",
  surface: "#141416",
  primary: "#FAFAF9",
};

const tooltipStyle = {
  backgroundColor: C.surface,
  border: `1px solid ${C.grid}`,
  borderRadius: 6,
  color: C.primary,
  fontSize: 12,
};

export type DimensionPoint = { name: string; avg: number };
export type TrendPoint     = { week: string; avg: number };
export type CaseTypePoint  = { type: string; shortType: string; avg: number; count: number };

type Props = {
  dimensionData: DimensionPoint[];
  trendData:     TrendPoint[];
  caseTypeData:  CaseTypePoint[];
};

export function DiagnosticCharts({ dimensionData, trendData, caseTypeData }: Props) {
  const weakestIdx = 0; // data sorted ascending — index 0 is weakest

  return (
    <div className="space-y-4">

      {/* ── Skill Profile (horizontal bars, weakest at bottom) ── */}
      <Card>
        <CardBody>
          <Heading as="h3" className="mb-1">Skill Profile</Heading>
          <p className="text-xs text-muted mb-4">Average score per dimension · 1–5 scale</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={dimensionData}
              layout="vertical"
              margin={{ left: 8, right: 32, top: 0, bottom: 0 }}
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
                width={96}
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

      {/* ── Progress Over Time ── */}
      <Card>
        <CardBody>
          <Heading as="h3" className="mb-1">Progress Over Time</Heading>
          <p className="text-xs text-muted mb-4">Weekly average score across all dimensions</p>
          <ResponsiveContainer width="100%" height={190}>
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
                dot={{ fill: C.accent, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* ── Performance by Case Type ── */}
      <Card>
        <CardBody>
          <Heading as="h3" className="mb-1">Performance by Case Type</Heading>
          <p className="text-xs text-muted mb-4">Average score · session count in tooltip</p>
          <ResponsiveContainer width="100%" height={170}>
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
              <Bar dataKey="avg" fill={C.accent} fillOpacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

    </div>
  );
}
