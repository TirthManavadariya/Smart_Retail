"""
Detection endpoints — Image upload + YOLO inference, camera frame.
"""
import sys
from flask import Blueprint, jsonify, request, send_file
from pathlib import Path
import tempfile, io, sys

detection_bp = Blueprint("detection", __name__)
# backend/api/detection.py → .parent = api → .parent = backend
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(BACKEND_DIR / "core"))


@detection_bp.route("/api/detect", methods=["POST"])
def detect_products():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files["image"]
    suffix = Path(file.filename).suffix or ".jpg"
    data_dir = BACKEND_DIR / "core" / "data"
    data_dir.mkdir(exist_ok=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=str(data_dir)) as tmp:
        file.save(tmp)
        tmp_path = tmp.name
    try:
        from models.shelf_detector import ShelfDetector
        import cv2, base64
        detector = ShelfDetector()
        result = detector.detect_products(tmp_path)
        dets = []
        confs = []
        for d in result.detections:
            confs.append(d.confidence)
            dets.append({"class_name": d.class_name, "confidence": round(d.confidence, 4),
                         "bbox": list(d.bbox), "shelf_region": d.shelf_region})
        avg_conf = sum(confs) / len(confs) if confs else 0
        annotated = detector.draw_detections(tmp_path, result)
        _, buf = cv2.imencode(".jpg", annotated)
        b64 = base64.b64encode(buf).decode("utf-8")
        return jsonify({"num_products": result.num_products, "avg_confidence": round(avg_conf, 4),
                        "processing_time_ms": round(result.processing_time_ms, 1),
                        "detections": dets, "annotated_image": b64})
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
