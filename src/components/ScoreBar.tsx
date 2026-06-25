"use client";

import { useEffect, useState } from "react";

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  color?: string;
  height?: number;
  delay?: number;
}

export default function ScoreBar({
  score,
  maxScore = 100,
  color = "#10b981",
  height = 6,
  delay = 0,
}: ScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((score / maxScore) * 100);
    }, delay + 100);
    return () => clearTimeout(timer);
  }, [score, maxScore, delay]);

  return (
    <div
      className="score-bar-track"
      style={{ height: `${height}px` }}
    >
      <div
        className="score-bar-fill"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          height: "100%",
          borderRadius: "inherit",
          transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </div>
  );
}
