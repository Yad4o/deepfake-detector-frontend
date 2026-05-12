import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { deleteDetection, getStats, listDetections } from "../api";
import VerdictBadge from "../components/VerdictBadge";
import StatCard from "../components/StatCard";
import { HistoryRowSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { toast } from "../components/Toast";
import type { DetectionStats, DetectionSummary, MediaType, Verdict } from "../types";

const VERDICTS: Verdict[] = ["fake", "real", "uncertain"];
const MEDIA_TYPES: MediaType[] = ["image", "video"];
const PAGE_SIZE = 10;

export default function History() {
  const [items, setItems] = useState<DetectionSummary[]>([]);
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState<Verdict | "">("");
  const [mediaType, setMediaType] = useState<MediaType | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const displayed = search
    ? items.filter((i) => i.original_filename.toLowerCase().includes(search.toLowerCase()))
    : items;

  async function handleDelete(id: number) {
    try {
      await deleteDetection(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmDelete(null);
      toast("Detection deleted", "success");
    } catch {
      toast("Delete failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-gray-500 text-sm mt-0.5">All past detections</p>
        </div>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          New analysis
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total_analyzed} />
          <StatCard label="Fake" value={stats.fake_detected} accent="red" sub={`${Math.round(stats.fake_rate * 100)}% rate`} />
          <StatCard label="Real" value={stats.real_detected} accent="green" />
          <StatCard label="Uncertain" value={stats.uncertain} accent="yellow" />
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] bg-gray-800 border border-gray-700 text-sm rounded-xl px-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <select
          value={verdict}
          onChange={(e) => { setVerdict(e.target.value as Verdict | ""); setPage(0); }}
          className="bg-gray-800 border border-gray-700 text-sm rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All verdicts</option>
          {VERDICTS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select
          value={mediaType}
          onChange={(e) => { setMediaType(e.target.value as MediaType | ""); setPage(0); }}
          className="bg-gray-800 border border-gray-700 text-sm rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All types</option>
          {MEDIA_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <HistoryRowSkeleton key={i} />)
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="?"
            title={search ? "No matches" : "No detections yet"}
            description={search ? `No files matching "${search}"` : "Upload an image or video to get started"}
            action={
              !search ? (
                <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  Analyze now
                </Link>
              ) : undefined
            }
          />
        ) : (
          displayed.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group"
            >
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                item.verdict === "fake" ? "bg-red-500" :
                item.verdict === "real" ? "bg-emerald-500" : "bg-amber-500"
              }`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.original_filename}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="capitalize">{item.media_type}</span>
                  <span className="mx-1.5 text-gray-700">·</span>
                  {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </p>
              </div>

              <span className="text-sm text-gray-400 font-mono shrink-0">
                {Math.round(item.fake_probability * 100)}%
              </span>

              <VerdictBadge verdict={item.verdict} />

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/result/${item.id}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  View
                </Link>

                {confirmDelete === item.id ? (
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-gray-600 hover:text-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="text-xs text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && displayed.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">Page {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={items.length < PAGE_SIZE}
            className="text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
