import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import { MobileBar, Sidebar } from "@/components/Nav";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgentLab — Evidence-driven agentic-AI lab",
  description:
    "A personal 9-day agentic-AI learning environment: Learn → Build → Assess → Diagnose → Review → Retest → Document.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <MobileBar />
              <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                {children}
              </main>
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
