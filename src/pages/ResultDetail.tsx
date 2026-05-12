import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDetection } from "../api";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import { ResultSkeleton } from "../components/Skeleton";
import type { DetectionResult } from "../types";

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDetection(Number(id))
      .then(setResult)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="text-brand-500 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  if (!result) return <ResultSkeleton />;

  const maxScore = result.frame_scores ? Math.max(...result.frame_scores) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/history" className="text-gray-500 hover:text-gray-300 text-sm">
          History
        </Link>
        <span className="text-gray-700">/</span>
        <span className="text-sm text-gray-300 truncate">{result.original_filename}</span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <VerdictBadge verdict={result.verdict} large />
          <p className="text-sm text-gray-500">{result.processing_time_ms}ms</p>
        </div>

        <ConfidenceMeter fakeProb={result.fake_probability} confidence={result.confidence} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: "Faces", value: result.faces_count },
            { label: "Media", value: result.media_type },
            { label: "Model", value: result.model_version ?? "—" },
            result.total_frames_analyzed !== undefined && { label: "Frames", value: result.total_frames_analyzed },
            result.fake_frames_count !== undefined && { label: "Suspicious frames", value: result.fake_frames_count },
            maxScore !== null && { label: "Peak frame score", value: `${Math.round(maxScore * 100)}%` },
          ]
            .filter(Boolean)
            .map((s: any) => (
              <div key={s.label} className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
                <p className="font-semibold capitalize">{String(s.value)}</p>
              </div>
            ))}
        </div>

        {result.frame_scores && result.frame_scores.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Frame-by-frame scores
            </p>
            <div className="flex items-end gap-px h-16">
              {result.frame_scores.map((score, i) => (
                <div
                  key={i}
                  title={`Frame ${i + 1}: ${Math.round(score * 100)}%`}
                  className={`flex-1 rounded-sm transition-all ${
                    score >= 0.65 ? "bg-red-500" : score <= 0.35 ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{ height: `${Math.max(score * 100, 4)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Frame 1</span>
              <span>Frame {result.frame_scores.length}</span>
            </div>
          </div>
        )}

        {result.gradcam_url && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">GradCAM Heatmap</p>
            <img
              src={result.gradcam_url}
              alt="GradCAM heatmap"
              className="w-full rounded-xl"
            />
            <p className="text-xs text-gray-600 mt-1">
              Jet colormap overlay showing regions that influenced the model decision
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
