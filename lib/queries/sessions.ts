import { createClient } from "@/lib/supabase/server";

export type SessionWithDetails = {
  id: string;
  user_id: string;
  date: string;
  partner_id: string | null;
  case_type_id: number | null;
  case_name: string | null;
  case_book: string | null;
  industry: string | null;
  notes: string | null;
  score_structure: number;
  score_math: number;
  score_creativity: number;
  score_communication: number;
  score_data_analysis: number;
  created_at: string;
  partners: { name: string } | null;
  case_types: { name: string } | null;
};

export async function getAllSessions(): Promise<SessionWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*, partners(name), case_types(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SessionWithDetails[];
}

export async function getRecentSessions(n = 10): Promise<SessionWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*, partners(name), case_types(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(n);

  if (error) throw error;
  return (data ?? []) as SessionWithDetails[];
}
