import { Header } from "@/components/layout/Header";
import { SessionForm } from "@/components/sessions/SessionForm";
import { getPartners, getCaseTypes } from "@/lib/queries/partners";

export default async function LogPage() {
  const [partners, caseTypes] = await Promise.all([getPartners(), getCaseTypes()]);

  return (
    <div>
      <Header title="Log Session" />
      <SessionForm partners={partners} caseTypes={caseTypes} />
    </div>
  );
}
