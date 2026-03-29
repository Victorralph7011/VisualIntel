"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import ImageCanvas from "@/components/ImageCanvas";
import DetectionTable from "@/components/DetectionTable";
import LoadingOverlay from "@/components/LoadingOverlay";
import CyberBackground from "@/components/CyberBackground";
import { detectFromFile, detectFromURL } from "@/lib/api";

// ── Motion variants ──
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Home() {
  // ── State ──
  const [imageSrc, setImageSrc] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [fileName, setFileName] = useState("");

  // ── Handlers ──
  const handleReset = useCallback(() => {
    setImageSrc(null);
    setResults(null);
    setError(null);
    setFileName("");
  }, []);

  const handleFileSelect = useCallback(
    async (file) => {
      setError(null);
      setResults(null);
      setFileName(file.name);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);

      // Detect
      setLoading(true);
      try {
        const data = await detectFromFile(file, threshold);
        setResults(data);
      } catch (err) {
        setError(err.message || "Detection failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [threshold]
  );

  const handleUrlSubmit = useCallback(
    async (url) => {
      setError(null);
      setResults(null);
      setFileName("");

      setImageSrc(url);

      setLoading(true);
      try {
        const data = await detectFromURL(url, threshold);
        setResults(data);
      } catch (err) {
        setError(err.message || "Detection failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [threshold]
  );

  const hasResults = results && results.detections && results.detections.length > 0;

  return (
    <>
      <Header />

      {/* Cybernetic data-lab background */}
      <CyberBackground />

      <main className="relative z-10 flex-1 pt-20 pb-16" id="main-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ── Hero Section ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mt-8 mb-14"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/5 border border-neon-green/15 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span
                className="text-xs font-medium text-neon-green"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Powered by DETR · ResNet-50
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-ghost-white">AI Object </span>
              <span className="bg-gradient-to-r from-neon-green to-cyber-cyan bg-clip-text text-transparent">
                Detection
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Upload any image and our AI will instantly identify and locate every object
              with precise bounding boxes and confidence scores.
            </motion.p>
          </motion.div>

          {/* ── Upload + Results Layout ── */}
          <AnimatePresence mode="wait">
            {!imageSrc ? (
              // ══════════════════════════════════════
              // UPLOAD STATE — centered, prominent
              // ══════════════════════════════════════
              <motion.div
                key="upload-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Upload zone — centered */}
                <div className="max-w-2xl mx-auto">
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    onUrlSubmit={handleUrlSubmit}
                    isLoading={loading}
                  />
                </div>

                {/* Feature cards — 3-column grid */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
                >
                  {[
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#76B900" strokeWidth="1.5">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      ),
                      title: "Real-time Analysis",
                      desc: "Get instant results with DETR transformer model running advanced detection.",
                      accent: "#76B900",
                    },
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      ),
                      title: "Precise Bounding Boxes",
                      desc: "Pixel-accurate object localization with color-coded visual overlays.",
                      accent: "#00E5FF",
                    },
                    {
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      ),
                      title: "Drag & Drop",
                      desc: "Simply drag an image or paste a URL. Support for JPG, PNG, and WebP.",
                      accent: "#C084FC",
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={fadeInUp}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="rounded-2xl p-6 glass-card cursor-default group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: `${feature.accent}10`, border: `1px solid ${feature.accent}20` }}
                      >
                        {feature.icon}
                      </div>
                      <h3
                        className="text-sm font-semibold text-ghost-white mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed">
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              // ══════════════════════════════════════
              // RESULTS STATE — 12-column grid
              // ══════════════════════════════════════
              <motion.div
                key="results-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Controls bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="btn-secondary text-sm"
                      id="reset-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1,4 1,10 7,10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                      </svg>
                      New Analysis
                    </button>
                    {fileName && (
                      <span
                        className="text-xs text-muted px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] truncate max-w-[200px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {fileName}
                      </span>
                    )}
                  </div>

                  {/* Threshold slider */}
                  <div className="flex items-center gap-3">
                    <label
                      className="text-xs text-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Threshold
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-28"
                      id="threshold-slider"
                    />
                    <span
                      className="text-xs font-semibold text-neon-green w-10 text-right tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {(threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>

                {/* ── Main results: 12-column grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Image (span 8) */}
                  <div className="lg:col-span-8 relative">
                    <ImageCanvas
                      imageSrc={imageSrc}
                      detections={results?.detections}
                      imageWidth={results?.image_width}
                      imageHeight={results?.image_height}
                      isLoading={loading}
                    />

                    {/* Loading overlay on top of image */}
                    <AnimatePresence>
                      {loading && <LoadingOverlay />}
                    </AnimatePresence>
                  </div>

                  {/* Right: Dashboard (span 4) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Skeleton loading */}
                    {loading && !hasResults && (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-4 glass-subtle"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-sm animate-shimmer" />
                              <div className="flex-1 h-4 rounded animate-shimmer" />
                              <div className="w-12 h-4 rounded animate-shimmer" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detection table */}
                    {hasResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="rounded-2xl p-5 glass-subtle"
                      >
                        <DetectionTable detections={results.detections} />
                      </motion.div>
                    )}


                    {/* No results message */}
                    {results && results.detections?.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-2xl p-8 glass-subtle text-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-ghost-white" style={{ fontFamily: "var(--font-heading)" }}>
                          No objects detected
                        </p>
                        <p className="text-xs text-muted mt-1">
                          Try lowering the confidence threshold or uploading a different image.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Error display */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-xl p-4 bg-red-500/5 border border-red-500/20 flex items-start gap-3"
                      id="error-message"
                    >
                      <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-400">Analysis Failed</p>
                        <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted" style={{ fontFamily: "var(--font-mono)" }}>
            VisualIntel v1.0 · Powered by DETR (facebook/detr-resnet-50)
          </p>
          <div className="flex items-center gap-1 text-xs text-muted">
            <span>Built with</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#76B900" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>Next.js + FastAPI</span>
          </div>
        </div>
      </footer>
    </>
  );
}
