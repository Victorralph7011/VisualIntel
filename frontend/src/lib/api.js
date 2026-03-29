const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Wrapper around fetch that catches network errors and provides
 * a user-friendly message when the backend is unreachable.
 */
async function apiFetch(url, options) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Server error" }));
      throw new Error(error.detail || `Request failed (${res.status})`);
    }

    return res.json();
  } catch (err) {
    // Network / connection errors (backend not running)
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error(
        `Cannot connect to backend at ${API_BASE}. Make sure the FastAPI server is running (uvicorn main:app --reload).`
      );
    }
    throw err;
  }
}

/**
 * Detect objects in an uploaded image file.
 * @param {File} file - The image file to analyze.
 * @param {number} [threshold] - Confidence threshold (0-1).
 * @returns {Promise<object>} Detection results.
 */
export async function detectFromFile(file, threshold) {
  const formData = new FormData();
  formData.append("file", file);
  if (threshold !== undefined && threshold !== null) {
    formData.append("threshold", String(threshold));
  }

  return apiFetch(`${API_BASE}/api/detect`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Detect objects in an image from a URL.
 * @param {string} url - The image URL.
 * @param {number} [threshold] - Confidence threshold (0-1).
 * @returns {Promise<object>} Detection results.
 */
export async function detectFromURL(url, threshold) {
  const formData = new FormData();
  formData.append("image_url", url);
  if (threshold !== undefined && threshold !== null) {
    formData.append("threshold", String(threshold));
  }

  return apiFetch(`${API_BASE}/api/detect`, {
    method: "POST",
    body: formData,
  });
}

/**
 * Check if the backend is healthy.
 * @returns {Promise<object>}
 */
export async function healthCheck() {
  return apiFetch(`${API_BASE}/health`);
}
