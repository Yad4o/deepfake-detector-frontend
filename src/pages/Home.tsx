import { useState } from "react";
import { Link } from "react-router-dom";
import { detectImage, detectVideo } from "../api";
import UploadZone from "../components/UploadZone";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import FrameChart from "../components/FrameChart";
import { ResultSkeleton } from "../components/Skeleton";
import { toast } from "../components/Toast";
import type { DetectionResult } from "../types";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const FEATURES = [
  { icon: "?", label: "Image analysis", desc: "JPEG · PNG · WebP" },
  { icon: "?", label: "Video analysis", desc: "MP4 · MOV · WebM" },
  { icon: "?", label: "GradCAM heatmap", desc: "Visual explainability" },
  { icon: "?", label: "Face-aware", desc: "OpenCV Haar detection" },
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });

    if (IMAGE_TYPES.has(file.type)) setPreview(URL.createObjectURL(file));
    else setPreview(null);

    setLoading(true);
    try {
      const data = IMAGE_TYPES.has(file.type)
        ? await detectImage(file)
        : await detectVideo(file);
      setResult(data);
      toast(
        `${data.verdict.toUpperCase()} — ${Math.round(data.fake_probability * 100)}% fake probability`,
        data.verdict === "fake" ? "error" : data.verdict === "real" ? "success" : "info"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!result) return;
    const url = `${window.location.origin}/result/${result.id}`;
    copyToClipboard(url);
    setCopied(true);
    toast("Result link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadHeatmap() {
    if (!result?.gradcam_url) return;
    const a = document.createElement("a");
    a.href = result.gradcam_url;
    a.download = `gradcam_${result.id}.png`;
    a.click();
  }

  const verdictBg: Record<string, string> = {
    fake: "border-red-500/30 bg-red-500/5",
    real: "border-emerald-500/30 bg-emerald-500/5",
    uncertain: "border-amber-500/30 bg-amber-500/5",
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-medium tracking-wide">
          EfficientNet-B4 + GradCAM explainability
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Detect deepfakes<br />
          <span className="text-indigo-400">in seconds</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
          Upload an image or video. Our CNN classifier analyzes faces for AI manipulation
          and shows you exactly where it found evidence.
        </p>
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          {FEATURES.map((f) => (
            <span key={f.label} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 rounded-full px-3 py-1">
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="max-w-2xl mx-auto space-y-3">
        <UploadZone onFile={handleFile} loading={loading} label="Drop an image or video to analyze" />

        {fileInfo && !loading && (
          <div className="flex items-center justify-between text-xs text-gray-600 px-1">
            <span className="truncate">{fileInfo.name}</span>
            <span>{fileInfo.size}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="max-w-2xl mx-auto">
          <ResultSkeleton />
        </div>
      )}

      {error && !loading && (
        <div className="max-w-2xl mx-auto p-4 bg-red-900/20 border border-red-700/40 rounded-xl text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="max-w-2xl mx-auto">
          <div className={`border rounded-2xl p-6 space-y-5 transition-all ${verdictBg[result.verdict]}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Verdict</p>
                <VerdictBadge verdict={result.verdict} large />
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                <p className="truncate max-w-[180px]">{result.original_filename}</p>
                <p className="capitalize">{result.media_type}</p>
                <p>{result.processing_time_ms}ms</p>
              </div>
            </div>

            <ConfidenceMeter fakeProb={result.fake_probability} confidence={result.confidence} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {[
                { label: "Faces", value: result.faces_count },
                { label: "Face detected", value: result.face_detected ? "Yes" : "No" },
                result.total_frames_analyzed !== undefined
                  ? { label: "Frames", value: result.total_frames_analyzed }
                  : null,
                result.fake_frames_count !== undefined
                  ? { label: "Suspicious", value: result.fake_frames_count }
                  : null,
              ]
                .filter(Boolean)
                .slice(0, 4)
                .map((s: any) => (
                  <div key={s.label} className="bg-gray-900/60 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                    <p className="font-semibold">{s.value}</p>
                  </div>
                ))}
            </div>

            {/* Frame chart */}
            {result.frame_scores && result.frame_scores.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Frame scores</p>
                <FrameChart scores={result.frame_scores} height={56} />
              </div>
            )}

            {/* Preview + GradCAM */}
            <div className={`grid gap-3 ${preview && result.gradcam_url ? "grid-cols-2" : "grid-cols-1"}`}>
              {preview && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preview</p>
                  <img src={preview} alt="Uploaded" className="w-full rounded-xl max-h-48 object-cover" />
                </div>
              )}
              {result.gradcam_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">GradCAM heatmap</p>
                  <img src={result.gradcam_url} alt="GradCAM" className="w-full rounded-xl max-h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800">
              <Link
                to={`/result/${result.id}`}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Full details
              </Link>
              <button
                onClick={handleShare}
                className="text-sm text-gray-400 hover:text-gray-200 font-medium transition-colors"
              >
                {copied ? "Copied!" : "Share link"}
              </button>
              {result.gradcam_url && (
                <button
                  onClick={handleDownloadHeatmap}
                  className="text-sm text-gray-400 hover:text-gray-200 font-medium transition-colors"
                >
                  Download heatmap
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom links */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
          <Link to="/compare" className="hover:text-gray-400 transition-colors">Compare two files</Link>
          <Link to="/webcam" className="hover:text-gray-400 transition-colors">Use webcam</Link>
          <Link to="/about" className="hover:text-gray-400 transition-colors">How it works</Link>
        </div>
      )}
    </div>
  );
}
