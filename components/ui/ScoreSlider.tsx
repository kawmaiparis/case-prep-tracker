"use client";

import { cn } from "@/lib/utils";

const SCORE_LABELS = ["", "Poor", "Below Avg", "Average", "Good", "Excellent"];
const SCORE_COLORS = [
  "",
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-green-500",
  "text-emerald-600",
];

type ScoreSliderProps = {
  name: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
};

export function ScoreSlider({ name, label, value, onChange }: ScoreSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={cn("text-sm font-semibold tabular-nums", SCORE_COLORS[value])}>
          {value} — {SCORE_LABELS[value]}
        </span>
      </div>
      <input
        type="range"
        name={name}
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-600
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-blue-600
          [&::-moz-range-thumb]:border-0"
      />
      <div className="flex justify-between text-xs text-gray-400 px-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}

type ScoreBarProps = {
  value: number;
  max?: number;
};

export function ScoreBar({ value, max = 5 }: ScoreBarProps) {
  const pct = (value / max) * 100;
  const color =
    value <= 2 ? "bg-red-400" : value === 3 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums w-4", SCORE_COLORS[Math.round(value)])}>
        {value % 1 === 0 ? value : value.toFixed(1)}
      </span>
    </div>
  );
}
