import Link from "next/link";
import type { Dimension } from "@/lib/reports";
import { avgScores, SCORE_DIMENSIONS, DIMENSION_LABELS } from "@/lib/reports";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";

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
    <Card>
      <CardBody className="space-y-3">
        <div>
          <Badge variant="warning">Focus area</Badge>
          <Heading as="h2" className="mt-1.5">{DIMENSION_LABELS[dimension]}</Heading>
          <Text muted size="xs" className="mt-0.5">
            Avg {avgs[dimension].toFixed(1)} · last {Math.min(sessions.length, 10)} sessions
          </Text>
        </div>

        <div className="space-y-1.5">
          {SCORE_DIMENSIONS.map((dim) => {
            const pct  = (avgs[dim] / 5) * 100;
            const fill = avgs[dim] <= 2 ? "bg-warning" : avgs[dim] < 4 ? "bg-muted/50" : "bg-accent";
            return (
              <div key={dim} className="flex items-center gap-2">
                <Text muted size="xs" className="w-28 shrink-0 truncate">
                  {DIMENSION_LABELS[dim]}
                </Text>
                <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
                </div>
                <Text muted size="xs" className="w-6 text-right tabular-nums">
                  {avgs[dim].toFixed(1)}
                </Text>
              </div>
            );
          })}
        </div>

        <Link
          href="/drills"
          className="block text-center text-sm font-medium text-accent hover:text-accent-hover transition-colors py-1"
        >
          See drill plan →
        </Link>
      </CardBody>
    </Card>
  );
}
