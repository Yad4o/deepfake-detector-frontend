import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteDetection, getStats, listDetections } from "../api";
import VerdictBadge from "../components/VerdictBadge";
import { HistoryRowSkeleton } from "../components/Skeleton";
import { toast, ToastContainer } from "../components/Toast";
import type { DetectionStats, DetectionSummary, MediaType, Verdict } from "../types";

const VERDICTS: Verdict[] = ["fake", "real", "uncertain"];
const MEDIA_TYPES: MediaType[] = ["image", "video"];

export default function History() {
  const [items, setItems] = useState<DetectionSummary[]>([]);
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState<Verdict | "">("");
  const [mediaType, setMediaType] = useState<MediaType | "">("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  async function load() {
    setLoading(true);
    try {
      const [data, s] = await Promise.all([
        listDetections({
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          verdict: verdict || undefined,
          media_type: mediaType || undefined,
        }),
        getStats(),
      ]);
      setItems(data);
      setStats(s);
    } catch {
      toast("Failed to load history", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [verdict, mediaType, page]);

  async function handleDelete(id: number) {
    try {
      await deleteDetection(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("Detection deleted", "success");
    } catch {
      toast("Delete failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total_analyzed },
            { label: "Fake", value: stats.fake_detected, red: true },
            { label: "Real", value: stats.real_detected, green: true },
            { label: "Fake Rate", value: `${Math.round(stats.fake_rate * 100)}%` },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.red ? "text-red-400" : s.green ? "text-green-400" : "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <select
          value={verdict}
          onChange={(e) => { setVerdict(e.target.value as Verdict | ""); setPage(0); }}
          className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All verdicts</option>
          {VERDICTS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select
          value={mediaType}
          onChange={(e) => { setMediaType(e.target.value as MediaType | ""); setPage(0); }}
          className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All types</option>
          {MEDIA_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <HistoryRowSkeleton key={i} />)
          : items.length === 0
            ? (
              <div className="text-center py-16 text-gray-500">
                No detections found
              </div>
            )
            : items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.original_filename}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {item.media_type} &bull; {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-mono">
                    {Math.round(item.fake_probability * 100)}%
                  </span>
                  <VerdictBadge verdict={item.verdict} />
                  <Link
                    to={`/result/${item.id}`}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs text-gray-600">Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < PAGE_SIZE || loading}
          className="text-sm text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}
