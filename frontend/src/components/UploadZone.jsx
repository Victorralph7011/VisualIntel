"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadZone({ onFileSelect, onUrlSubmit, isLoading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);

  // ── Drag & Drop handlers ──
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlValue.trim()) {
      onUrlSubmit(urlValue.trim());
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
      id="upload-zone"
    >
      {/* Tab switcher */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex items-center gap-1 mb-5 p-1 rounded-xl bg-charcoal/80 border border-white/[0.06] w-fit mx-auto"
      >
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "upload"
              ? "bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_12px_rgba(118,185,0,0.1)]"
              : "text-muted hover:text-ghost-white"
          }`}
          id="tab-upload"
        >
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload File
          </span>
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "url"
              ? "bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_12px_rgba(118,185,0,0.1)]"
              : "text-muted hover:text-ghost-white"
          }`}
          id="tab-url"
        >
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            Paste URL
          </span>
        </button>
      </motion.div>

      {/* Tab content with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === "upload" && (
          <motion.div
            key="upload-tab"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-14
                transition-all duration-300 text-center group
                ${
                  isDragOver
                    ? "dropzone-active border-neon-green"
                    : "border-white/[0.1] hover:border-neon-green/40 hover:bg-white/[0.02]"
                }
                ${isLoading ? "pointer-events-none opacity-50" : ""}
              `}
              id="dropzone"
            >
              {/* Grid background */}
              <div className="absolute inset-0 rounded-2xl bg-grid-pattern opacity-30 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Upload icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-18 h-18 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${
                      isDragOver
                        ? "bg-neon-green/20 scale-110"
                        : "bg-white/[0.04] group-hover:bg-neon-green/10"
                    }
                  `}
                  style={{ width: "72px", height: "72px" }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-colors duration-300 ${
                      isDragOver ? "stroke-neon-green" : "stroke-muted group-hover:stroke-neon-green"
                    }`}
                  >
                    <path d="M4 14.899A7 7 0 1115.71 8h1.79a4.5 4.5 0 012.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="M8 17l4-5 4 5" />
                  </svg>
                </motion.div>

                <div>
                  <p className="text-ghost-white font-medium text-base">
                    {isDragOver ? "Drop your image here" : "Drag & drop an image"}
                  </p>
                  <p className="text-muted text-sm mt-1.5">
                    or <span className="text-neon-green font-medium cursor-pointer hover:underline">browse files</span> · JPG, PNG, WebP
                  </p>
                </div>

                {/* File size hint */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span className="text-xs text-muted">Max 10MB recommended</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
            </div>
          </motion.div>
        )}

        {activeTab === "url" && (
          <motion.div
            key="url-tab"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input-dark !pl-12"
                  disabled={isLoading}
                  id="url-input"
                />
              </div>
              <button
                type="submit"
                disabled={!urlValue.trim() || isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                id="analyze-url-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Analyze Image
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
