"use client";

import { useState, useEffect } from "react";
import type { InvestmentDecision } from "@/lib/types";

interface HistoryEntry {
  companyName: string;
  decision: "INVEST" | "HOLD" | "PASS";
  confidenceScore: number;
  timestamp: number;
}

interface HistoryPanelProps {
  onSelect: (companyName: string) => void;
}

const STORAGE_KEY = "investment-agent-history";

export function addToHistory(companyName: string, decision: InvestmentDecision) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];

    // Remove existing entry for same company
    const filtered = history.filter(
      (h) => h.companyName.toLowerCase() !== companyName.toLowerCase()
    );

    filtered.unshift({
      companyName,
      decision: decision.decision,
      confidenceScore: decision.confidenceScore,
      timestamp: Date.now(),
    });

    // Keep only last 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch {
    // Ignore storage errors
  }
}

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
};

export default function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // Ignore
    }

    // Listen for storage changes
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {
        // Ignore
      }
    };

    window.addEventListener("storage", handleStorage);
    // Also poll for changes from same tab
    const interval = setInterval(handleStorage, 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (history.length === 0) return null;


  return (
    <>
      <button
        className="history-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Search History"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="history-count">{history.length}</span>
      </button>

      {isOpen && (
        <div className="history-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="history-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-header">
              <h3>Recent Analyses</h3>
              <button
                className="history-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-list">
              {history.map((entry, i) => (
                <button
                  key={i}
                  className="history-item"
                  onClick={() => {
                    onSelect(entry.companyName);
                    setIsOpen(false);
                  }}
                >
                  <div className="history-item-left">
                    <span
                      className={`history-badge ${entry.decision.toLowerCase()}`}
                    >
                      {entry.decision === "INVEST" ? "📈" : entry.decision === "HOLD" ? "⏸️" : "📉"}
                    </span>
                    <div>
                      <div className="history-company">{entry.companyName}</div>
                      <div className="history-meta">
                        {entry.confidenceScore}% confidence · {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                  <span className="history-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
