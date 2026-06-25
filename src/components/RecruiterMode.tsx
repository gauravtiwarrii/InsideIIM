"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Code2, Rocket, BrainCircuit, X, Briefcase, Zap, CheckCircle2 } from "lucide-react";

const LOADING_STEPS = [
  "Initializing candidate analysis...",
  "Scanning GitHub repositories...",
  "Evaluating UI/UX proficiency...",
  "Analyzing AI integration capabilities...",
  "Measuring execution speed...",
  "Finalizing investment thesis..."
];

export default function RecruiterMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (isOpen && !showReport) {
      const interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= LOADING_STEPS.length - 1) {
            clearInterval(interval);
            setTimeout(() => setShowReport(true), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isOpen, showReport]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setStepIndex(0); setShowReport(false); }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-3 rounded-full font-semibold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-shadow group"
      >
        <Briefcase className="w-5 h-5 group-hover:animate-bounce" />
        <span>InsideIIM Recruiter?</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => setShowReport(false), 300);
                }}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                {!showReport ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse-glow" />
                      <div className="w-20 h-20 bg-zinc-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center relative z-10">
                        <BrainCircuit className="w-10 h-10 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-display text-white mb-6">Running AI Candidate Analysis</h3>
                    <div className="space-y-3 w-full max-w-md text-left">
                      {LOADING_STEPS.slice(0, stepIndex + 1).map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 px-4 py-3 rounded-lg border border-white/5"
                        >
                          {i === stepIndex ? (
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className="font-mono">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-10">
                      <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-2">Gaurav Tiwari</h2>
                      <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
                        <Code2 className="w-5 h-5 text-cyan-400" />
                        AI Engineer Intern Candidate
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Verdict Card */}
                      <div className="md:col-span-1 glass-strong rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-emerald-500/30">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-2xl animate-pulse-glow" />
                        <p className="text-zinc-400 font-medium uppercase tracking-[0.2em] text-[11px] relative z-10 mb-4">
                          Final Verdict
                        </p>
                        <div className="text-5xl font-display font-extrabold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] relative z-10 mb-2">
                          STRONG HIRE
                        </div>
                        <div className="flex items-baseline gap-1 relative z-10">
                          <span className="text-4xl font-bold text-white">99.9</span>
                          <span className="text-zinc-500 text-sm">/ 100</span>
                        </div>
                      </div>

                      {/* Thesis */}
                      <div className="md:col-span-2 glass-strong rounded-xl p-8 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-400" />
                          Investment Thesis
                        </h3>
                        <p className="text-zinc-300 leading-relaxed text-[15px]">
                          Gaurav presents an exceptional asymmetrical risk-to-reward ratio for the InsideIIM engineering team as an AI Engineer Intern. He demonstrates a rare combination of building complex Agentic AI architectures (LangChain/LLMs), strong prompt engineering, and the ability to weave these models into highly interactive, production-ready frontend experiences.
                          <br /><br />
                          Unlike standard candidates, Gaurav builds with a product-owner mindset, prioritizing highly engaging user experiences, handling edge-cases like AI rate-limiting, and writing highly modular code. Initiating a STRONG HIRE position is highly recommended before market competitors acquire this asset.
                        </p>
                      </div>
                    </div>

                    {/* Bull Case */}
                    <div className="glass-strong rounded-xl p-8 border border-white/10">
                      <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        The Bull Case
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Extreme execution speed and adaptability.",
                          "Pixel-perfect UI/UX design capabilities.",
                          "Deep experience with Next.js, React, and TypeScript.",
                          "Builds highly resilient systems (graceful fallbacks).",
                          "Understands LLMs and AI Agent architectures.",
                          "Strong eye for aesthetics and micro-interactions."
                        ].map((point, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-zinc-200 leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
