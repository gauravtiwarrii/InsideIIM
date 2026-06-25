"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Newspaper,
  ShieldAlert,
  Target,
} from "lucide-react";

interface MetricsDashboardProps {
  financialScore: number;
  newsScore: number;
  riskScore: number;
  investmentScore: number;
}

const metrics = [
  {
    key: "financial",
    label: "Financial Health",
    icon: Activity,
    color: "#10b981",
    bgGlow: "rgba(16, 185, 129, 0.08)",
  },
  {
    key: "news",
    label: "News Sentiment",
    icon: Newspaper,
    color: "#a855f7",
    bgGlow: "rgba(168, 85, 247, 0.08)",
  },
  {
    key: "risk",
    label: "Risk Profile",
    icon: ShieldAlert,
    color: "#f43f5e",
    bgGlow: "rgba(244, 63, 94, 0.08)",
  },
  {
    key: "investment",
    label: "Investment Score",
    icon: Target,
    color: "#3b82f6",
    bgGlow: "rgba(59, 130, 246, 0.08)",
  },
];

function AnimatedRing({
  score,
  color,
  size = 64,
  strokeWidth = 5,
  delay = 0,
}: {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setAnimatedScore(Math.round(eased * score));
        setDashOffset(circumference - eased * (score / 100) * circumference);

        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [score, circumference, delay]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-base font-bold"
          style={{ color }}
        >
          {animatedScore}
        </span>
      </div>
    </div>
  );
}

export default function MetricsDashboard({
  financialScore,
  newsScore,
  riskScore,
  investmentScore,
}: MetricsDashboardProps) {
  const scores = [financialScore, newsScore, riskScore, investmentScore];

  return (
    <div className="metrics-dashboard">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + idx * 0.1, type: "spring", stiffness: 300, damping: 24 }}
          className="metric-card"
          style={{ background: metric.bgGlow }}
        >
          <AnimatedRing
            score={scores[idx]}
            color={metric.color}
            delay={200 + idx * 150}
          />
          <div className="metric-info">
            <div className="metric-label">
              <metric.icon
                className="w-3.5 h-3.5"
                style={{ color: metric.color }}
              />
              <span>{metric.label}</span>
            </div>
            <div className="metric-bar-track">
              <motion.div
                className="metric-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${scores[idx]}%` }}
                transition={{ delay: 0.4 + idx * 0.15, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ background: `linear-gradient(90deg, ${metric.color}66, ${metric.color})` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
