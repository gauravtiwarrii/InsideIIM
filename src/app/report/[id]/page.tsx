"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Download,
  FileText,
  Activity,
  Link as LinkIcon,
  ArrowLeft,
  AlertTriangle,
  Home,
  RotateCcw,
  TrendingUp,
  Shield,
  Lightbulb,
  Target,
  Zap,
  Users,
  Building2,
  Crown,
  Copy,
  Clock,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StockChart from "@/components/StockChart";
import RadarGraph from "@/components/RadarGraph";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import MetricsDashboard from "@/components/MetricsDashboard";
import BullBearCard from "@/components/BullBearCard";
import CatalystsTimeline from "@/components/CatalystsTimeline";
import { WatchlistToggle, addToWatchlist } from "@/components/Watchlist";
import Toast, { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "Researching company overview...", icon: "🔍" },
  { label: "Gathering financials...", icon: "📊" },
  { label: "Analyzing news...", icon: "📰" },
  { label: "Evaluating risks...", icon: "🛡️" },
  { label: "Generating recommendation...", icon: "🎯" },
  { label: "Critiquing recommendation...", icon: "👁️" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// Skeleton placeholder
function SkeletonSection({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-card animate-fade-up">
      <div className="skeleton skeleton-text" style={{ width: "40%" }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
      <div className="skeleton skeleton-text-sm" />
    </div>
  );
}

import { createClient } from '@/utils/supabase/client'

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReportPageContent params={params} />
    </Suspense>
  );
}

function ReportPageContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(STEPS.length);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);
  
  const [researchData, setResearchData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [investmentData, setInvestmentData] = useState<any>(null);
  const [technicalData, setTechnicalData] = useState<any>(null);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [tickerSymbol, setTickerSymbol] = useState<string | null>(null);
  const [company, setCompany] = useState<string>("");

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    async function loadReport() {
      try {
        const { id } = await params;
        const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();
        if (error) throw error;
        
        const reportData = data.report_data;
        setResult(reportData);
        setCompany(data.company_name);
        setResearchData(reportData.researchData);
        setFinancialData(reportData.financialData);
        setNewsData(reportData.newsData);
        setRiskData(reportData.riskData);
        setTechnicalData(reportData.technicalData);
        setSentimentData(reportData.sentimentData);
        setInvestmentData(reportData.investmentData);
        setChartData(reportData.chartData);
        setTickerSymbol(reportData.tickerSymbol);
        
      } catch (err: any) {
        setError("Failed to load report: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params]);

  const exportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    // Build a clean, print-optimized HTML document
    const verdictColorHex = id?.recommendation === "INVEST" ? "#059669" : id?.recommendation === "HOLD" ? "#d97706" : "#dc2626";
    const verdictBg = id?.recommendation === "INVEST" ? "#ecfdf5" : id?.recommendation === "HOLD" ? "#fffbeb" : "#fef2f2";
    const holdingLabel = id?.holdingPeriod === "SHORT_TERM" ? "Short Term (< 6 months)" : id?.holdingPeriod === "MEDIUM_TERM" ? "Medium Term (6–18 months)" : id?.holdingPeriod === "LONG_TERM" ? "Long Term (18+ months)" : "";

    const scoreBar = (score: number, color: string, label: string) => `
      <div style="flex:1;text-align:center;">
        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${label}</div>
        <div style="font-size:28px;font-weight:800;color:${color};">${score}</div>
        <div style="height:4px;background:#e5e7eb;border-radius:99px;margin-top:6px;overflow:hidden;">
          <div style="height:100%;width:${score}%;background:${color};border-radius:99px;"></div>
        </div>
      </div>
    `;

    const section = (title: string, content: string) => `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 12px 0;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">${title}</h2>
        ${content}
      </div>
    `;

    const bulletList = (items: string[], color = "#374151") => items?.length > 0
      ? `<ul style="margin:0;padding-left:20px;color:${color};">${items.map(item => `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;">${item}</li>`).join("")}</ul>`
      : `<p style="color:#9ca3af;font-size:13px;">No data available</p>`;

    const pdfContent = `
      <div style="font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#1f2937;max-width:700px;margin:0 auto;">
        
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #111827;">
          <div>
            <h1 style="font-size:32px;font-weight:800;color:#111827;margin:0 0 4px 0;letter-spacing:-0.02em;">${company}</h1>
            <div style="display:flex;align-items:center;gap:12px;">
              ${ts ? `<span style="font-size:14px;color:#6b7280;font-family:monospace;">${ts}</span>` : ""}
              ${rd?.industry ? `<span style="font-size:11px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:99px;">${rd.industry}</span>` : ""}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">InvestIQ Report</div>
            <div style="font-size:12px;color:#6b7280;margin-top:2px;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>

        <!-- Verdict -->
        ${id ? `
        <div style="display:flex;align-items:center;gap:20px;padding:20px;background:${verdictBg};border:2px solid ${verdictColorHex}30;border-radius:12px;margin-bottom:24px;page-break-inside:avoid;">
          <div style="text-align:center;min-width:120px;">
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Verdict</div>
            <div style="font-size:36px;font-weight:900;color:${verdictColorHex};">${id.recommendation}</div>
          </div>
          <div style="width:1px;height:60px;background:#d1d5db;"></div>
          <div style="flex:1;">
            <div style="display:flex;gap:24px;margin-bottom:8px;">
              <div><span style="font-size:10px;color:#6b7280;text-transform:uppercase;">Score</span><br/><span style="font-size:20px;font-weight:700;color:${verdictColorHex};">${id.investmentScore}/100</span></div>
              <div><span style="font-size:10px;color:#6b7280;text-transform:uppercase;">Confidence</span><br/><span style="font-size:20px;font-weight:700;color:#374151;">${id.confidenceScore}%</span></div>
              ${holdingLabel ? `<div><span style="font-size:10px;color:#6b7280;text-transform:uppercase;">Holding Period</span><br/><span style="font-size:13px;font-weight:600;color:#374151;">${holdingLabel}</span></div>` : ""}
            </div>
            ${id.targetPriceInsight ? `<div style="font-size:12px;color:#6b7280;background:#f9fafb;padding:6px 10px;border-radius:6px;margin-top:4px;">📊 ${id.targetPriceInsight}</div>` : ""}
          </div>
        </div>
        ` : ""}

        <!-- Scores Dashboard -->
        <div style="display:flex;gap:16px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;page-break-inside:avoid;">
          ${scoreBar(fd?.financialHealthScore || 0, "#059669", "Financial")}
          ${scoreBar(nd?.newsSentimentScore || 0, "#7c3aed", "Sentiment")}
          ${scoreBar(rkd?.riskScore || 0, "#dc2626", "Risk")}
          ${scoreBar(id?.investmentScore || 0, "#2563eb", "Investment")}
        </div>

        <!-- Investment Thesis -->
        ${id?.reasoning ? section("Investment Thesis", `<p style="font-size:13px;line-height:1.8;color:#374151;margin:0;">${id.reasoning}</p>`) : ""}

        <!-- Bull / Bear Cases -->
        ${(id?.bullCase?.length || id?.bearCase?.length) ? `
        <div style="display:flex;gap:16px;margin-bottom:24px;page-break-inside:avoid;">
          <div style="flex:1;padding:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;">
            <h3 style="font-size:14px;font-weight:700;color:#059669;margin:0 0 10px 0;">🐂 Bull Case</h3>
            ${bulletList(id?.bullCase || [], "#065f46")}
          </div>
          <div style="flex:1;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
            <h3 style="font-size:14px;font-weight:700;color:#dc2626;margin:0 0 10px 0;">🐻 Bear Case</h3>
            ${bulletList(id?.bearCase || [], "#991b1b")}
          </div>
        </div>
        ` : ""}

        <!-- Catalysts -->
        ${id?.catalysts?.length ? section("Key Catalysts & Price Triggers", bulletList(id.catalysts, "#4338ca")) : ""}

        <!-- Company Overview -->
        ${rd ? section("Company Overview", `
          <p style="font-size:13px;line-height:1.7;color:#374151;margin:0 0 12px 0;">${rd.overview || ""}</p>
          ${rd.marketPosition ? `<p style="font-size:13px;color:#374151;margin:0 0 8px 0;"><strong>Market Position:</strong> ${rd.marketPosition}</p>` : ""}
          ${rd.leadership ? `<p style="font-size:13px;color:#374151;margin:0 0 8px 0;"><strong>Leadership:</strong> ${rd.leadership}</p>` : ""}
          ${rd.competitors?.length ? `<p style="font-size:13px;color:#374151;margin:0;"><strong>Competitors:</strong> ${rd.competitors.join(", ")}</p>` : ""}
        `) : ""}

        <!-- Financial Data -->
        ${fd ? section("Financial Highlights", `
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="background:#f9fafb;">
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;width:40%;">Revenue</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.revenue || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;">Net Income</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.netIncome || "N/A"}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;">Market Cap</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.marketCap || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;">P/E Ratio</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.peRatio || "N/A"}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;">EPS</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.eps || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#6b7280;">Revenue Growth</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${fd.revenueGrowth || "N/A"}</td>
            </tr>
            <tr style="background:#ecfdf5;">
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;color:#059669;">Health Score</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;color:#059669;">${fd.financialHealthScore}/100</td>
            </tr>
          </table>
        `) : ""}

        <!-- News Sentiment -->
        ${nd ? section("News & Sentiment Analysis", `
          <p style="font-size:13px;line-height:1.7;color:#374151;margin:0 0 12px 0;">${nd.newsSummary || ""}</p>
          ${nd.productLaunches?.length ? `<p style="font-size:12px;font-weight:600;color:#6b7280;margin:0 0 4px 0;">Product Launches</p>${bulletList(nd.productLaunches)}` : ""}
          ${nd.acquisitions?.length ? `<p style="font-size:12px;font-weight:600;color:#6b7280;margin:12px 0 4px 0;">Acquisitions</p>${bulletList(nd.acquisitions)}` : ""}
          ${nd.partnerships?.length ? `<p style="font-size:12px;font-weight:600;color:#6b7280;margin:12px 0 4px 0;">Partnerships</p>${bulletList(nd.partnerships)}` : ""}
          <div style="margin-top:12px;padding:8px 12px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:6px;">
            <span style="font-size:12px;color:#7c3aed;font-weight:700;">Sentiment Score: ${nd.newsSentimentScore}/100</span>
          </div>
        `) : ""}

        <!-- Risk Assessment -->
        ${rkd ? section("Risk Assessment", `
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            ${rkd.marketRisk ? `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#dc2626;width:30%;vertical-align:top;">Market Risk</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;line-height:1.6;">${rkd.marketRisk}</td></tr>` : ""}
            ${rkd.competitionRisk ? `<tr style="background:#f9fafb;"><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#dc2626;vertical-align:top;">Competition</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;line-height:1.6;">${rkd.competitionRisk}</td></tr>` : ""}
            ${rkd.regulatoryRisk ? `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#dc2626;vertical-align:top;">Regulatory</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;line-height:1.6;">${rkd.regulatoryRisk}</td></tr>` : ""}
            ${rkd.debtRisk ? `<tr style="background:#f9fafb;"><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#dc2626;vertical-align:top;">Debt/Financial</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;line-height:1.6;">${rkd.debtRisk}</td></tr>` : ""}
            ${rkd.businessModelRisk ? `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#dc2626;vertical-align:top;">Business Model</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#374151;line-height:1.6;">${rkd.businessModelRisk}</td></tr>` : ""}
          </table>
          <div style="margin-top:12px;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">
            <span style="font-size:12px;color:#dc2626;font-weight:700;">Risk Score: ${rkd.riskScore}/100 (100 = low risk)</span>
          </div>
        `) : ""}

        <!-- SWOT -->
        ${(rd || nd || fd || rkd) ? section("SWOT Analysis", `
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:14px;border:1px solid #e5e7eb;vertical-align:top;">
                <div style="font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;margin-bottom:8px;">✅ Strengths</div>
                <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;">
                  ${rd?.marketPosition ? `<li style="margin-bottom:4px;">${rd.marketPosition}</li>` : ""}
                  ${fd?.revenueGrowth ? `<li style="margin-bottom:4px;">Revenue Growth: ${fd.revenueGrowth}</li>` : ""}
                </ul>
              </td>
              <td style="width:50%;padding:14px;border:1px solid #e5e7eb;vertical-align:top;">
                <div style="font-size:12px;font-weight:700;color:#d97706;text-transform:uppercase;margin-bottom:8px;">⚠️ Weaknesses</div>
                <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;">
                  ${rkd?.debtRisk ? `<li style="margin-bottom:4px;">${rkd.debtRisk}</li>` : ""}
                  ${rkd?.businessModelRisk ? `<li style="margin-bottom:4px;">${rkd.businessModelRisk}</li>` : ""}
                </ul>
              </td>
            </tr>
            <tr>
              <td style="width:50%;padding:14px;border:1px solid #e5e7eb;vertical-align:top;">
                <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;margin-bottom:8px;">🚀 Opportunities</div>
                <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;">
                  ${nd?.productLaunches?.map((v: string) => `<li style="margin-bottom:4px;">${v}</li>`).join("") || ""}
                  ${nd?.partnerships?.map((v: string) => `<li style="margin-bottom:4px;">${v}</li>`).join("") || ""}
                </ul>
              </td>
              <td style="width:50%;padding:14px;border:1px solid #e5e7eb;vertical-align:top;">
                <div style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;margin-bottom:8px;">🛡️ Threats</div>
                <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;">
                  ${rkd?.competitionRisk ? `<li style="margin-bottom:4px;">${rkd.competitionRisk}</li>` : ""}
                  ${rkd?.regulatoryRisk ? `<li style="margin-bottom:4px;">${rkd.regulatoryRisk}</li>` : ""}
                </ul>
              </td>
            </tr>
          </table>
        `) : ""}

        <!-- Citations -->
        ${uniqueCitations.length > 0 ? `
        <div style="margin-top:32px;padding-top:16px;border-top:2px solid #e5e7eb;page-break-inside:avoid;">
          <h3 style="font-size:13px;font-weight:600;color:#6b7280;margin:0 0 8px 0;">Data Sources (${uniqueCitations.length})</h3>
          <div style="font-size:11px;color:#9ca3af;line-height:1.8;">
            ${uniqueCitations.map((url, i) => `<span>${i + 1}. ${url}</span>`).join("<br/>")}
          </div>
        </div>
        ` : ""}

        <!-- Footer -->
        <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af;">
          Generated by InvestIQ · Multi-Agent AI Research Pipeline · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    `;

    const fullHtml = `
      <div style="width:700px;background:white;padding:40px;box-sizing:border-box;">
        ${pdfContent}
      </div>
    `;

    const opt = {
      margin: [0.5, 0.6, 0.5, 0.6] as [number, number, number, number],
      filename: `${company}_InvestIQ_Report.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "in" as const, format: "letter" as const, orientation: "portrait" as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(fullHtml).save();
  };

  const exportJSON = () => {
    const data = result || { researchData, financialData, newsData, riskData, investmentData };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${company}_InvestIQ.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Report link copied to clipboard!", "copy");
  }, [showToast]);

  const formatElapsed = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Determine which data we have for progressive rendering
  const hasAnyData = researchData || financialData || newsData || riskData || investmentData;
  const isComplete = !loading && (result || investmentData);

  // Use data from result or from progressive state
  const rd = result?.researchData || researchData;
  const fd = result?.financialData || financialData;
  const nd = result?.newsData || newsData;
  const rkd = result?.riskData || riskData;
  const id = result?.investmentData || investmentData;
  const cd = result?.chartData || chartData;
  const ts = result?.tickerSymbol || tickerSymbol;

  // ─── No Company Provided ────────────────────────────────
  if (!company)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-lg">No company provided.</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" /> Go Home
          </Button>
        </div>
      </div>
    );

  // ─── Loading State (no data yet) ────────────────────────
  if (loading && !hasAnyData) {
    const progressPercent = Math.min(
      ((currentStepIndex + 1) / STEPS.length) * 100,
      95
    );

    return (
      <div className="min-h-screen bg-black text-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/8 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg space-y-8 relative z-10">
          <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <div className="text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-[3px] border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-blue-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 border-[3px] border-cyan-400/30 rounded-full border-b-transparent animate-spin-slow" />
              <Activity className="w-7 h-7 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Agents at Work
            </h2>
            <p className="text-zinc-400">
              Compiling multi-agent report for{" "}
              <span className="text-white font-medium">{company}</span>
            </p>
          </div>

          <div className="glass-strong p-6 rounded-2xl space-y-3">
            {STEPS.map((step, idx) => {
              const isStepComplete = currentStepIndex > idx;
              const isActive = currentStepIndex === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`flex items-center gap-4 py-1.5 transition-all duration-300 ${
                    isActive ? "scale-[1.02]" : ""
                  }`}
                >
                  {isStepComplete && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                  {isActive && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                  )}
                  {!isStepComplete && !isActive && (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700 flex-shrink-0" />
                  )}
                  <span className="text-xs mr-2">{step.icon}</span>
                  <span
                    className={`text-sm ${
                      isActive
                        ? "text-white font-medium"
                        : isStepComplete
                        ? "text-zinc-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span className="animate-pulse">
              {loadingMessages[loadingMessages.length - 1]}
            </span>
            <span className="text-zinc-600 font-mono tabular-nums">
              {formatElapsed(elapsedTime)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="glass-strong border-rose-500/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Analysis Failed
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="bg-zinc-900 border-white/10 hover:bg-zinc-800 hover:text-white"
                >
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Progressive / Complete Results ─────────────────────
  const isInvest = id?.recommendation === "INVEST";
  const isHold = id?.recommendation === "HOLD";

  const allCitations = [
    ...(rd?.citations || []),
    ...(fd?.citations || []),
    ...(nd?.citations || []),
    ...(rkd?.citations || []),
  ].filter(
    (url): url is string => typeof url === "string" && url.trim() !== ""
  );
  const uniqueCitations = Array.from(new Set(allCitations));

  const verdictColor = isInvest
    ? "text-emerald-400"
    : isHold
    ? "text-yellow-400"
    : "text-rose-400";

  const verdictGlow = isInvest
    ? "drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]"
    : isHold
    ? "drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]"
    : "drop-shadow-[0_0_20px_rgba(251,113,133,0.3)]";

  return (
    <div className="min-h-screen bg-black text-zinc-50 selection:bg-blue-500/30">
      {/* Top gradient */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/15 to-transparent pointer-events-none z-0" />

      {/* Sticky Nav */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Search</span>
          </button>
          <div className="flex items-center gap-2">
            {loading && (
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10 backdrop-blur-md text-xs animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analyzing...
              </Badge>
            )}
            {!loading && (
              <Badge
                variant="outline"
                className="text-blue-400 border-blue-400/30 bg-blue-400/10 backdrop-blur-md text-xs"
              >
                InvestIQ Report
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {id && (
              <WatchlistToggle
                companyName={company}
                recommendation={id.recommendation}
                investmentScore={id.investmentScore}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-white text-xs h-8"
              onClick={copyLink}
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-white text-xs h-8"
              onClick={exportJSON}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-white text-xs h-8"
              onClick={exportPDF}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {company}
            </h1>
            {loading && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-xs text-blue-400 font-medium">Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {ts && (
              <span className="text-zinc-400 text-lg font-mono">{ts}</span>
            )}
            {rd?.industry && (
              <span className="text-xs text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-800">
                {rd.industry}
              </span>
            )}
            {isComplete && (
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Analyzed in {formatElapsed(elapsedTime)}
              </span>
            )}
          </div>
        </motion.div>

        <div ref={reportRef} className="space-y-8">
          {/* ── Metrics Dashboard ── */}
          <AnimatePresence>
            {(fd || nd || rkd || id) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <MetricsDashboard
                  financialScore={fd?.financialHealthScore || 0}
                  newsScore={nd?.newsSentimentScore || 0}
                  riskScore={rkd?.riskScore || 0}
                  investmentScore={id?.investmentScore || 0}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Verdict + Thesis Row ── */}
          <AnimatePresence>
            {id ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Verdict Card */}
                <motion.div variants={itemVariants} initial="hidden" animate="show" className="md:col-span-1">
                  <Card className="glass-strong h-full hover:border-white/10 transition-colors gradient-border">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full gap-4">
                      <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">
                        Verdict
                      </p>
                      <div className={`text-5xl md:text-6xl font-extrabold ${verdictColor} ${verdictGlow} verdict-pulse`}>
                        {id.recommendation}
                      </div>
                      <div className="mt-2">
                        <ConfidenceGauge
                          score={id.confidenceScore}
                          decision={id.recommendation}
                        />
                      </div>
                      {id.holdingPeriod && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {id.holdingPeriod === "SHORT_TERM" ? "Short Term (< 6mo)" :
                           id.holdingPeriod === "MEDIUM_TERM" ? "Medium Term (6-18mo)" :
                           "Long Term (18mo+)"}
                        </div>
                      )}
                      {id.targetPriceInsight && (
                        <div className="mt-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zinc-400 leading-relaxed">
                          <Target className="w-3 h-3 inline mr-1 text-cyan-400" />
                          {id.targetPriceInsight}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Thesis Card */}
                <motion.div variants={itemVariants} initial="hidden" animate="show" className="md:col-span-2">
                  <Card className="glass-strong h-full hover:border-white/10 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white text-xl flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Investment Thesis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-zinc-300 leading-relaxed text-[15px]">
                        {id.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonSection lines={4} />
                <div className="md:col-span-2">
                  <SkeletonSection lines={6} />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* ── Bull vs Bear Case ── */}
          <AnimatePresence>
            {id?.bullCase && id?.bearCase && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <BullBearCard
                  bullCase={id.bullCase}
                  bearCase={id.bearCase}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Catalysts & Timeline ── */}
          <AnimatePresence>
            {id?.catalysts && id.catalysts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Key Catalysts & Price Triggers</h3>
                </div>
                <CatalystsTimeline
                  catalysts={id.catalysts}
                  holdingPeriod={id.holdingPeriod || "MEDIUM_TERM"}
                  targetPriceInsight={id.targetPriceInsight || ""}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Research Overview ── */}
          <AnimatePresence>
            {rd ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-strong hover:border-white/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-cyan-400" />
                      Company Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {rd.overview && (
                        <div className="md:col-span-2">
                          <p className="text-zinc-300 leading-relaxed text-sm">
                            {rd.overview}
                          </p>
                        </div>
                      )}
                      {rd.leadership && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                              Leadership
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300">
                            {rd.leadership}
                          </p>
                        </div>
                      )}
                      {rd.competitors && rd.competitors.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                              Key Competitors
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {rd.competitors.map((c: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-1 rounded-full border border-zinc-700/50 text-zinc-300 bg-zinc-800/30"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <SkeletonSection lines={4} />
            )}
          </AnimatePresence>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {cd ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-strong hover:border-white/10 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white">
                        6-Month Price Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StockChart
                        data={cd}
                        ticker={ts || company}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : loading ? (
                <SkeletonSection lines={8} />
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {fd && nd && rkd && id ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-strong hover:border-white/10 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white">Health Radar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[300px]">
                      <RadarGraph
                        financial={fd.financialHealthScore}
                        news={nd.newsSentimentScore}
                        risk={rkd.riskScore}
                        investment={id.investmentScore}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <SkeletonSection lines={8} />
              )}
            </AnimatePresence>
          </div>

          {/* ── SWOT Analysis ── */}
          <AnimatePresence>
            {(rd || nd || fd || rkd) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-strong hover:border-white/10 transition-colors overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">
                      SWOT Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="swot-grid m-6 mt-0">
                      <div className="swot-cell">
                        <h4 className="text-emerald-400">
                          <TrendingUp className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul>
                          {rd?.marketPosition && <li>{rd.marketPosition}</li>}
                          {fd?.revenueGrowth && <li>Revenue Growth: {fd.revenueGrowth}</li>}
                          {rd?.competitors?.length > 0 && (
                            <li>Competes with {rd.competitors.slice(0, 2).join(", ")}</li>
                          )}
                        </ul>
                      </div>
                      <div className="swot-cell">
                        <h4 className="text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          Weaknesses
                        </h4>
                        <ul>
                          {rkd?.debtRisk && <li>{rkd.debtRisk}</li>}
                          {rkd?.businessModelRisk && <li>{rkd.businessModelRisk}</li>}
                        </ul>
                      </div>
                      <div className="swot-cell">
                        <h4 className="text-blue-400">
                          <Zap className="w-4 h-4" />
                          Opportunities
                        </h4>
                        <ul>
                          {nd?.productLaunches?.map((v: string, i: number) => (
                            <li key={i}>{v}</li>
                          ))}
                          {nd?.partnerships?.map((v: string, i: number) => (
                            <li key={`p-${i}`}>{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="swot-cell">
                        <h4 className="text-rose-400">
                          <Shield className="w-4 h-4" />
                          Threats
                        </h4>
                        <ul>
                          {rkd?.competitionRisk && <li>{rkd.competitionRisk}</li>}
                          {rkd?.regulatoryRisk && <li>{rkd.regulatoryRisk}</li>}
                          {rkd?.marketRisk && <li>{rkd.marketRisk}</li>}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Agent Insights Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financials */}
            <AnimatePresence>
              {fd ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-strong h-full hover:border-emerald-500/20 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-emerald-400 text-lg flex items-center gap-2">
                        <BarChart className="w-4 h-4" />
                        Financials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MetricRow label="Revenue" value={fd.revenue} />
                      <MetricRow label="Net Income" value={fd.netIncome} />
                      <MetricRow label="Market Cap" value={fd.marketCap} />
                      <MetricRow label="P/E Ratio" value={fd.peRatio} />
                      <MetricRow label="EPS" value={fd.eps} />
                      <MetricRow label="Growth" value={fd.revenueGrowth} />
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Health Score
                          </span>
                          <span className="text-lg font-bold text-emerald-400">
                            {fd.financialHealthScore}
                            <span className="text-xs text-zinc-500">/100</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <SkeletonSection lines={6} />
              )}
            </AnimatePresence>

            {/* News Sentiment */}
            <AnimatePresence>
              {nd ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card className="glass-strong h-full hover:border-purple-500/20 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-purple-400 text-lg">
                        News Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {nd.newsSummary}
                      </p>
                      {nd.productLaunches?.length > 0 && (
                        <div>
                          <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-2">
                            Product Launches
                          </span>
                          <ul className="list-disc pl-4 text-sm text-zinc-300 space-y-1.5">
                            {nd.productLaunches.map((v: string, i: number) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {nd.acquisitions?.length > 0 && (
                        <div>
                          <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-2">
                            Acquisitions
                          </span>
                          <ul className="list-disc pl-4 text-sm text-zinc-300 space-y-1.5">
                            {nd.acquisitions.map((v: string, i: number) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Sentiment Score
                          </span>
                          <span className="text-lg font-bold text-purple-400">
                            {nd.newsSentimentScore}
                            <span className="text-xs text-zinc-500">/100</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <SkeletonSection lines={6} />
              )}
            </AnimatePresence>

            {/* Risk Assessment */}
            <AnimatePresence>
              {rkd ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass-strong h-full hover:border-rose-500/20 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-rose-400 text-lg">
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-zinc-300">
                      <div>
                        <span className="text-rose-400/80 font-medium block mb-1">
                          Market Risk
                        </span>
                        <span className="leading-relaxed">{rkd.marketRisk}</span>
                      </div>
                      <div>
                        <span className="text-rose-400/80 font-medium block mb-1">
                          Competition
                        </span>
                        <span className="leading-relaxed">{rkd.competitionRisk}</span>
                      </div>
                      <div>
                        <span className="text-rose-400/80 font-medium block mb-1">
                          Regulatory
                        </span>
                        <span className="leading-relaxed">{rkd.regulatoryRisk}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">
                            Risk Score
                          </span>
                          <span className="text-lg font-bold text-rose-400">
                            {rkd.riskScore}
                            <span className="text-xs text-zinc-500">/100</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <SkeletonSection lines={6} />
              )}
            </AnimatePresence>
          </div>

          {/* ── Citations Footer ── */}
          {uniqueCitations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <h3 className="text-base font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Data Sources & Citations ({uniqueCitations.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueCitations.map((url, i) => {
                  let hostname = url;
                  try {
                    hostname = new URL(url).hostname;
                  } catch {
                    // keep raw url
                  }
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs glass text-zinc-400 hover:text-blue-400 hover:border-blue-500/50 px-3 py-1.5 rounded-full transition-colors truncate max-w-[280px]"
                    >
                      {hostname}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Footer ── */}
          <div className="text-center py-8 text-xs text-zinc-600">
            Generated by InvestIQ · Multi-Agent AI Research Pipeline ·{" "}
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        icon={toast.icon}
      />
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────

function MetricRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-zinc-500 block text-xs uppercase tracking-wider mb-0.5">
        {label}
      </span>
      <span className="text-white font-medium text-[15px]">{value}</span>
    </div>
  );
}

function BarChart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
