export type MediaType = "image" | "video";
export type Verdict = "real" | "fake" | "uncertain";

export interface DetectionResult {
  id: number;
  filename: string;
  original_filename: string;
  media_type: MediaType;
  verdict: Verdict;
  fake_probability: number;
  confidence: number;
  face_detected: boolean;
  faces_count: number;
  total_frames_analyzed?: number;
  fake_frames_count?: number;
  frame_scores?: number[];
  gradcam_url?: string;
  model_version?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface DetectionSummary {
  id: number;
  original_filename: string;
  media_type: MediaType;
  verdict: Verdict;
  fake_probability: number;
  confidence: number;
  created_at: string;
}

export interface DetectionStats {
  total_analyzed: number;
  fake_detected: number;
  real_detected: number;
  uncertain: number;
  avg_fake_probability: number;
  fake_rate: number;
}
