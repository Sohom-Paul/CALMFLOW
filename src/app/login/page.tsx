import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Login({searchParams}: {searchParams: Promise<{error?: string}>}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = await createClient();
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) redirect("/login?error=" + encodeURIComponent(error.message));
    redirect("/dashboard");
  }

  async function signUp(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = await createClient();
    const {error} = await supabase.auth.signUp({email, password});
    if (error) redirect("/login?error=" + encodeURIComponent(error.message));
    redirect("/login?error=" + encodeURIComponent("Check your email to confirm your account."));
  }

  return <main className="auth-shell">
    <div className="auth-card">
      <div className="brand">🌿 CalmFlow</div>
      <h1>Your calm starts here.</h1>
      <p>Sign in to keep your meditation history and progress synced across devices.</p>
      {params.error && <div className="notice">{params.error}</div>}
      <form action={signIn}>
        <label>Email<input name="email" type="email" required autoComplete="email"/></label>
        <label>Password<input name="password" type="password" required minLength={6} autoComplete="current-password"/></label>
        <button className="primary">Sign in</button>
      </form>
      <form action={signUp}>
        <button className="secondary" type="submit">Create account</button>
      </form>
      <small>CalmFlow is for general wellness and is not a substitute for professional medical care.</small>
    </div>
  </main>
}
