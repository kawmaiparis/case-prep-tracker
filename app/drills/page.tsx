import { getAllSessions } from "@/lib/queries/sessions";
import { drillPlan } from "@/lib/reports";
import { Card, CardBody } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";

function avgColor(score: number) {
  if (score >= 4) return "text-accent";
  if (score >= 3) return "text-muted";
  return "text-warning";
}

export default async function DrillsPage() {
  const sessions = await getAllSessions();
  const plan = drillPlan(sessions);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div>
        <Heading as="h1">Drill Plan</Heading>
        {sessions.length > 0 && (
          <Text muted size="sm" className="mt-1">
            Based on your last {Math.min(sessions.length, 10)} sessions
          </Text>
        )}
      </div>

      {plan.length === 0 ? (
        <div className="py-16 text-center">
          <Text muted>Log at least one session to get a drill plan.</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {plan.map((item, i) => (
            <Card key={item.dimension}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="warning">#{i + 1} Weakest</Badge>
                    <Heading as="h2" className="mt-1.5">{item.label}</Heading>
                  </div>
                  <span className={`text-2xl font-bold tabular-nums shrink-0 ${avgColor(item.avgScore)}`}>
                    {item.avgScore.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  {item.drills.map((drill, j) => (
                    <div key={j} className="flex gap-3">
                      <span className="text-accent font-semibold text-sm shrink-0 tabular-nums mt-0.5">
                        {j + 1}.
                      </span>
                      <Text size="sm" className="leading-relaxed">{drill}</Text>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
