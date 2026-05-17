import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nura — Autonomous Clinical Voice Agent",
  description:
    "An AI agent that listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates clinical notes in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="app-wrapper relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
