"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { SectionHeading } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { authConfigured, user } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → go home.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const withEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const supa = getBrowserSupabase();
    if (!supa) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supa.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage(
          "Account created. If email confirmation is on, check your inbox to confirm, then sign in.",
        );
        setMode("signin");
      } else {
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (!authConfigured) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <SectionHeading eyebrow="Accounts" title="Sign in" />
        <div className="card p-6 text-sm" style={{ color: "var(--fg-soft)" }}>
          <p>
            Cloud accounts aren&apos;t configured for this deployment, so AgentLab is
            running in <b>local mode</b> — your progress is saved in this browser only.
          </p>
          <p className="mt-3">
            To enable sign-in and cross-device sync, set the Supabase environment
            variables (see <code>docs/deployment.md</code>).
          </p>
          <Link href="/" className="btn mt-4">
            Continue in local mode →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <SectionHeading
        eyebrow="Accounts"
        title={mode === "signin" ? "Sign in" : "Create account"}
      />
      <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
        Save your progress and sync it across devices. You can also keep using AgentLab
        without an account — everything works locally.
      </p>

      <div className="card space-y-4 p-6">
        <form onSubmit={withEmail} className="space-y-3">
          <label className="block">
            <span className="label">Email</span>
            <input
              className="input mt-1"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input
              className="input mt-1"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {error && (
          <p className="rounded-md p-2 text-xs" style={{ background: "var(--bad-bg)", color: "var(--bad)" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-md p-2 text-xs" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>
            {message}
          </p>
        )}

        <div className="text-center text-xs" style={{ color: "var(--muted)" }}>
          {mode === "signin" ? (
            <button className="underline" onClick={() => setMode("signup")}>
              Need an account? Create one
            </button>
          ) : (
            <button className="underline" onClick={() => setMode("signin")}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
        <Link href="/" className="underline">
          Skip and use local mode →
        </Link>
      </p>
    </div>
  );
}
