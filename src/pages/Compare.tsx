import { useState } from "react";
import { detectImage, detectVideo } from "../api";
import UploadZone from "../components/UploadZone";
import ConfidenceMeter from "../components/ConfidenceMeter";
import VerdictBadge from "../components/VerdictBadge";
import { ResultSkeleton } from "../components/Skeleton";
import { toast } from "../components/Toast";
import type { DetectionResult } from "../types";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface SlotProps {
  label: string;
  result: DetectionResult | null;
  loading: boolean;
  preview: string | null;
  onFile: (f: File) => void;
}

function Slot({ label, result, loading, preview, onFile }: SlotProps) {
  return (
    <div className="flex-1 space-y-4">
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <UploadZone onFile={onFile} loading={loading} label="Drop image or video" />

      {loading && <ResultSkeleton />}

      {!loading && result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <VerdictBadge verdict={result.verdict} large />
            <span className="text-xs text-gray-500 font-mono">{result.processing_time_ms}ms</span>
          </div>
          <ConfidenceMeter fakeProb={result.fake_probability} confidence={result.confidence} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-500 mb-0.5">Faces</p>
              <p className="font-semibold">{result.faces_count}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-500 mb-0.5">Type</p>
              <p className="font-semibold capitalize">{result.media_type}</p>
            </div>
          </div>
          {preview && (
            <img src={preview} alt="preview" className="w-full rounded-lg max-h-48 object-cover" />
          )}
          {result.gradcam_url && (
            <div>
              <p className="text-xs text-gray-500 mb-1">GradCAM</p>
              <img src={result.gradcam_url} alt="heatmap" className="w-full rounded-lg max-h-48 object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareBar({ a, b }: { a: DetectionResult; b: DetectionResult }) {
  const diff = Math.abs(a.fake_probability - b.fake_probability);
  const winner = a.fake_probability < b.fake_probability ? "A is more likely real" : "B is more likely real";
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center space-y-3">
      <p className="text-xs text-gray-500 uppercase tracking-widest">Comparison</p>
      <div className="flex items-center gap-4 justify-center">
        <div className="text-center">
          <VerdictBadge verdict={a.verdict} />
          <p className="text-sm font-mono mt-1">{Math.round(a.fake_probability * 100)}%</p>
        </div>
        <div className="text-gray-700 font-bold text-lg">vs</div>
        <div className="text-center">
          <VerdictBadge verdict={b.verdict} />
          <p className="text-sm font-mono mt-1">{Math.round(b.fake_probability * 100)}%</p>
        </div>
      </div>
      <p className="text-sm text-gray-400">
        Probability gap: <span className="font-mono text-white">{Math.round(diff * 100)}%</span>
      </p>
      <p className="text-sm text-indigo-400 font-medium">{winner}</p>
    </div>
  );
}

export default function Compare() {
  const [resultA, setResultA] = useState<DetectionResult | null>(null);
  const [resultB, setResultB] = useState<DetectionResult | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);

  async function handleFile(file: File, side: "A" | "B") {
    const setLoading = side === "A" ? setLoadingA : setLoadingB;
    const setResult = side === "A" ? setResultA : setResultB;
    const setPreview = side === "A" ? setPreviewA : setPreviewB;

    if (IMAGE_TYPES.has(file.type)) setPreview(URL.createObjectURL(file));
    else setPreview(null);

    setLoading(true);
    try {
      const data = IMAGE_TYPES.has(file.type)
        ? await detectImage(file)
        : await detectVideo(file);
      setResult(data);
      toast(`${side} — ${data.verdict.toUpperCase()}`, data.verdict === "fake" ? "error" : "success");
    } catch (err) {
      toast(`${side} analysis failed: ${err instanceof Error ? err.message : "error"}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Compare</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Analyze two media files side by side to compare results
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Slot
          label="Media A"
          result={resultA}
          loading={loadingA}
          preview={previewA}
          onFile={(f) => handleFile(f, "A")}
        />
        <div className="hidden md:flex items-center">
          <div className="w-px h-full bg-gray-800" />
        </div>
        <Slot
          label="Media B"
          result={resultB}
          loading={loadingB}
          preview={previewB}
          onFile={(f) => handleFile(f, "B")}
        />
      </div>

      {resultA && resultB && !loadingA && !loadingB && (
        <CompareBar a={resultA} b={resultB} />
      )}
    </div>
  );
}
