import type { Metadata } from "next";
import "./globals.css";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#06070b" />
      </head>
      <body className="bg-noise relative min-h-screen bg-ink-950 antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-glow" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint bg-[size:48px_48px] opacity-[0.35]" />
        {children}
      </body>
    </html>
  );
}
