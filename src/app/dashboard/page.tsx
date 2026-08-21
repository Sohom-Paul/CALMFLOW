import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const {data: profile} = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const {data: sessions} = await supabase.from("meditation_sessions").select("*").eq("user_id", user.id).order("completed_at", {ascending: false});

  return <DashboardClient user={user} profile={profile} sessions={sessions || []} />;
}
