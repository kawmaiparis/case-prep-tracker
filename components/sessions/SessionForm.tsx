"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { logSession } from "@/lib/actions/sessions";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { ScoreSlider } from "@/components/ui/ScoreSlider";
import type { PartnerRow, CaseTypeRow } from "@/lib/queries/partners";

type Props = {
  partners: PartnerRow[];
  caseTypes: CaseTypeRow[];
};

const today = new Date().toISOString().split("T")[0];

const DEFAULT_SCORES = {
  structure: 3,
  math: 3,
  creativity: 3,
  communication: 3,
  data_analysis: 3,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent hover:bg-accent-hover text-white rounded py-3 font-semibold text-sm
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving…" : "Save Session"}
    </button>
  );
}

export function SessionForm({ partners, caseTypes }: Props) {
  const [scores, setScores] = useState(DEFAULT_SCORES);

  function setScore(dim: keyof typeof DEFAULT_SCORES, val: number) {
    setScores((prev) => ({ ...prev, [dim]: val }));
  }

  return (
    <form action={logSession} className="space-y-5 p-4 max-w-lg mx-auto">
      <Input
        id="date"
        name="date"
        type="date"
        label="Date"
        defaultValue={today}
        required
      />

      <Select id="partner_id" name="partner_id" label="Partner">
        <option value="">— no partner —</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.is_paid_coach ? " (coach)" : ""}
          </option>
        ))}
      </Select>

      <Select id="case_type_id" name="case_type_id" label="Case type">
        <option value="">— select type —</option>
        {caseTypes.map((ct) => (
          <option key={ct.id} value={ct.id}>
            {ct.name}
          </option>
        ))}
      </Select>

      <Input
        id="case_name"
        name="case_name"
        type="text"
        label="Case name (optional)"
        placeholder="e.g. Pharma Co. Profitability"
      />

      <Input
        id="case_book"
        name="case_book"
        type="text"
        label="Case book (optional)"
        placeholder="e.g. Wharton 2024"
      />

      <Input
        id="industry"
        name="industry"
        type="text"
        label="Industry (optional)"
        placeholder="e.g. Healthcare"
      />

      <div className="space-y-4 bg-surface-hover rounded-md p-4">
        <p className="text-sm font-semibold text-primary">Scores</p>
        <ScoreSlider
          name="score_structure"
          label="Structure"
          value={scores.structure}
          onChange={(v) => setScore("structure", v)}
        />
        <ScoreSlider
          name="score_math"
          label="Math"
          value={scores.math}
          onChange={(v) => setScore("math", v)}
        />
        <ScoreSlider
          name="score_creativity"
          label="Creativity"
          value={scores.creativity}
          onChange={(v) => setScore("creativity", v)}
        />
        <ScoreSlider
          name="score_communication"
          label="Communication"
          value={scores.communication}
          onChange={(v) => setScore("communication", v)}
        />
        <ScoreSlider
          name="score_data_analysis"
          label="Data Analysis"
          value={scores.data_analysis}
          onChange={(v) => setScore("data_analysis", v)}
        />
      </div>

      <Textarea
        id="notes"
        name="notes"
        label="Notes (optional)"
        placeholder="What went well? What to improve?"
        rows={4}
      />

      <SubmitButton />
    </form>
  );
}
