"use client";

import { useState, useMemo } from "react";
import type { SessionWithDetails } from "@/lib/queries/sessions";
import { DIMENSION_LABELS, SCORE_DIMENSIONS } from "@/lib/reports";
import { ScoreBar } from "@/components/ui/ScoreSlider";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";

const CASE_TYPE_LABELS: Record<string, string> = {
  profitability: "Profitability",
  market_entry:  "Market Entry",
  "m&a":         "M&A",
  market_sizing: "Market Sizing",
  other:         "Other",
};

function scoreAvg(s: SessionWithDetails) {
  return (
    s.score_structure + s.score_math + s.score_creativity +
    s.score_communication + s.score_data_analysis
  ) / 5;
}

function avgColor(avg: number) {
  if (avg >= 4) return "text-emerald-400";
  if (avg >= 3) return "text-amber-400";
  return "text-rose-400";
}

const selectCls =
  "bg-surface border border-divider text-primary text-sm rounded-md px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent " +
  "transition-colors cursor-pointer";

type Props = {
  sessions: SessionWithDetails[];
  partners: { id: string; name: string }[];
  caseTypes: { id: number; name: string }[];
};

export function SessionTable({ sessions, partners, caseTypes }: Props) {
  const [partnerFilter, setPartnerFilter]     = useState("");
  const [caseTypeFilter, setCaseTypeFilter]   = useState("");
  const [expanded, setExpanded]               = useState<string | null>(null);

  const filtered = useMemo(() =>
    sessions.filter((s) => {
      if (partnerFilter   && s.partner_id !== partnerFilter)              return false;
      if (caseTypeFilter  && String(s.case_type_id) !== caseTypeFilter)   return false;
      return true;
    }),
    [sessions, partnerFilter, caseTypeFilter]
  );

  const hasFilters = Boolean(partnerFilter || caseTypeFilter);

  return (
    <div className="space-y-4">

      {/* Heading + count */}
      <div className="flex items-baseline justify-between">
        <Heading as="h1">Sessions</Heading>
        <Text muted size="xs">
          {filtered.length}
          {hasFilters ? ` of ${sessions.length}` : ""}{" "}
          session{filtered.length !== 1 ? "s" : ""}
        </Text>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className={selectCls}
        >
          <option value="">All partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={caseTypeFilter}
          onChange={(e) => setCaseTypeFilter(e.target.value)}
          className={selectCls}
        >
          <option value="">All case types</option>
          {caseTypes.map((ct) => (
            <option key={ct.id} value={String(ct.id)}>{ct.name}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setPartnerFilter(""); setCaseTypeFilter(""); }}
            className="text-sm text-muted hover:text-primary transition-colors px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Text muted>No sessions match the current filters.</Text>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const avg          = scoreAvg(s);
            const isOpen       = expanded === s.id;
            const caseTypeName = s.case_types?.name ?? "";
            const partnerName  = s.partners?.name ?? "—";

            return (
              <Card key={s.id} className="overflow-hidden">

                {/* Collapsed row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {caseTypeName && (
                          <Badge variant="default">
                            {CASE_TYPE_LABELS[caseTypeName] ?? caseTypeName}
                          </Badge>
                        )}
                        {s.case_name && (
                          <span className="text-sm text-primary truncate">{s.case_name}</span>
                        )}
                      </div>
                      <Text muted size="xs">{partnerName} · {s.date}</Text>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold tabular-nums ${avgColor(avg)}`}>
                        {avg.toFixed(1)}
                      </span>
                      <span className="text-muted text-xs select-none">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 pt-3 pb-4 border-t border-divider space-y-4">

                    {/* Score bars */}
                    <div className="space-y-2">
                      {SCORE_DIMENSIONS.map((dim) => (
                        <div key={dim} className="flex items-center gap-3">
                          <Text muted size="xs" className="w-24 shrink-0">
                            {DIMENSION_LABELS[dim]}
                          </Text>
                          <div className="flex-1">
                            <ScoreBar
                              value={s[`score_${dim}` as keyof SessionWithDetails] as number}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Industry / book tags */}
                    {(s.industry || s.case_book) && (
                      <div className="flex gap-2 flex-wrap">
                        {s.industry  && <Badge variant="default">{s.industry}</Badge>}
                        {s.case_book && <Badge variant="default">{s.case_book}</Badge>}
                      </div>
                    )}

                    {/* Notes */}
                    {s.notes && (
                      <div className="bg-surface-hover rounded-md p-3">
                        <Text muted size="xs" className="whitespace-pre-wrap leading-relaxed">
                          {s.notes}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
