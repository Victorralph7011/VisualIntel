"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";

// ── Neural Node Configuration ──
const NODE_CONFIG = {
  // Primary cluster (right side — fills empty space next to detection results)
  primary: {
    count: 28,
    region: { x: 0.58, y: 0.15, w: 0.40, h: 0.75 },
    nodeRadius: { min: 1.5, max: 3.5 },
    connectionDistance: 220,
    pulseSpeed: { min: 0.3, max: 1.2 },
  },
  // Secondary cluster (top-left, behind header)
  secondary: {
    count: 14,
    region: { x: 0.0, y: 0.0, w: 0.45, h: 0.40 },
    nodeRadius: { min: 1.0, max: 2.5 },
    connectionDistance: 180,
    pulseSpeed: { min: 0.4, max: 0.9 },
  },
  // Tertiary cluster (bottom-left — behind image canvas area)
  tertiary: {
    count: 10,
    region: { x: 0.0, y: 0.55, w: 0.50, h: 0.42 },
    nodeRadius: { min: 1.0, max: 2.0 },
    connectionDistance: 160,
    pulseSpeed: { min: 0.5, max: 1.0 },
  },
  // Sparse ambient nodes (scattered everywhere for depth)
  ambient: {
    count: 12,
    region: { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
    nodeRadius: { min: 0.8, max: 1.5 },
    connectionDistance: 130,
    pulseSpeed: { min: 0.6, max: 1.4 },
  },
};

// ── Data labels for the monospace annotations ──
const DATA_LABELS = [
  "97.3%", "0x3F2A", "NODE:17", "DETR", "λ=0.85",
  "CNN.04", "∂x/∂t", "RES:50", "FPN.2", "σ=0.92",
  "BBOX", "NMS:0.5", "ATN.H8", "Q·K^T", "FFN.1",
  "CLS:91", "POS.ENC", "DEC.06", "ENC.06", "GIOU",
];

function lerp(a, b, t) { return a + (b - a) * t; }
function rand(min, max) { return Math.random() * (max - min) + min; }

function generateCluster(config, canvasW, canvasH) {
  const nodes = [];
  const { count, region, nodeRadius, pulseSpeed } = config;
  for (let i = 0; i < count; i++) {
    const x = rand(region.x * canvasW, (region.x + region.w) * canvasW);
    const y = rand(region.y * canvasH, (region.y + region.h) * canvasH);
    const r = rand(nodeRadius.min, nodeRadius.max);
    const speed = rand(pulseSpeed.min, pulseSpeed.max);
    const phase = Math.random() * Math.PI * 2;
    // Subtle drift animation
    const driftX = rand(-0.15, 0.15);
    const driftY = rand(-0.12, 0.12);
    const driftPhase = Math.random() * Math.PI * 2;
    const driftSpeed = rand(0.1, 0.3);
    // Color: 60% cyan, 40% green
    const isCyan = Math.random() < 0.6;
    // Data label (only some nodes get labels)
    const hasLabel = Math.random() < 0.22;
    const label = hasLabel ? DATA_LABELS[Math.floor(Math.random() * DATA_LABELS.length)] : null;

    nodes.push({
      x, y, baseX: x, baseY: y, r, speed, phase,
      driftX, driftY, driftPhase, driftSpeed,
      isCyan, label,
      alpha: rand(0.3, 0.7),
    });
  }
  return nodes;
}

export default function CyberBackground() {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize nodes on mount + resize
  const initNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const allNodes = [
      ...generateCluster(NODE_CONFIG.primary, w, h),
      ...generateCluster(NODE_CONFIG.secondary, w, h),
      ...generateCluster(NODE_CONFIG.tertiary, w, h),
      ...generateCluster(NODE_CONFIG.ambient, w, h),
    ];
    nodesRef.current = allNodes;
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;

    // Update node positions (subtle drift)
    for (const node of nodes) {
      node.x = node.baseX + Math.sin(t * node.driftSpeed + node.driftPhase) * node.driftX * 40;
      node.y = node.baseY + Math.cos(t * node.driftSpeed * 0.8 + node.driftPhase) * node.driftY * 40;
    }

    // ── Draw connections ──
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Dynamic connection distance based on the larger node's cluster config
        const maxDist = Math.max(a.r, b.r) > 2.5 ? 220 : 160;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          const pulseAlpha = alpha * (0.6 + 0.4 * Math.sin(t * 0.8 + i * 0.3));

          // Gradient line color
          const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          const colorA = a.isCyan ? `rgba(0, 229, 255, ${pulseAlpha})` : `rgba(118, 185, 0, ${pulseAlpha})`;
          const colorB = b.isCyan ? `rgba(0, 229, 255, ${pulseAlpha * 0.6})` : `rgba(118, 185, 0, ${pulseAlpha * 0.6})`;
          gradient.addColorStop(0, colorA);
          gradient.addColorStop(1, colorB);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.6;
          ctx.stroke();

          // Flowing data particle along connection (only on longer lines)
          if (dist > 80) {
            const particleT = ((t * 0.5 + i * 0.7) % 3) / 3;
            const px = lerp(a.x, b.x, particleT);
            const py = lerp(a.y, b.y, particleT);
            const particleAlpha = Math.sin(particleT * Math.PI) * pulseAlpha * 3;
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = a.isCyan
              ? `rgba(0, 229, 255, ${Math.min(particleAlpha, 0.5)})`
              : `rgba(118, 185, 0, ${Math.min(particleAlpha, 0.5)})`;
            ctx.fill();
          }
        }
      }
    }

    // ── Draw nodes ──
    for (const node of nodes) {
      const pulse = 0.5 + 0.5 * Math.sin(t * node.speed + node.phase);
      const currentR = node.r * (0.8 + 0.4 * pulse);
      const currentAlpha = node.alpha * (0.5 + 0.5 * pulse);

      // Outer glow
      const glowR = currentR * 4;
      const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
      if (node.isCyan) {
        glowGrad.addColorStop(0, `rgba(0, 229, 255, ${currentAlpha * 0.3})`);
        glowGrad.addColorStop(1, "rgba(0, 229, 255, 0)");
      } else {
        glowGrad.addColorStop(0, `rgba(118, 185, 0, ${currentAlpha * 0.3})`);
        glowGrad.addColorStop(1, "rgba(118, 185, 0, 0)");
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Core node
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentR, 0, Math.PI * 2);
      ctx.fillStyle = node.isCyan
        ? `rgba(0, 229, 255, ${currentAlpha})`
        : `rgba(118, 185, 0, ${currentAlpha})`;
      ctx.fill();

      // Bright center dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = node.isCyan
        ? `rgba(200, 245, 255, ${currentAlpha * 0.8})`
        : `rgba(200, 255, 150, ${currentAlpha * 0.8})`;
      ctx.fill();

      // Data label
      if (node.label) {
        const labelAlpha = currentAlpha * 0.35;
        ctx.font = "500 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = node.isCyan
          ? `rgba(0, 229, 255, ${labelAlpha})`
          : `rgba(118, 185, 0, ${labelAlpha})`;
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x + node.r * 2 + 4, node.y);
      }
    }

    timeRef.current += 0.016; // ~60fps time step
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    initNodes();

    // Delayed visibility for intro animation
    const fadeTimer = setTimeout(() => setIsVisible(true), 100);

    // Start animation
    frameRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      initNodes();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(fadeTimer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [initNodes, animate]);

  return (
    <div className="cyber-bg-container" aria-hidden="true">
      {/* Layer 1: Deep obsidian base is already on body */}

      {/* Layer 2: Geometric grid pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="cyber-grid-layer"
      />

      {/* Layer 3: Atmospheric glow washes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 3.5, ease: "easeOut", delay: 0.3 }}
        className="cyber-glow-layer"
      />

      {/* Layer 4: Neural data nodes canvas */}
      <motion.canvas
        ref={canvasRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
        className="cyber-nodes-canvas"
      />
    </div>
  );
}
