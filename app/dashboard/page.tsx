import Link from "next/link";
import { getRecentSessions } from "@/lib/queries/sessions";
import { weakestDimension } from "@/lib/reports";
import { WeakDimCard } from "@/components/dashboard/WeakDimCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
}

function scoreAvg(s: {
  score_structure: number; score_math: number; score_creativity: number;
  score_communication: number; score_data_analysis: number;
}) {
  return (s.score_structure + s.score_math + s.score_creativity +
    s.score_communication + s.score_data_analysis) / 5;
}

function avgColor(avg: number) {
  if (avg >= 4) return "text-emerald-400";
  if (avg >= 3) return "text-amber-400";
  return "text-rose-400";
}

export default async function DashboardPage() {
  const sessions = await getRecentSessions(20);
  const thisWeek = sessions.filter((s) => isThisWeek(s.date)).length;
  const weakDim  = weakestDimension(sessions);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Heading as="h1">Dashboard</Heading>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardBody>
            <Text muted size="xs" className="uppercase tracking-wide font-medium">This week</Text>
            <p className="text-4xl font-bold text-primary mt-1 leading-none">{thisWeek}</p>
            <Text muted size="xs" className="mt-1">sessions</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text muted size="xs" className="uppercase tracking-wide font-medium">Total</Text>
            <p className="text-4xl font-bold text-primary mt-1 leading-none">{sessions.length}</p>
            <Text muted size="xs" className="mt-1">logged</Text>
          </CardBody>
        </Card>
      </div>

      {/* Log CTA */}
      <Link href="/log" className="block">
        <div className="bg-accent hover:bg-accent-hover rounded-md p-4 flex items-center justify-between transition-colors">
          <div>
            <p className="font-semibold text-white">Log a session</p>
            <p className="text-blue-200 text-xs mt-0.5">Record today&apos;s practice</p>
          </div>
          <span className="text-white text-2xl font-light select-none">+</span>
        </div>
      </Link>

      {/* Weak dimension */}
      {weakDim && sessions.length > 0 && (
        <WeakDimCard dimension={weakDim} sessions={sessions} />
      )}

      {/* Recent sessions */}
      {sessions.length > 0 ? (
        <Card>
          <CardHeader>
            <Heading as="h3">Recent sessions</Heading>
          </CardHeader>
          <div>
            {sessions.slice(0, 5).map((s, i) => {
              const avg = scoreAvg(s);
              return (
                <div
                  key={s.id}
                  className={`px-4 py-3 flex items-center justify-between gap-3 ${
                    i < Math.min(sessions.length, 5) - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.case_types?.name && (
                        <Badge variant="default">{s.case_types.name}</Badge>
                      )}
                      {s.case_name && (
                        <span className="text-sm text-primary truncate">{s.case_name}</span>
                      )}
                    </div>
                    <Text muted size="xs">
                      {s.partners?.name ?? "—"} · {s.date}
                    </Text>
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${avgColor(avg)}`}>
                    {avg.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-divider">
            <Link
              href="/sessions"
              className="block px-4 py-3 text-center text-sm text-accent hover:text-accent-hover transition-colors font-medium"
            >
              See all sessions →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="py-16 text-center space-y-2">
          <Text muted>No sessions yet.</Text>
          <Link href="/log" className="text-accent text-sm font-medium hover:text-accent-hover block">
            Log your first session →
          </Link>
        </div>
      )}
    </div>
  );
}
