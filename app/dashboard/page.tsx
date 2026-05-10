import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { WeakDimCard } from "@/components/dashboard/WeakDimCard";
import { getRecentSessions } from "@/lib/queries/sessions";
import { weakestDimension, DIMENSION_LABELS } from "@/lib/reports";

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
}

export default async function DashboardPage() {
  const sessions = await getRecentSessions(20);
  const thisWeek = sessions.filter((s) => isThisWeek(s.date)).length;
  const weakDim = weakestDimension(sessions);

  return (
    <div>
      <Header title="Dashboard" />
      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">This week</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{thisWeek}</p>
            <p className="text-xs text-gray-400 mt-0.5">sessions</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total</p>
            <p className="text-4xl font-bold text-gray-900 mt-1">{sessions.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">logged</p>
          </div>
        </div>

        {/* Quick log CTA */}
        <Link href="/log">
          <div className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between active:bg-blue-700 transition-colors">
            <div>
              <p className="font-semibold text-base">Log a session</p>
              <p className="text-blue-200 text-xs mt-0.5">Record today&apos;s practice</p>
            </div>
            <span className="text-2xl">+</span>
          </div>
        </Link>

        {/* Weak dimension */}
        {weakDim && sessions.length > 0 && (
          <WeakDimCard dimension={weakDim} sessions={sessions} />
        )}

        {/* Recent sessions */}
        {sessions.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">Recent sessions</h2>
            </div>
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {s.case_types?.name ?? "Case"}
                    {s.case_name ? ` — ${s.case_name}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.partners?.name ?? "No partner"} · {s.date}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    ((s.score_structure + s.score_math + s.score_creativity +
                      s.score_communication + s.score_data_analysis) / 5) <= 2
                      ? "text-red-400"
                      : ((s.score_structure + s.score_math + s.score_creativity +
                          s.score_communication + s.score_data_analysis) / 5) < 4
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {((s.score_structure + s.score_math + s.score_creativity +
                    s.score_communication + s.score_data_analysis) / 5).toFixed(1)}
                </span>
              </div>
            ))}
            <Link
              href="/sessions"
              className="block px-4 py-3 text-center text-sm text-blue-600 font-medium hover:bg-gray-50"
            >
              See all sessions →
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No sessions yet.</p>
            <Link href="/log" className="text-blue-600 text-sm font-medium hover:underline mt-1 block">
              Log your first session →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
