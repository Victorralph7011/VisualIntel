"""
VisualIntel — FastAPI Backend
AI-powered object detection using facebook/detr-resnet-50
"""

import io
import os
import logging
from typing import Optional

import requests as http_requests
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
MODEL_NAME = os.getenv("MODEL_NAME", "facebook/detr-resnet-50")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
PORT = int(os.getenv("PORT", "8000"))

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("visualintel")

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="VisualIntel API",
    description="AI Object Detection powered by DETR (facebook/detr-resnet-50)",
    version="1.0.0",
)

# CORS — allow the Next.js frontend (any localhost port for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model Loading (one-time at startup)
# ---------------------------------------------------------------------------
logger.info(f"Loading model: {MODEL_NAME} ...")
try:
    detector = pipeline("object-detection", model=MODEL_NAME)
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    detector = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def run_detection(image: Image.Image, threshold: float) -> dict:
    """Run the DETR model on a PIL Image and return structured results."""
    if detector is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please try again later.")

    # Ensure RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    width, height = image.size

    # Run inference
    raw_results = detector(image, threshold=threshold)

    # Structure the output
    detections = []
    for det in raw_results:
        detections.append({
            "label": det["label"],
            "score": round(det["score"], 4),
            "box": {
                "xmin": round(det["box"]["xmin"], 1),
                "ymin": round(det["box"]["ymin"], 1),
                "xmax": round(det["box"]["xmax"], 1),
                "ymax": round(det["box"]["ymax"], 1),
            },
        })

    # Sort by confidence descending
    detections.sort(key=lambda d: d["score"], reverse=True)

    return {
        "detections": detections,
        "image_width": width,
        "image_height": height,
        "total_objects": len(detections),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if detector else "model_not_loaded",
        "model": MODEL_NAME,
    }


@app.post("/api/detect")
async def detect_objects(
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    threshold: Optional[float] = Form(None),
):
    """
    Detect objects in an image.

    Send EITHER:
      - `file`: a multipart image upload
      - `image_url`: a URL pointing to an image

    Optional:
      - `threshold`: confidence threshold (0.0 - 1.0), defaults to env setting
    """
    confidence = threshold if threshold is not None else CONFIDENCE_THRESHOLD

    # --- Option A: File upload ---
    if file is not None:
        if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{file.content_type}'. Accepted: JPEG, PNG, WebP.",
            )
        try:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
        except Exception:
            raise HTTPException(status_code=400, detail="Could not process the uploaded image.")

    # --- Option B: URL ---
    elif image_url is not None:
        try:
            resp = http_requests.get(
                image_url,
                timeout=15,
                stream=True,
                headers={"User-Agent": "VisualIntel/1.0 (Object Detection App)"},
            )
            resp.raise_for_status()
            image = Image.open(io.BytesIO(resp.content))
        except http_requests.exceptions.RequestException as e:
            raise HTTPException(status_code=400, detail=f"Could not fetch image from URL: {str(e)}")
        except Exception:
            raise HTTPException(status_code=400, detail="The URL does not point to a valid image.")

    else:
        raise HTTPException(status_code=400, detail="Provide either a 'file' upload or an 'image_url'.")

    # --- Run detection ---
    logger.info(f"Running detection (threshold={confidence}) on image {image.size}")
    results = run_detection(image, confidence)
    logger.info(f"Detected {results['total_objects']} objects.")
    return results


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
