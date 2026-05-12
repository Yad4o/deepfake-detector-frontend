import type { DetectionResult, DetectionStats, DetectionSummary, MediaType, Verdict } from "./types";

const BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function detectImage(file: File): Promise<DetectionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/detect/image`, { method: "POST", body: form });
  return handleResponse(res);
}

export async function detectVideo(file: File): Promise<DetectionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/detect/video`, { method: "POST", body: form });
  return handleResponse(res);
}

export async function listDetections(params?: {
  skip?: number;
  limit?: number;
  media_type?: MediaType;
  verdict?: Verdict;
}): Promise<DetectionSummary[]> {
  const q = new URLSearchParams();
  if (params?.skip !== undefined) q.set("skip", String(params.skip));
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.media_type) q.set("media_type", params.media_type);
  if (params?.verdict) q.set("verdict", params.verdict);
  const res = await fetch(`${BASE}/history/?${q}`);
  return handleResponse(res);
}

export async function getDetection(id: number): Promise<DetectionResult> {
  const res = await fetch(`${BASE}/history/${id}`);
  return handleResponse(res);
}

export async function deleteDetection(id: number): Promise<void> {
  const res = await fetch(`${BASE}/history/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function getStats(): Promise<DetectionStats> {
  const res = await fetch(`${BASE}/history/stats`);
  return handleResponse(res);
}
