"use client";

import { useEffect, useState } from "react";

interface ConfidenceGaugeProps {
  score: number;
  decision: "INVEST" | "HOLD" | "PASS";
}

export default function ConfidenceGauge({ score, decision }: ConfidenceGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(283);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    // Animate the number
    const duration = 1500;
    const startTime = Date.now();

    const animateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      setDashOffset(circumference - eased * (score / 100) * circumference);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateNumber);
    }, 300);

    return () => clearTimeout(timer);
  }, [score, circumference]);

  const isInvest = decision === "INVEST";
  const isHold = decision === "HOLD";
  const mainColor = isInvest ? "#10b981" : isHold ? "#eab308" : "#f43f5e";
  const glowColor = isInvest ? "rgba(16, 185, 129, 0.3)" : isHold ? "rgba(234, 179, 8, 0.3)" : "rgba(244, 63, 94, 0.3)";
  const bgGlow = isInvest ? "rgba(16, 185, 129, 0.08)" : isHold ? "rgba(234, 179, 8, 0.08)" : "rgba(244, 63, 94, 0.08)";

  const getLabel = () => {
    if (score >= 80) return "Very High";
    if (score >= 70) return "High";
    if (score >= 60) return "Moderate";
    if (score >= 50) return "Low";
    return "Very Low";
  };

  return (
    <div className="gauge-container">
      <div className="gauge-ring" style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Animated progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={mainColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
          {/* Center glow */}
          <circle cx="60" cy="60" r="34" fill={bgGlow} />
          {/* Score text */}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            fill={mainColor}
            fontSize="24"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
          >
            {animatedScore}
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontWeight="500"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.05em"
          >
            {getLabel()}
          </text>
        </svg>
      </div>
      <div className="gauge-label">Confidence</div>
    </div>
  );
}
