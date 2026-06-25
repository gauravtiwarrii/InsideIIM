import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvestIQ — AI Investment Research Agent",
  description:
    "AI-powered investment research agent that analyzes companies using a 6-agent LangGraph pipeline and delivers data-driven Invest, Hold, or Pass recommendations with real-time web research.",
  keywords: [
    "AI",
    "investment",
    "research",
    "agent",
    "stock analysis",
    "financial analysis",
    "SWOT",
    "LangGraph",
    "InvestIQ",
  ],
  openGraph: {
    title: "InvestIQ — AI Investment Research Agent",
    description:
      "Research at the speed of thought. AI-powered investment analysis with 6 specialized agents.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvestIQ — AI Investment Research Agent",
    description:
      "Research at the speed of thought. AI-powered investment analysis with 6 specialized agents.",
  },
  other: {
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-black antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
