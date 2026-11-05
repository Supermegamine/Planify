import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planify — Smart Planner & Habit Tracker",
  description: "Plan your projects, track habits, and schedule activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="ml-64 min-w-0 flex-1 p-8">
          <DemoBanner />
          {children}
        </main>
      </body>
    </html>
  );
}
