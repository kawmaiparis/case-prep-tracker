import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
export type CaseTypeRow = Database["public"]["Tables"]["case_types"]["Row"];

export async function getPartners(): Promise<PartnerRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("is_paid_coach", { ascending: false })
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getCaseTypes(): Promise<CaseTypeRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_types")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}
