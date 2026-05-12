import { SessionForm } from "@/components/sessions/SessionForm";
import { getPartners, getCaseTypes } from "@/lib/queries/partners";
import { Heading } from "@/components/ui/Heading";

export default async function LogPage() {
  const [partners, caseTypes] = await Promise.all([getPartners(), getCaseTypes()]);

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <Heading as="h1" className="mb-6">Log Session</Heading>
      <SessionForm partners={partners} caseTypes={caseTypes} />
    </div>
  );
}
