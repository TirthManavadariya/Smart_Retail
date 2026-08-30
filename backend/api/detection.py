"""
Detection endpoints — Image upload + YOLO inference, camera frame.
"""
import sys
import io
from flask import Blueprint, jsonify, request, send_file
from pathlib import Path

detection_bp = Blueprint("detection", __name__)
# backend/api/detection.py → .parent = api → .parent = backend
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(BACKEND_DIR / "core"))

# The YOLO model is expensive to construct (weights load + warm-up), so build
# the detector once and reuse it across requests instead of per-call.
_detector = None


def _get_detector():
    global _detector
    if _detector is None:
        from models.shelf_detector import ShelfDetector
        _detector = ShelfDetector()
    return _detector


@detection_bp.route("/api/detect", methods=["POST"])
def detect_products():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files["image"]
    file_bytes = file.read()
    if not file_bytes:
        return jsonify({"error": "Empty image file provided"}), 400

    try:
        import numpy as np, cv2, base64

        # Decode image directly in-memory
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return jsonify({"error": "Could not decode uploaded image format"}), 400

        detector = _get_detector()
        result = detector.detect_products(image)

        # Annotated image
        annotated = detector.draw_detections(image, result)
        _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 92])
        ann_b64 = base64.b64encode(buf).decode("utf-8")

        # Original image
        _, orig_buf = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, 92])
        orig_b64 = base64.b64encode(orig_buf).decode("utf-8")

        dets = []
        confs = []
        class_counts = {}
        for i, d in enumerate(result.detections):
            confs.append(d.confidence)
            clean_label = d.class_name.replace("_", " ").title()
            class_counts[clean_label] = class_counts.get(clean_label, 0) + 1
            dets.append({
                "id": i + 1,
                "class_name": d.class_name,
                "label": clean_label,
                "confidence": round(d.confidence, 4),
                "bbox": list(d.bbox),
                "shelf_region": d.shelf_region
            })

        avg_conf = sum(confs) / len(confs) if confs else 0
        stockout_gaps = max(0, 1 if len(dets) > 0 and len(dets) < 25 else 0)
        compliance_score = round(max(75.0, min(99.5, (avg_conf * 100) - (stockout_gaps * 2.5))), 1)

        return jsonify({
            "num_products": result.num_products,
            "avg_confidence": round(avg_conf, 4),
            "processing_time_ms": round(result.processing_time_ms, 1),
            "detections": dets,
            "class_counts": class_counts,
            "stockout_gaps": stockout_gaps,
            "compliance_score": compliance_score,
            "annotated_image": f"data:image/jpeg;base64,{ann_b64}",
            "original_image": f"data:image/jpeg;base64,{orig_b64}",
            "image_width": result.image_width,
            "image_height": result.image_height
        })
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@detection_bp.route("/api/camera/frame")
def camera_frame():
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return jsonify({"error": "Camera not available"}), 503
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return jsonify({"error": "Failed to capture"}), 503
        _, buf = cv2.imencode(".jpg", frame)
        return send_file(io.BytesIO(buf.tobytes()), mimetype="image/jpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
