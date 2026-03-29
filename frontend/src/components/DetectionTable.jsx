"use client";

import { motion } from "framer-motion";

const BOX_COLORS = [
  "#76B900", "#00E5FF", "#FF6B6B", "#FFD93D",
  "#C084FC", "#FB923C", "#22D3EE", "#F472B6",
];

function getConfidenceLabel(score) {
  if (score >= 0.9) return { text: "Excellent", cls: "bg-neon-green/10 text-neon-green" };
  if (score >= 0.8) return { text: "High", cls: "bg-neon-green/10 text-neon-green" };
  if (score >= 0.7) return { text: "Good", cls: "bg-yellow-500/10 text-yellow-400" };
  return { text: "Low", cls: "bg-orange-500/10 text-orange-400" };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function DetectionTable({ detections }) {
  if (!detections || detections.length === 0) return null;

  // Group by label for summary
  const labelCounts = {};
  detections.forEach((d) => {
    labelCounts[d.label] = (labelCounts[d.label] || 0) + 1;
  });
  const uniqueLabels = Object.keys(labelCounts).length;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full"
      id="detection-table"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#76B900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <div>
            <h3
              className="text-sm font-semibold text-ghost-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Detection Results
            </h3>
            <p className="text-xs text-muted mt-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {detections.length} object{detections.length !== 1 ? "s" : ""} · {uniqueLabels} categor{uniqueLabels !== 1 ? "ies" : "y"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary pills */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-4">
        {Object.entries(labelCounts).map(([label, count]) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs"
          >
            <span className="text-ghost-white font-medium capitalize">{label}</span>
            <span className="text-muted" style={{ fontFamily: "var(--font-mono)" }}>×{count}</span>
          </div>
        ))}
      </motion.div>

      {/* Minimalist detection rows */}
      <div className="space-y-1">
        {detections.map((det, i) => {
          const color = BOX_COLORS[i % BOX_COLORS.length];
          const percentage = (det.score * 100).toFixed(1);
          const level = getConfidenceLabel(det.score);

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 cursor-default"
              id={`detection-row-${i}`}
            >
              {/* Color dot */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
              />

              {/* Label */}
              <span className="flex-1 text-sm font-medium text-ghost-white capitalize truncate">
                {det.label}
              </span>

              {/* Confidence badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${level.cls}`}>
                {level.text}
              </span>

              {/* Score */}
              <span
                className="text-sm font-semibold text-ghost-white tabular-nums w-16 text-right"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {percentage}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
