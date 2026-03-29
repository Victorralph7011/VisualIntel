"use client";

import { motion } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      id="loading-overlay"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" />

      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Scanning line */}
      <div className="absolute left-0 right-0 h-[2px] animate-scan-line z-10">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-neon-green to-transparent" />
        <div className="w-full h-8 bg-gradient-to-b from-neon-green/20 to-transparent -mt-1" />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-2 border-white/[0.06] animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_12px_rgba(118,185,0,0.6)]" />
          </div>
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-full border border-neon-green/20 animate-pulse" />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neon-green/60 animate-pulse-glow" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p
            className="text-base font-semibold text-ghost-white tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Analyzing Image
          </p>
          <div className="flex items-center gap-2 mt-2 justify-center">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Running DETR inference
            </p>
          </div>
        </div>

        {/* Progress steps */}
        <div
          className="flex flex-col gap-2 text-xs text-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#76B900" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            <span className="text-neon-green/80">Image preprocessed</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full border border-neon-green/40 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-neon-green animate-pulse" />
            </div>
            <span>Running object detection...</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 0.4, x: 0 }}
            transition={{ delay: 1.4 }}
            className="flex items-center gap-2"
          >
            <div className="w-3 h-3 rounded-full border border-white/10" />
            <span>Post-processing results</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
