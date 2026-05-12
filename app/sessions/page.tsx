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
    <div className="max-w-3xl xl:max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <SessionTable sessions={sessions} partners={partners} caseTypes={caseTypes} />
    </div>
  );
}
