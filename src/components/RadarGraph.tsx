import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RadarGraph({ financial, news, risk, investment }: { financial: number; news: number; risk: number; investment: number }) {
  const data = [
    { subject: "Financial Health", A: financial, fullMark: 100 },
    { subject: "News Sentiment", A: news, fullMark: 100 },
    { subject: "Risk Profile", A: risk, fullMark: 100 },
    { subject: "Investment Score", A: investment, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "var(--font-outfit)" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(15, 20, 25, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", backdropFilter: "blur(12px)" }}
          itemStyle={{ color: "#fff", fontFamily: "var(--font-inter)" }}
        />
        <Radar
          name="Company Health"
          dataKey="A"
          stroke="#34d399"
          strokeWidth={3}
          fill="url(#radarGradient)"
          fillOpacity={0.6}
          isAnimationActive={true}
          animationDuration={1500}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
