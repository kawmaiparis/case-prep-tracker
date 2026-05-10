import Link from "next/link";
import type { Dimension } from "@/lib/reports";
import { avgScores, SCORE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/reports";

type ScoreRow = {
  score_structure: number;
  score_math: number;
  score_creativity: number;
  score_communication: number;
  score_data_analysis: number;
};

type WeakDimCardProps = {
  dimension: Dimension;
  sessions: ScoreRow[];
};

export function WeakDimCard({ dimension, sessions }: WeakDimCardProps) {
  const avgs = avgScores(sessions.slice(0, 10));

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Focus area</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{DIMENSION_LABELS[dimension]}</p>
        <p className="text-sm text-gray-500">
          Avg score: <span className="font-semibold text-orange-500">{avgs[dimension].toFixed(1)}</span>
          {" "}over last {Math.min(sessions.length, 10)} sessions
        </p>
      </div>

      <div className="space-y-1.5">
        {SCORE_DIMENSIONS.map((dim) => (
          <div key={dim} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-28 truncate">{DIMENSION_LABELS[dim]}</span>
            <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className={
                  avgs[dim] <= 2
                    ? "h-full bg-red-400 rounded-full"
                    : avgs[dim] < 4
                    ? "h-full bg-yellow-400 rounded-full"
                    : "h-full bg-green-500 rounded-full"
                }
                style={{ width: `${(avgs[dim] / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-6 text-right">
              {avgs[dim].toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/drills"
        className="block text-center text-sm font-medium text-amber-700 bg-amber-100 rounded-lg py-2 hover:bg-amber-200 transition-colors"
      >
        See drill plan →
      </Link>
    </div>
  );
}
