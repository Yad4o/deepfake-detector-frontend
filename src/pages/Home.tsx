import { useState } from "react";
import { Link } from "react-router-dom";
import { detectImage, detectVideo } from "../api";
import UploadZone from "../components/UploadZone";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import { ResultSkeleton } from "../components/Skeleton";
import { toast, ToastContainer } from "../components/Toast";
import type { DetectionResult } from "../types";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);

    if (IMAGE_TYPES.has(file.type)) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    setLoading(true);
    try {
      const data = IMAGE_TYPES.has(file.type)
        ? await detectImage(file)
        : await detectVideo(file);
      setResult(data);
      toast(
        `Analysis complete — ${data.verdict.toUpperCase()}`,
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Deepfake Detection</h1>
        <p className="text-gray-400">
          Upload an image or video to analyze it for AI manipulation
        </p>
      </div>

      <UploadZone onFile={handleFile} loading={loading} />

      {loading && <ResultSkeleton />}

      {error && !loading && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="mt-8 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Verdict</p>
                <VerdictBadge verdict={result.verdict} large />
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{result.original_filename}</p>
                <p>{result.processing_time_ms}ms</p>
              </div>
            </div>

            <ConfidenceMeter
              fakeProb={result.fake_probability}
              confidence={result.confidence}
            />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Faces detected</p>
                <p className="font-semibold">{result.faces_count}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">Media type</p>
                <p className="font-semibold capitalize">{result.media_type}</p>
              </div>
              {result.total_frames_analyzed !== undefined && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Frames analyzed</p>
                  <p className="font-semibold">{result.total_frames_analyzed}</p>
                </div>
              )}
              {result.fake_frames_count !== undefined && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-0.5">Suspicious frames</p>
                  <p className="font-semibold text-red-400">{result.fake_frames_count}</p>
                </div>
              )}
            </div>

            {preview && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Preview</p>
                <img
                  src={preview}
                  alt="Uploaded media"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
              </div>
            )}

            {result.gradcam_url && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                  GradCAM Heatmap
                </p>
                <img
                  src={result.gradcam_url}
                  alt="GradCAM heatmap"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Red regions indicate areas that most influenced the model decision
                </p>
              </div>
            )}

            <Link
              to={`/result/${result.id}`}
              className="block text-center text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              View full analysis details
            </Link>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
