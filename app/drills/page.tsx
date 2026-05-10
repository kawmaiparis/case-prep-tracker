import { Header } from "@/components/layout/Header";
import { getAllSessions } from "@/lib/queries/sessions";
import { drillPlan } from "@/lib/reports";

export default async function DrillsPage() {
  const sessions = await getAllSessions();
  const plan = drillPlan(sessions);

  return (
    <div>
      <Header title="Drill Plan" />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {plan.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Log at least one session to get a drill plan.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              Based on your last {Math.min(sessions.length, 10)} sessions
            </p>
            {plan.map((item, i) => (
              <div
                key={item.dimension}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      #{i + 1} Weakest
                    </p>
                    <h2 className="text-lg font-bold text-gray-900 mt-0.5">{item.label}</h2>
                  </div>
                  <span
                    className={`text-xl font-bold tabular-nums ${
                      item.avgScore <= 2
                        ? "text-red-500"
                        : item.avgScore < 4
                        ? "text-yellow-500"
                        : "text-green-600"
                    }`}
                  >
                    {item.avgScore.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  {item.drills.map((drill, j) => (
                    <div key={j} className="flex gap-3">
                      <span className="text-blue-400 font-bold text-sm shrink-0 mt-0.5">
                        {j + 1}.
                      </span>
                      <p className="text-sm text-gray-700 leading-snug">{drill}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
