import { Header } from "@/components/layout/Header";
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
    <div>
      <Header title="Sessions" />
      <div className="max-w-lg mx-auto p-4">
        <SessionTable sessions={sessions} partners={partners} caseTypes={caseTypes} />
      </div>
    </div>
  );
}
