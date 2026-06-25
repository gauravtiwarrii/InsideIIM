import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line
} from "recharts";

interface StockChartProps {
  data: { date: string; price: number }[];
  ticker: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
        <p className="text-zinc-400 text-xs font-medium mb-1 font-mono">{label}</p>
        <p className="font-bold text-lg" style={{ color: payload[0].color }}>
          ${Number(payload[0].value).toFixed(2)}
        </p>
        {payload[1] && (
          <p className="text-xs mt-1 font-medium" style={{ color: payload[1].color }}>
            SMA20: ${Number(payload[1].value).toFixed(2)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function StockChart({ data, ticker }: StockChartProps) {
  if (!data || data.length === 0) return null;

  // Calculate SMA20
  const processedData = data.map((item, index) => {
    let sma20 = null;
    if (index >= 19) {
      const window = data.slice(index - 19, index + 1);
      const sum = window.reduce((acc, curr) => acc + curr.price, 0);
      sma20 = sum / 20;
    }
    return { ...item, sma20 };
  });

  // Calculate percentage change to decide color
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isPositive = lastPrice >= firstPrice;
  const changePercent = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
  
  const strokeColor = isPositive ? "#10b981" : "#ef4444"; // emerald-500 or red-500
  const fillColor = isPositive ? "url(#colorPositive)" : "url(#colorNegative)";

  return (
    <div className="stock-chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <span className="ticker-badge">{ticker}</span>
          <span>6-Month Trend & SMA20</span>
        </div>
        <div className={`chart-change ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "↑" : "↓"} {Math.abs(Number(changePercent))}%
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={processedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={3}
              fill={fillColor}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
