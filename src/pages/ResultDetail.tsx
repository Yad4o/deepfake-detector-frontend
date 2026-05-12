import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDetection } from "../api";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import FrameChart from "../components/FrameChart";
import { ResultSkeleton } from "../components/Skeleton";
import { toast } from "../components/Toast";
import type { DetectionResult } from "../types";

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDetection(Number(id)).then(setResult).catch((e) => setError(e.message));
  }, [id]);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    toast("Link copied", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    if (!result?.gradcam_url) return;
    const a = document.createElement("a");
    a.href = result.gradcam_url;
    a.download = `gradcam_${result.id}.png`;
    a.click();
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/history" className="text-indigo-400 hover:underline text-sm">
          Back to history
        </Link>
      </div>
    );
  }

  if (!result) return <ResultSkeleton />;

  const verdictBg: Record<string, string> = {
    fake: "border-red-500/30 bg-red-500/5",
    real: "border-emerald-500/30 bg-emerald-500/5",
    uncertain: "border-amber-500/30 bg-amber-500/5",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/history" className="hover:text-gray-400 transition-colors">History</Link>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{result.original_filename}</span>
      </div>

      {/* Result card */}
      <div className={`border rounded-2xl p-6 space-y-6 ${verdictBg[result.verdict]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Verdict</p>
            <VerdictBadge verdict={result.verdict} large />
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <p className="truncate max-w-[180px]">{result.original_filename}</p>
            <p className="capitalize">{result.media_type}</p>
            <p>{result.model_version ?? "—"}</p>
            <p>{result.processing_time_ms}ms</p>
          </div>
        </div>

        <ConfidenceMeter fakeProb={result.fake_probability} confidence={result.confidence} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {[
            { label: "Faces detected", value: result.faces_count },
            { label: "Face found", value: result.face_detected ? "Yes" : "No" },
            { label: "Media type", value: result.media_type },
            result.total_frames_analyzed !== undefined && { label: "Frames analyzed", value: result.total_frames_analyzed },
            result.fake_frames_count !== undefined && { label: "Suspicious frames", value: result.fake_frames_count },
            result.frame_scores
              ? { label: "Peak frame score", value: `${Math.round(Math.max(...result.frame_scores) * 100)}%` }
              : null,
          ]
            .filter(Boolean)
            .map((s: any) => (
              <div key={s.label} className="bg-gray-900/60 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                <p className="font-semibold capitalize">{String(s.value)}</p>
              </div>
            ))}
        </div>

        {result.frame_scores && result.frame_scores.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Frame-by-frame scores</p>
            <FrameChart scores={result.frame_scores} height={72} />
          </div>
        )}

        {result.gradcam_url && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">GradCAM heatmap</p>
            <img
              src={result.gradcam_url}
              alt="GradCAM heatmap"
              className="w-full rounded-xl"
            />
            <p className="text-xs text-gray-600 mt-1">
              Jet colourmap overlay — red regions influenced the model decision most
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 pt-1 border-t border-gray-800">
          <button
            onClick={handleShare}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {copied ? "Copied!" : "Share link"}
          </button>
          {result.gradcam_url && (
            <button
              onClick={handleDownload}
              className="text-sm text-gray-400 hover:text-gray-200 font-medium transition-colors"
            >
              Download heatmap
            </button>
          )}
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-gray-200 font-medium transition-colors"
          >
            Analyze another
          </Link>
        </div>
      </div>
    </div>
  );
}
