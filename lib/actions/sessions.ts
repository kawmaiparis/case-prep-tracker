"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export async function logSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const caseTypeIdRaw = formData.get("case_type_id") as string;

  const row: SessionInsert = {
    user_id: user!.id,
    date: formData.get("date") as string,
    partner_id: (formData.get("partner_id") as string) || null,
    case_type_id: caseTypeIdRaw ? parseInt(caseTypeIdRaw) : null,
    case_name: (formData.get("case_name") as string) || null,
    case_book: (formData.get("case_book") as string) || null,
    industry: (formData.get("industry") as string) || null,
    notes: (formData.get("notes") as string) || null,
    score_structure: parseInt(formData.get("score_structure") as string),
    score_math: parseInt(formData.get("score_math") as string),
    score_creativity: parseInt(formData.get("score_creativity") as string),
    score_communication: parseInt(formData.get("score_communication") as string),
    score_data_analysis: parseInt(formData.get("score_data_analysis") as string),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("sessions").insert(row);

  if (error) throw new Error(error.message);

  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  revalidatePath("/drills");
  redirect("/sessions");
}
