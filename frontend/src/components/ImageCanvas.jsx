"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Color palette for bounding boxes — cycles through these
const BOX_COLORS = [
  "#76B900", // neon green
  "#00E5FF", // cyber cyan
  "#FF6B6B", // coral red
  "#FFD93D", // gold
  "#C084FC", // purple
  "#FB923C", // orange
  "#22D3EE", // teal
  "#F472B6", // pink
];

export default function ImageCanvas({ imageSrc, detections, imageWidth, imageHeight, isLoading }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [imageError, setImageError] = useState(false);

  // Reset states when imageSrc changes
  useEffect(() => {
    setIsReady(false);
    setImageError(false);
  }, [imageSrc]);

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!isReady || !canvasRef.current || !imgRef.current || !detections?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Match canvas to displayed image size
    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Scale factors
    const scaleX = displayWidth / imageWidth;
    const scaleY = displayHeight / imageHeight;

    // Clear
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    detections.forEach((det, i) => {
      const color = BOX_COLORS[i % BOX_COLORS.length];
      const { xmin, ymin, xmax, ymax } = det.box;

      // Scale coordinates
      const x = xmin * scaleX;
      const y = ymin * scaleY;
      const w = (xmax - xmin) * scaleX;
      const h = (ymax - ymin) * scaleY;

      const isHovered = hoveredIndex === i;
      const lineWidth = isHovered ? 3 : 2;
      const alpha = isHovered ? 0.25 : 0.08;

      // Fill
      ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
      ctx.fillRect(x, y, w, h);

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, w, h);

      // Corner accents (top-left and bottom-right)
      const cornerLen = Math.min(14, w / 4, h / 4);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLen, y);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLen, y + h);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();

      // Label pill
      const label = `${det.label}`;
      const score = `${(det.score * 100).toFixed(1)}%`;
      const text = `${label}  ${score}`;
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      const metrics = ctx.measureText(text);
      const labelPadX = 8;
      const labelH = 20;
      const labelW = metrics.width + labelPadX * 2;

      // Label background
      const labelX = x;
      const labelY = y - labelH - 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(labelX, Math.max(0, labelY), labelW, labelH, 4);
      ctx.fill();

      // Label text
      ctx.fillStyle = "#09090B";
      ctx.textBaseline = "middle";
      ctx.fillText(text, labelX + labelPadX, Math.max(0, labelY) + labelH / 2);
    });
  }, [isReady, detections, imageWidth, imageHeight, hoveredIndex]);

  // Re-draw on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsReady(false);
      setTimeout(() => setIsReady(true), 50);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── No image at all → don't render anything ──
  if (!imageSrc) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-charcoal"
      style={{ minHeight: "400px" }}
      id="image-canvas"
    >
      {/* Corner decoration */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-green/40 rounded-tl-2xl z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-green/40 rounded-tr-2xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-green/40 rounded-bl-2xl z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-green/40 rounded-br-2xl z-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── Image failed to load ── */}
        {imageError && (
          <motion.div
            key="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 px-6"
            style={{ minHeight: "400px" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ghost-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Image failed to load
            </p>
            <p className="text-xs text-muted max-w-xs">
              The image URL may be invalid or the server blocked the request. Try uploading the file directly.
            </p>
          </motion.div>
        )}

        {/* ── Loading / waiting state ── */}
        {!imageError && !isReady && (
          <motion.div
            key="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center z-5"
            style={{ minHeight: "400px" }}
          >
            {/* Skeleton shimmer */}
            <div className="absolute inset-0 animate-shimmer rounded-2xl opacity-30" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-neon-green/5 border border-neon-green/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#76B900" strokeWidth="1.5" className="animate-pulse" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted" style={{ fontFamily: "var(--font-mono)" }}>
                  Loading image…
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actual image ── */}
      {!imageError && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Analyzed image"
          className={`w-full h-auto block transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsReady(true)}
          onError={() => setImageError(true)}
          style={{ maxHeight: "650px", objectFit: "contain", minHeight: isReady ? "auto" : "400px" }}
        />
      )}

      {/* Canvas overlay */}
      {isReady && !imageError && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ maxHeight: "650px" }}
        />
      )}

      {/* Image dimensions badge */}
      {isReady && imageWidth && imageHeight && (
        <div
          className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg glass text-xs text-muted flex items-center gap-1.5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          {imageWidth} × {imageHeight}
        </div>
      )}
    </motion.div>
  );
}
