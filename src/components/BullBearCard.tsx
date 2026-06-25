"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface BullBearCardProps {
  bullCase: string[];
  bearCase: string[];
}

export default function BullBearCard({ bullCase, bearCase }: BullBearCardProps) {
  if ((!bullCase || bullCase.length === 0) && (!bearCase || bearCase.length === 0)) {
    return null;
  }

  return (
    <div className="bull-bear-container">
      {/* Bull Case */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
        className="bull-bear-column bull-column"
      >
        <div className="bull-bear-header">
          <div className="bull-bear-icon bull-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="bull-bear-title">Bull Case</h4>
            <p className="bull-bear-subtitle">Why it could outperform</p>
          </div>
        </div>
        <ul className="bull-bear-list">
          {bullCase?.map((reason, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bull-bear-item"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Divider */}
      <div className="bull-bear-divider" />

      {/* Bear Case */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 24 }}
        className="bull-bear-column bear-column"
      >
        <div className="bull-bear-header">
          <div className="bull-bear-icon bear-icon">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="bull-bear-title">Bear Case</h4>
            <p className="bull-bear-subtitle">Why it could underperform</p>
          </div>
        </div>
        <ul className="bull-bear-list">
          {bearCase?.map((reason, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              className="bull-bear-item"
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
