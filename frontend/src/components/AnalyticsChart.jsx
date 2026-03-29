"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const BAR_COLORS = [
  "#76B900", "#00E5FF", "#FF6B6B", "#FFD93D",
  "#C084FC", "#FB923C", "#22D3EE", "#F472B6",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "13px",
          fontWeight: 600,
          color: "#E4E4E7",
          textTransform: "capitalize",
          marginBottom: "4px",
        }}
      >
        {data.label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: data.color,
          fontWeight: 600,
        }}
      >
        {data.confidence.toFixed(1)}% confidence
      </p>
    </div>
  );
}

export default function AnalyticsChart({ detections }) {
  const chartData = useMemo(() => {
    if (!detections?.length) return [];
    return detections.map((det, i) => ({
      label: det.label,
      confidence: +(det.score * 100).toFixed(1),
      color: BAR_COLORS[i % BAR_COLORS.length],
    }));
  }, [detections]);

  if (!chartData.length) return null;

  const chartHeight = Math.max(180, chartData.length * 48 + 40);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-5 glass-subtle"
      id="analytics-chart"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div>
          <h3
            className="text-sm font-semibold text-ghost-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Confidence Analytics
          </h3>
          <p
            className="text-xs text-muted mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            score distribution
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#71717A",
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{
                fill: "#E4E4E7",
                fontSize: 11,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <Bar
              dataKey="confidence"
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
