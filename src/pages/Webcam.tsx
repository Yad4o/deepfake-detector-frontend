import { useCallback, useEffect, useRef, useState } from "react";
import { detectImage } from "../api";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import { toast } from "../components/Toast";
import type { DetectionResult } from "../types";

type CamState = "idle" | "starting" | "live" | "error";

export default function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camState, setCamState] = useState<CamState>("idle");
  const [camError, setCamError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [captureDataUrl, setCaptureDataUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState("idle");
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera() {
    setCamState("starting");
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState("live");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setCamError(msg);
      setCamState("error");
    }
  }

  async function captureAndAnalyze() {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptureDataUrl(dataUrl);

    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return; }
      const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
      try {
        const data = await detectImage(file);
        setResult(data);
        toast(
          `Capture analyzed — ${data.verdict.toUpperCase()}`,
          data.verdict === "fake" ? "error" : data.verdict === "real" ? "success" : "info"
        );
      } catch (err) {
        toast(`Analysis failed: ${err instanceof Error ? err.message : "error"}`, "error");
      } finally {
        setCapturing(false);
      }
    }, "image/jpeg", 0.92);
  }

  function reset() {
    setResult(null);
    setCaptureDataUrl(null);
  }

  const verdictRing: Record<string, string> = {
    fake: "ring-2 ring-red-500",
    real: "ring-2 ring-emerald-500",
    uncertain: "ring-2 ring-amber-500",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Webcam Analysis</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Capture a frame from your camera and analyze it for deepfake manipulation
        </p>
      </div>

      {/* Camera viewport */}
      <div className={`relative bg-gray-900 rounded-2xl overflow-hidden aspect-video border border-gray-800 ${result ? verdictRing[result.verdict] : ""}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {camState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl">
              &#127909;
            </div>
            <p className="text-gray-400 text-sm">Camera not started</p>
            <button
              onClick={startCamera}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {camState === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm animate-pulse">Requesting camera access...</div>
          </div>
        )}

        {camState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-red-400 text-sm">{camError}</p>
            <button
              onClick={startCamera}
              className="text-sm text-indigo-400 hover:text-indigo-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {camState === "live" && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <div className="flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1 text-xs text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          </div>
        )}

        {result && captureDataUrl && (
          <div className="absolute inset-0">
            <img src={captureDataUrl} alt="Captured frame" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3">
              <VerdictBadge verdict={result.verdict} large />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        {camState === "live" && !result && (
          <button
            onClick={captureAndAnalyze}
            disabled={capturing}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {capturing ? "Analyzing..." : "Capture & Analyze"}
          </button>
        )}
        {result && (
          <button
            onClick={reset}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Capture again
          </button>
        )}
        {camState === "live" && (
          <button
            onClick={stopCamera}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-5 py-3 rounded-xl transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      {/* Result */}
      {result && !capturing && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <VerdictBadge verdict={result.verdict} large />
            <span className="text-xs text-gray-500">{result.processing_time_ms}ms</span>
          </div>
          <ConfidenceMeter fakeProb={result.fake_probability} confidence={result.confidence} />
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[
              { label: "Faces", value: result.faces_count },
              { label: "Model", value: result.model_version ?? "—" },
              { label: "Type", value: result.media_type },
            ].map((s) => (
              <div key={s.label} className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className="font-semibold capitalize">{s.value}</p>
              </div>
            ))}
          </div>
          {result.gradcam_url && (
            <div>
              <p className="text-xs text-gray-500 mb-2">GradCAM heatmap</p>
              <img src={result.gradcam_url} alt="GradCAM" className="w-full rounded-xl" />
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-700 text-center">
        Camera frames are sent to the local API — no data is uploaded to external servers.
      </p>
    </div>
  );
}
