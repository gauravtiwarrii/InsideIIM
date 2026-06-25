"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  History,
  X,
  Brain,
  BarChart3,
  Newspaper,
  ShieldAlert,
  Target,
  Eye,
  Sparkles,
  Zap,
  Building2,
  ChevronRight,
  Clock,
  Shield,
  Cpu,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import WatchlistPanel from "@/components/Watchlist";

const AGENTS = [
  { icon: Brain, label: "Research", color: "text-cyan-400", desc: "Company fundamentals & market position" },
  { icon: BarChart3, label: "Financial", color: "text-emerald-400", desc: "Revenue, EPS, P/E ratio analysis" },
  { icon: Newspaper, label: "News", color: "text-purple-400", desc: "Sentiment & breaking news scan" },
  { icon: ShieldAlert, label: "Risk", color: "text-rose-400", desc: "Threat assessment & risk scoring" },
  { icon: Target, label: "Investment", color: "text-amber-400", desc: "Final verdict with bull/bear cases" },
  { icon: Eye, label: "Reviewer", color: "text-blue-400", desc: "Quality check & critique loop" },
];

const SUGGESTED_COMPANIES = [
  "Apple",
  "Tesla",
  "Nvidia",
  "Reliance Industries",
  "Microsoft",
  "Google",
];

const COMPANY_DATABASE = [
  "Apple", "Microsoft", "Google", "Alphabet", "Amazon", "Meta", "Nvidia",
  "Tesla", "Netflix", "Adobe", "Salesforce", "Intel", "AMD", "Qualcomm",
  "Oracle", "IBM", "Cisco", "Broadcom", "Texas Instruments", "Uber",
  "Airbnb", "Spotify", "Snap", "Pinterest", "Palantir", "Snowflake",
  "CrowdStrike", "Datadog", "Shopify", "Block", "PayPal", "Stripe",
  "OpenAI", "SpaceX", "Rivian", "Lucid Motors", "Zoom", "Slack",
  "Twilio", "Cloudflare", "MercadoLibre", "ServiceNow", "Workday",
  "Atlassian", "Figma", "Canva", "Discord", "Reddit",
  "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Bank of America",
  "Wells Fargo", "Citigroup", "BlackRock", "Visa", "Mastercard",
  "American Express", "Charles Schwab", "Berkshire Hathaway",
  "Johnson & Johnson", "Pfizer", "Moderna", "UnitedHealth",
  "Eli Lilly", "Novo Nordisk", "AbbVie", "Merck", "Bristol-Myers Squibb",
  "Walmart", "Costco", "Nike", "Starbucks", "McDonald's",
  "Coca-Cola", "PepsiCo", "Procter & Gamble", "Walt Disney",
  "Home Depot", "Target Corporation", "Lululemon",
  "Toyota", "Ford", "General Motors", "BMW", "Volkswagen",
  "Ferrari", "Caterpillar", "Boeing", "Lockheed Martin", "3M",
  "ExxonMobil", "Chevron", "Shell", "BP", "NextEra Energy",
  "Enphase Energy", "First Solar",
  "Reliance Industries", "Tata Consultancy Services", "Infosys",
  "HDFC Bank", "ICICI Bank", "Wipro", "HCL Technologies",
  "Bharti Airtel", "State Bank of India", "Larsen & Toubro",
  "Asian Paints", "Bajaj Finance", "Maruti Suzuki", "Titan Company",
  "Hindustan Unilever", "ITC", "Adani Enterprises", "Adani Green Energy",
  "Sun Pharma", "Tata Motors", "Tata Steel", "Mahindra & Mahindra",
  "Kotak Mahindra Bank", "Zomato", "Paytm",
  "Samsung", "TSMC", "Sony", "Nintendo", "Alibaba",
  "Tencent", "ByteDance", "BYD", "Xiaomi", "Baidu",
  "LVMH", "SAP", "ASML", "Siemens", "Unilever", "Nestlé",
  "AstraZeneca", "Roche",
];

const FEATURES = [
  {
    icon: Cpu,
    title: "6-Agent Pipeline",
    description: "Research, Financial, News, Risk, Investment & Reviewer agents work in parallel",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Shield,
    title: "Bull/Bear Analysis",
    description: "AI-generated optimistic & pessimistic scenarios with key catalysts",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Globe,
    title: "Real-Time Data",
    description: "Live stock prices, news sentiment, and financial metrics via Tavily & Yahoo",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description: "Institutional-grade research delivered in under 2 minutes with PDF export",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
];

// Animated typing text hook
function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setText(
            isDeleting
              ? currentWord.slice(0, text.length - 1)
              : currentWord.slice(0, text.length + 1)
          );
        },
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

export default function Home() {
  const [company, setCompany] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const typedWord = useTypewriter(
    ["Nvidia", "Tesla", "Reliance", "Apple", "Google", "Infosys"],
    120,
    80,
    1800
  );

  const filteredSuggestions = company.trim().length > 0
    ? COMPANY_DATABASE.filter((c) =>
        c.toLowerCase().includes(company.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const stored = localStorage.getItem("investiq_history");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        formRef.current &&
        !formRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [company]);

  const handleSearch = (companyName?: string) => {
    const target = companyName || company;
    if (!target.trim()) return;

    const updatedHistory = [
      target,
      ...recentSearches.filter((s) => s !== target),
    ].slice(0, 5);
    localStorage.setItem("investiq_history", JSON.stringify(updatedHistory));
    router.push(`/report?company=${encodeURIComponent(target)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    handleSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selected = filteredSuggestions[highlightedIndex];
      setCompany(selected);
      setShowSuggestions(false);
      handleSearch(selected);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setCompany(name);
    setShowSuggestions(false);
    handleSearch(name);
  };

  const removeHistory = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem("investiq_history", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Watchlist */}
      <WatchlistPanel onSelect={(name) => handleSearch(name)} />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Ambient Gradients */}
      <div className="fixed top-[-20%] left-[-15%] w-[50%] h-[50%] bg-emerald-500/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-blue-500/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed top-[30%] right-[10%] w-[25%] h-[25%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── Hero Section ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Floating Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl animate-float">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl animate-pulse-glow pointer-events-none" />
            </div>
          </motion.div>

          {/* Hero Text with Typing Effect */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight leading-[1.1]">
                AI-Powered{" "}
                <span className="text-gradient">Investment</span>
                <br />
                Research Platform
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed"
            >
              6 specialized AI agents analyze financials, news, risk & market position — delivering{" "}
              <span className="text-white font-medium">institutional-grade</span> research in seconds.
            </motion.p>
          </div>

          {/* Agent Network - Interactive Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                className="relative group/agent"
                onMouseEnter={() => setHoveredAgent(i)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium cursor-default transition-all duration-300 ${
                  hoveredAgent === i ? "border-white/20 bg-white/5" : ""
                }`}>
                  <agent.icon className={`w-3.5 h-3.5 ${agent.color}`} />
                  <span className="text-zinc-300">{agent.label}</span>
                </div>
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredAgent === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-48 px-3 py-2 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-xl pointer-events-none"
                    >
                      <p className="text-[11px] text-zinc-400 leading-relaxed text-center">
                        {agent.desc}
                      </p>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900/95 border-l border-t border-white/10 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-500" />
            <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <Search className="w-6 h-6 text-zinc-400 ml-4 flex-shrink-0" />
              <Input
                ref={inputRef}
                id="company-search-input"
                value={company}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => company.trim() && setShowSuggestions(true)}
                placeholder={`Try "${typedWord}"...`}
                className="flex-1 bg-transparent border-0 text-lg focus-visible:ring-0 text-white placeholder:text-zinc-500 px-4 h-14"
                autoComplete="off"
              />
              <div className="hidden sm:flex items-center mr-2 text-zinc-600 text-xs">
                <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800/50 font-mono">
                  ⏎
                </kbd>
              </div>
              <Button
                id="analyze-button"
                type="submit"
                disabled={!company.trim()}
                className="h-12 px-8 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold transition-all disabled:opacity-30"
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 right-0 mt-2 z-50"
                >
                  <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                        Suggestions
                      </span>
                    </div>
                    <div className="py-1 max-h-[320px] overflow-y-auto">
                      {filteredSuggestions.map((name, idx) => {
                        const matchIndex = name.toLowerCase().indexOf(company.toLowerCase());
                        const beforeMatch = name.slice(0, matchIndex);
                        const matchText = name.slice(matchIndex, matchIndex + company.length);
                        const afterMatch = name.slice(matchIndex + company.length);
                        return (
                          <button
                            key={name}
                            type="button"
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                              highlightedIndex === idx
                                ? "bg-emerald-500/10 text-white"
                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSuggestion(name);
                            }}
                          >
                            <Building2 className={`w-4 h-4 flex-shrink-0 ${
                              highlightedIndex === idx ? "text-emerald-400" : "text-zinc-500"
                            }`} />
                            <span className="text-sm font-medium truncate">
                              {beforeMatch}
                              <span className="text-emerald-400 font-semibold">{matchText}</span>
                              {afterMatch}
                            </span>
                            {highlightedIndex === idx && (
                              <kbd className="ml-auto text-[10px] text-zinc-500 border border-zinc-700 rounded px-1 py-0.5 font-mono">
                                ⏎
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Suggested / Recent Companies */}
          {recentSearches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8"
            >
              <p className="text-xs text-zinc-500 text-center mb-3 uppercase tracking-wider font-medium">
                Popular Companies
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_COMPANIES.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSearch(name)}
                    className="group/chip px-4 py-2 rounded-full glass text-sm text-zinc-300 hover:text-white hover:border-emerald-500/40 transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                  >
                    {name}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/chip:opacity-100 group-hover/chip:translate-x-0 transition-all text-emerald-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <History className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">
                  Recent Reports
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    className="group/item relative flex items-center gap-2 glass rounded-full px-4 py-2 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer"
                    onClick={() => handleSearch(search)}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-zinc-300">{search}</span>
                    <button
                      onClick={(e) => removeHistory(search, e)}
                      className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
                    >
                      <X className="w-3 h-3 text-zinc-500" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-zinc-600 cursor-pointer"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="text-[10px] uppercase tracking-widest">Explore Features</span>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Why InvestIQ is{" "}
            <span className="text-gradient">Different</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Built with cutting-edge AI orchestration, delivering analysis that rivals top Wall Street desks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="group relative"
            >
              <div className="relative p-6 rounded-2xl glass hover:border-white/15 transition-all duration-500 h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            How It{" "}
            <span className="text-gradient-blue">Works</span>
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            From search to full report in three steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter a Company", desc: "Type any public company — from FAANG to Indian blue chips", icon: Search },
              { step: "02", title: "Agents Analyze", desc: "6 AI agents simultaneously research, score, and critique", icon: Cpu },
              { step: "03", title: "Get Your Report", desc: "Receive a comprehensive report with verdict, charts & catalysts", icon: Target },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 24 }}
                className="relative text-center"
              >
                <div className="relative z-10 mb-5 mx-auto w-16 h-16 rounded-2xl glass-strong flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">
                  Step {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="relative inline-block mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center backdrop-blur-xl">
              <Zap className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 rounded-[28px] blur-2xl animate-pulse-glow pointer-events-none" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to analyze?
          </h2>
          <p className="text-zinc-400 mb-8">
            Start your first AI-powered investment report now.
          </p>
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => inputRef.current?.focus(), 500);
            }}
            className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-base transition-all shadow-xl shadow-white/10"
          >
            <Search className="w-5 h-5 mr-2" />
            Start Analyzing
          </Button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] text-zinc-600 mb-4 uppercase tracking-widest">
            Powered by
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {["LangGraph", "NVIDIA NIM", "Tavily", "Next.js", "Yahoo Finance"].map(
              (tech) => (
                <span
                  key={tech}
                  className="text-[11px] text-zinc-500 px-2.5 py-1 rounded-md border border-zinc-800/60 bg-zinc-900/30"
                >
                  {tech}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-zinc-700">
            InvestIQ — Multi-Agent AI Investment Research · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
