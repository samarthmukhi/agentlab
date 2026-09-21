"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { SectionHeading } from "@/components/ui";
import { migrateState, saveState } from "@/lib/state";

type Theme = "system" | "light" | "dark";

export default function SettingsPage() {
  const { state, updateSettings, resetAll, exportState, authConfigured, user, signOut } =
    useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const t = (localStorage.getItem("agentlab.theme") as Theme) || "system";
      setTheme(t);
    } catch {
      /* ignore */
    }
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    try {
      localStorage.setItem("agentlab.theme", t);
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    if (t === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
  };

  const doExport = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentlab-state.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = migrateState(JSON.parse(String(reader.result)));
        saveState(parsed);
        setImportMsg("Imported. Reloading…");
        setTimeout(() => window.location.reload(), 600);
      } catch {
        setImportMsg("Import failed — invalid file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Configuration" title="Settings" />

      <div className="card p-5">
        <div className="label mb-2">Account</div>
        {!authConfigured ? (
          <p className="text-sm" style={{ color: "var(--fg-soft)" }}>
            Running in <b>local mode</b> — progress is saved in this browser only. Cloud
            accounts aren&apos;t configured for this deployment (see{" "}
            <code>docs/deployment.md</code>).
          </p>
        ) : user ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              Signed in as <b>{user.email || "your account"}</b> · progress synced to the
              cloud.
            </div>
            <button className="btn" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm" style={{ color: "var(--fg-soft)" }}>
              You&apos;re not signed in. Progress is local to this browser until you sign
              in.
            </div>
            <Link href="/login" className="btn btn-primary">
              Sign in to sync
            </Link>
          </div>
        )}
      </div>

      <div className="card p-5">
        <label className="block max-w-sm">
          <span className="label">Display name (optional)</span>
          <input
            className="input mt-1"
            value={state.settings.displayName}
            onChange={(e) => updateSettings({ displayName: e.target.value })}
            placeholder="Your name"
          />
        </label>
      </div>

      <div className="card p-5">
        <div className="label mb-2">Appearance</div>
        <div className="flex gap-2">
          {(["system", "light", "dark"] as Theme[]).map((t) => (
            <button
              key={t}
              className="btn capitalize"
              onClick={() => applyTheme(t)}
              style={theme === t ? { background: "var(--surface-2)", borderColor: "var(--fg)" } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="label mb-2">Data</div>
        <p className="mb-3 text-sm" style={{ color: "var(--fg-soft)" }}>
          All progress lives in your browser (localStorage). Export a backup or move it to
          another browser. No account, no server, no API key.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={doExport}>
            ↓ Export state (JSON)
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ↑ Import state
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
          />
        </div>
        {importMsg && (
          <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
            {importMsg}
          </p>
        )}
      </div>

      <div className="card p-5" style={{ borderColor: "var(--bad)" }}>
        <div className="label mb-2" style={{ color: "var(--bad)" }}>
          Danger zone
        </div>
        <p className="mb-3 text-sm" style={{ color: "var(--fg-soft)" }}>
          Reset erases all progress, results, reflections, research, and evidence. This
          cannot be undone.
        </p>
        {!confirmReset ? (
          <button className="btn" style={{ color: "var(--bad)" }} onClick={() => setConfirmReset(true)}>
            Reset everything
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="btn"
              style={{ background: "var(--bad)", color: "#fff", borderColor: "var(--bad)" }}
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Yes, erase all data
            </button>
            <button className="btn" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        AgentLab is a personal learning system and experimental assessment workflow.
      </p>
    </div>
  );
}
