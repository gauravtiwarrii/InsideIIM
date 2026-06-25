import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RadarGraph({ financial, news, risk, investment }: any) {
  const data = [
    { subject: "Financial Health", A: financial, fullMark: 100 },
    { subject: "News Sentiment", A: news, fullMark: 100 },
    { subject: "Risk Profile", A: risk, fullMark: 100 },
    { subject: "Investment Score", A: investment, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "rgba(15, 20, 25, 0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          itemStyle={{ color: "#fff" }}
        />
        <Radar
          name="Company Health"
          dataKey="A"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="#3b82f6"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
