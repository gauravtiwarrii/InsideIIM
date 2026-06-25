"use client";

import { motion } from "framer-motion";
import { Zap, Calendar, Rocket, Scale, DollarSign, Globe } from "lucide-react";

interface CatalystsTimelineProps {
  catalysts: string[];
  holdingPeriod: string;
  targetPriceInsight: string;
}

const catalystIcons = [Rocket, Calendar, Scale, DollarSign, Globe, Zap];

function getHoldingLabel(period: string) {
  switch (period) {
    case "SHORT_TERM":
      return { label: "Short Term", detail: "< 6 months", color: "#f59e0b" };
    case "MEDIUM_TERM":
      return { label: "Medium Term", detail: "6–18 months", color: "#3b82f6" };
    case "LONG_TERM":
      return { label: "Long Term", detail: "18+ months", color: "#10b981" };
    default:
      return { label: period, detail: "", color: "#94a3b8" };
  }
}

export default function CatalystsTimeline({
  catalysts,
  holdingPeriod,
  targetPriceInsight,
}: CatalystsTimelineProps) {
  if (!catalysts || catalysts.length === 0) return null;

  const holding = getHoldingLabel(holdingPeriod);

  return (
    <div className="catalysts-container">
      {/* Header with holding period and target price */}
      <div className="catalysts-meta">
        <div className="catalyst-meta-item">
          <span className="catalyst-meta-label">Holding Period</span>
          <span
            className="catalyst-meta-value"
            style={{ color: holding.color }}
          >
            {holding.label}
            <span className="catalyst-meta-detail">{holding.detail}</span>
          </span>
        </div>
        {targetPriceInsight && (
          <div className="catalyst-meta-item">
            <span className="catalyst-meta-label">Fair Value Insight</span>
            <span className="catalyst-meta-value text-cyan-400">
              {targetPriceInsight}
            </span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="catalysts-timeline">
        {catalysts.map((catalyst, i) => {
          const Icon = catalystIcons[i % catalystIcons.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="catalyst-item"
            >
              <div className="catalyst-line-container">
                <div className="catalyst-dot" />
                {i < catalysts.length - 1 && <div className="catalyst-line" />}
              </div>
              <div className="catalyst-content">
                <div className="catalyst-icon-badge">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <p className="catalyst-text">{catalyst}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
