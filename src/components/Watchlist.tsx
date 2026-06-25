"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, X, TrendingUp, Clock, Trash2 } from "lucide-react";

interface WatchlistEntry {
  companyName: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  investmentScore: number;
  analyzedAt: number;
}

const WATCHLIST_KEY = "investiq_watchlist";

export function addToWatchlist(
  companyName: string,
  recommendation: "INVEST" | "HOLD" | "PASS",
  investmentScore: number
) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const list: WatchlistEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (e) => e.companyName.toLowerCase() !== companyName.toLowerCase()
    );
    filtered.unshift({
      companyName,
      recommendation,
      investmentScore,
      analyzedAt: Date.now(),
    });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered.slice(0, 30)));
  } catch {
    // Ignore
  }
}

export function removeFromWatchlist(companyName: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const list: WatchlistEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (e) => e.companyName.toLowerCase() !== companyName.toLowerCase()
    );
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}

export function isInWatchlist(companyName: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const list: WatchlistEntry[] = raw ? JSON.parse(raw) : [];
    return list.some(
      (e) => e.companyName.toLowerCase() === companyName.toLowerCase()
    );
  } catch {
    return false;
  }
}

// Watchlist toggle button for the report page nav
export function WatchlistToggle({
  companyName,
  recommendation,
  investmentScore,
}: {
  companyName: string;
  recommendation: "INVEST" | "HOLD" | "PASS";
  investmentScore: number;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(isInWatchlist(companyName));
  }, [companyName]);

  const toggle = () => {
    if (saved) {
      removeFromWatchlist(companyName);
      setSaved(false);
    } else {
      addToWatchlist(companyName, recommendation, investmentScore);
      setSaved(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        saved
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          : "bg-zinc-800/50 text-zinc-400 border border-white/10 hover:bg-zinc-700/50 hover:text-white"
      }`}
      title={saved ? "Remove from Watchlist" : "Add to Watchlist"}
    >
      {saved ? (
        <BookmarkCheck className="w-3.5 h-3.5" />
      ) : (
        <Bookmark className="w-3.5 h-3.5" />
      )}
      {saved ? "Saved" : "Watch"}
    </button>
  );
}

// Moved outside component to prevent react-hooks/purity warnings
const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
};

// Full watchlist panel for the home page
export default function WatchlistPanel({
  onSelect,
}: {
  onSelect: (companyName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);

  const loadEntries = () => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadEntries();
    const interval = setInterval(loadEntries, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(name);
    loadEntries();
  };



  const getVerdictEmoji = (rec: string) => {
    switch (rec) {
      case "INVEST": return "📈";
      case "HOLD": return "⏸️";
      case "PASS": return "📉";
      default: return "📊";
    }
  };

  const getVerdictColor = (rec: string) => {
    switch (rec) {
      case "INVEST": return "text-emerald-400";
      case "HOLD": return "text-amber-400";
      case "PASS": return "text-rose-400";
      default: return "text-zinc-400";
    }
  };

  if (entries.length === 0) return null;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl glass-strong text-sm font-medium text-amber-400 hover:text-amber-300 hover:border-amber-500/30 transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        <BookmarkCheck className="w-4 h-4" />
        <span className="hidden sm:inline">Watchlist</span>
        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
          {entries.length}
        </span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <BookmarkCheck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Watchlist</h2>
                  <span className="text-xs text-zinc-500">
                    {entries.length} companies
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto max-h-[calc(100vh-80px)] p-3 space-y-2">
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.companyName}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full text-left p-4 rounded-xl glass hover:border-amber-500/20 transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      onSelect(entry.companyName);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getVerdictEmoji(entry.recommendation)}
                        </span>
                        <span className="font-semibold text-white text-sm">
                          {entry.companyName}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleRemove(entry.companyName, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`font-bold ${getVerdictColor(entry.recommendation)}`}>
                        {entry.recommendation}
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400">
                        Score: {entry.investmentScore}/100
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.analyzedAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
