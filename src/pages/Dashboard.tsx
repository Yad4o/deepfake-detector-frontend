import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats, listDetections } from "../api";
import StatCard from "../components/StatCard";
import VerdictBadge from "../components/VerdictBadge";
import { HistoryRowSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { toast } from "../components/Toast";
import type { DetectionStats, DetectionSummary } from "../types";

function MiniDonut({ fake, real, uncertain }: { fake: number; real: number; uncertain: number }) {
  const total = fake + real + uncertain || 1;
  const fakeP = (fake / total) * 100;
  const realP = (real / total) * 100;
  const uncP = (uncertain / total) * 100;

  return (
    <div className="space-y-3">
      {[
        { label: "Fake", pct: fakeP, color: "bg-red-500", text: "text-red-400" },
        { label: "Real", pct: realP, color: "bg-emerald-500", text: "text-emerald-400" },
        { label: "Uncertain", pct: uncP, color: "bg-amber-500", text: "text-amber-400" },
      ].map((row) => (
        <div key={row.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className={row.text}>{row.label}</span>
            <span className="text-gray-500 font-mono">{row.pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${row.color}`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBar({ items }: { items: DetectionSummary[] }) {
  const last20 = [...items].slice(0, 20).reverse();
  if (!last20.length) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Recent activity (last 20)</p>
      <div className="flex items-end gap-1 h-12">
        {last20.map((item, i) => {
          const color =
            item.verdict === "fake"
              ? "bg-red-500"
              : item.verdict === "real"
                ? "bg-emerald-500"
                : "bg-amber-500";
          return (
            <Link
              key={i}
              to={`/result/${item.id}`}
              title={`${item.original_filename} — ${item.verdict}`}
              className={`flex-1 rounded-sm ${color} hover:opacity-70 transition-opacity`}
              style={{ height: `${Math.max(item.fake_probability * 100, 8)}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-700 mt-1">
        <span>oldest</span>
        <span>newest</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [recent, setRecent] = useState<DetectionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([getStats(), listDetections({ limit: 20 })]);
      setStats(s);
      setRecent(r);
    } catch {
      toast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const avgMs = recent.length
    ? Math.round(recent.reduce((a, _) => a, 0))
    : null;

  const imageCount = recent.filter((r) => r.media_type === "image").length;
  const videoCount = recent.filter((r) => r.media_type === "video").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analysis statistics and trends</p>
        </div>
        <button
          onClick={load}
          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span className={loading ? "animate-spin inline-block" : ""}>&#8635;</span>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total analyzed" value={stats.total_analyzed} />
          <StatCard label="Fake detected" value={stats.fake_detected} accent="red" sub={`${Math.round(stats.fake_rate * 100)}% of total`} />
          <StatCard label="Confirmed real" value={stats.real_detected} accent="green" />
          <StatCard label="Avg fake prob" value={`${Math.round(stats.avg_fake_probability * 100)}%`} accent="indigo" />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Verdict breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Verdict breakdown</h2>
          {stats ? (
            <MiniDonut
              fake={stats.fake_detected}
              real={stats.real_detected}
              uncertain={stats.uncertain}
            />
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-gray-800 rounded animate-pulse" />)}
            </div>
          )}
          <div className="pt-2 border-t border-gray-800 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Images</p>
              <p className="font-semibold text-gray-200">{imageCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Videos</p>
              <p className="font-semibold text-gray-200">{videoCount}</p>
            </div>
          </div>
        </div>

        {/* Recent trend + table */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <HistoryRowSkeleton key={i} />)}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon="?"
              title="No detections yet"
              description="Upload an image or video to get started"
              action={<Link to="/" className="text-indigo-400 text-sm hover:underline">Analyze now</Link>}
            />
          ) : (
            <>
              <TrendBar items={recent} />
              <div className="border-t border-gray-800 pt-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Recent detections</p>
                {recent.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    to={`/result/${item.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.verdict === "fake" ? "bg-red-500" :
                      item.verdict === "real" ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    <span className="flex-1 text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                      {item.original_filename}
                    </span>
                    <span className="text-xs text-gray-600 font-mono shrink-0">
                      {Math.round(item.fake_probability * 100)}%
                    </span>
                    <VerdictBadge verdict={item.verdict} />
                  </Link>
                ))}
                {recent.length > 6 && (
                  <Link to="/history" className="block text-center text-xs text-indigo-400 hover:text-indigo-300 pt-2 transition-colors">
                    View all {recent.length}+ detections
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
