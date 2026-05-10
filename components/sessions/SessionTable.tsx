"use client";

import { useState, useMemo } from "react";
import type { SessionWithDetails } from "@/lib/queries/sessions";
import { DIMENSION_LABELS, SCORE_DIMENSIONS } from "@/lib/reports";
import { ScoreBar } from "@/components/ui/ScoreSlider";

type Props = {
  sessions: SessionWithDetails[];
  partners: { id: string; name: string }[];
  caseTypes: { id: number; name: string }[];
};

function scoreAvg(s: SessionWithDetails) {
  return (
    (s.score_structure +
      s.score_math +
      s.score_creativity +
      s.score_communication +
      s.score_data_analysis) /
    5
  );
}

export function SessionTable({ sessions, partners, caseTypes }: Props) {
  const [partnerFilter, setPartnerFilter] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (partnerFilter && s.partner_id !== partnerFilter) return false;
      if (caseTypeFilter && String(s.case_type_id) !== caseTypeFilter) return false;
      return true;
    });
  }, [sessions, partnerFilter, caseTypeFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={caseTypeFilter}
          onChange={(e) => setCaseTypeFilter(e.target.value)}
          className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All case types</option>
          {caseTypes.map((ct) => (
            <option key={ct.id} value={String(ct.id)}>
              {ct.name}
            </option>
          ))}
        </select>

        {(partnerFilter || caseTypeFilter) && (
          <button
            onClick={() => { setPartnerFilter(""); setCaseTypeFilter(""); }}
            className="shrink-0 text-sm text-blue-600 hover:underline px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        {filtered.length} session{filtered.length !== 1 ? "s" : ""}
        {(partnerFilter || caseTypeFilter) ? " (filtered)" : ""}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No sessions found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const avg = scoreAvg(s);
            const isOpen = expanded === s.id;

            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {s.case_types?.name ?? "Case"}
                        </span>
                        {s.case_name && (
                          <span className="text-xs text-gray-400 truncate">— {s.case_name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s.partners?.name ?? "No partner"} · {s.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          avg <= 2 ? "text-red-500" : avg < 4 ? "text-yellow-500" : "text-green-600"
                        }`}
                      >
                        {avg.toFixed(1)}
                      </span>
                      <span className="text-gray-300 text-xs">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50 space-y-3 pt-3">
                    <div className="space-y-2">
                      {SCORE_DIMENSIONS.map((dim) => (
                        <div key={dim} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-28 shrink-0">
                            {DIMENSION_LABELS[dim]}
                          </span>
                          <div className="flex-1">
                            <ScoreBar value={s[`score_${dim}` as keyof SessionWithDetails] as number} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {s.industry && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Industry:</span> {s.industry}
                      </p>
                    )}
                    {s.case_book && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Book:</span> {s.case_book}
                      </p>
                    )}
                    {s.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                        {s.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
