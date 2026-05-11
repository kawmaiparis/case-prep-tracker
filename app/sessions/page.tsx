import { SessionTable } from "@/components/sessions/SessionTable";
import { getAllSessions } from "@/lib/queries/sessions";
import { getPartners, getCaseTypes } from "@/lib/queries/partners";

export default async function SessionsPage() {
  const [sessions, partners, caseTypes] = await Promise.all([
    getAllSessions(),
    getPartners(),
    getCaseTypes(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <SessionTable sessions={sessions} partners={partners} caseTypes={caseTypes} />
    </div>
  );
}
