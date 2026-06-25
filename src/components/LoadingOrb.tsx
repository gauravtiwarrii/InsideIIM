"use client";

import { useEffect, useRef, useState } from "react";

interface LoadingOrbProps {
  currentStep: string;
  steps: { message: string; done: boolean }[];
}

export default function LoadingOrb({ currentStep, steps }: LoadingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      frame++;

      // Outer rotating rings
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = 55 + ring * 16;
        const rotationSpeed = (ring % 2 === 0 ? 1 : -1) * (0.005 + ring * 0.003);
        const angle = frame * rotationSpeed;
        const dashCount = 8 + ring * 4;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        for (let i = 0; i < dashCount; i++) {
          const dashAngle = (i / dashCount) * Math.PI * 2;
          const dashLength = 0.15 - ring * 0.03;
          const opacity = 0.15 + Math.sin(frame * 0.03 + i) * 0.1;

          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, dashAngle, dashAngle + dashLength);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Core orb with gradient
      const pulseScale = 1 + Math.sin(frame * 0.04) * 0.08;
      const orbRadius = 28 * pulseScale;

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.6)");
      gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.3)");
      gradient.addColorStop(1, "rgba(217, 70, 239, 0.05)");

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
      innerGlow.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      innerGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Orbiting particles
      for (let i = 0; i < 6; i++) {
        const orbitAngle = frame * 0.02 + (i * Math.PI * 2) / 6;
        const orbitRadius = 42 + Math.sin(frame * 0.01 + i * 2) * 5;
        const px = cx + Math.cos(orbitAngle) * orbitRadius;
        const py = cy + Math.sin(orbitAngle) * orbitRadius;
        const pSize = 2.5 + Math.sin(frame * 0.05 + i) * 1;

        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "rgba(6, 182, 212, 0.6)" : "rgba(217, 70, 239, 0.6)";
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="loading-orb-container">
      <canvas ref={canvasRef} className="loading-orb-canvas" />
      <div className="loading-orb-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`orb-step ${step.done ? "done" : "active"}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`orb-step-dot ${step.done ? "done" : "active"}`}>
              {step.done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <div className="orb-step-spinner" />
              )}
            </div>
            <span className={step.done ? "orb-step-text done" : "orb-step-text active"}>
              {step.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
