import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgenticDevOps — Auto Code Review & Portfolio Builder",
  description: "Drop a GitHub repo. Get a README, LinkedIn post, and interview prep sheet — powered by AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
