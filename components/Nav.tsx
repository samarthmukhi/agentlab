"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "./StoreProvider";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/builds", label: "Builds" },
  { href: "/assess", label: "Assessments" },
  { href: "/review", label: "Review" },
  { href: "/reports", label: "Reports" },
  { href: "/swarmfolio", label: "SwarmFolio" },
  { href: "/evidence", label: "Evidence" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state, hydrated } = useStore();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
            style={{
              background: active ? "var(--surface-2)" : "transparent",
              color: active ? "var(--fg)" : "var(--fg-soft)",
              fontWeight: active ? 600 : 400,
            }}
          >
            <span>{item.label}</span>
            {item.href === "/assess" && hydrated && (
              <span className="mono text-xs" style={{ color: "var(--muted)" }}>
                D{state.currentDay}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBox({ onNavigate }: { onNavigate?: () => void }) {
  const { authConfigured, authLoading, user, signOut, syncing } = useStore();

  if (!authConfigured) {
    return (
      <div className="rounded-md px-3 py-2 text-[11px]" style={{ color: "var(--muted)" }}>
        <span aria-hidden>◍</span> Local mode · saved in this browser
      </div>
    );
  }
  if (authLoading) {
    return (
      <div className="px-3 py-2 text-[11px]" style={{ color: "var(--muted)" }}>
        Checking session…
      </div>
    );
  }
  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="btn w-full justify-center"
      >
        Sign in to sync
      </Link>
    );
  }
  return (
    <div className="rounded-md border p-2.5">
      <div className="truncate text-xs font-medium" title={user.email}>
        {user.email || "Signed in"}
      </div>
      <div className="mt-0.5 text-[10px]" style={{ color: "var(--muted)" }}>
        {syncing ? "Syncing…" : "Synced to cloud"}
      </div>
      <button
        className="btn mt-2 w-full justify-center"
        onClick={async () => {
          await signOut();
          onNavigate?.();
        }}
      >
        Sign out
      </button>
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
        style={{ background: "var(--fg)", color: "var(--bg)" }}
        aria-hidden
      >
        A
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">AgentLab</div>
        <div className="text-[10px]" style={{ color: "var(--muted)" }}>
          Learn · Build · Test
        </div>
      </div>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r p-4 lg:flex"
      style={{ background: "var(--surface)" }}
    >
      <div className="mb-6 px-2">
        <Wordmark />
      </div>
      <NavLinks />
      <div className="mt-auto space-y-2 pt-4">
        <AccountBox />
        <div className="px-2 text-[10px]" style={{ color: "var(--muted)" }}>
          9-day agentic-AI sprint
        </div>
      </div>
    </aside>
  );
}

export function MobileBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <div
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3"
        style={{ background: "var(--surface)" }}
      >
        <Wordmark />
        <button
          className="btn"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-b p-4" style={{ background: "var(--surface)" }}>
          <NavLinks onNavigate={() => setOpen(false)} />
          <AccountBox onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
