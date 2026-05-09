import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export const metadata: Metadata = {
  title: "Life OS — Command Center",
  description: "A futuristic operating system for a high-performance life.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="bg-noise relative min-h-screen bg-ink-950 antialiased">
        {/* Ambient backdrop */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-glow" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint bg-[size:48px_48px] opacity-[0.35]" />

        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
