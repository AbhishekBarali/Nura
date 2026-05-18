import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Literata } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nura — Autonomous Clinical Voice Agent",
  description:
    "An AI agent that listens to doctor-patient conversations and autonomously detects drug interactions, flags allergy conflicts, routes referrals, and generates clinical notes in real-time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${literata.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="app-wrapper relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
