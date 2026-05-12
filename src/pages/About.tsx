import { useState } from "react";
import { Link } from "react-router-dom";
import PipelineStep from "../components/PipelineStep";

const PIPELINE = [
  {
    title: "Upload Media",
    description:
      "Upload a JPEG, PNG, WebP image or an MP4/MOV/WebM video. The API validates MIME type and enforces a 10 MB (image) or 200 MB (video) size limit.",
  },
  {
    title: "Face Detection",
    description:
      "OpenCV Haar cascades locate the largest face in the frame. When a face is found, the model classifies that region — giving it tighter focus on manipulated facial regions instead of background noise.",
  },
  {
    title: "EfficientNet-B4 Classification",
    description:
      "The face crop (or full frame if no face) is normalised and passed through a fine-tuned EfficientNet-B4 backbone. A sigmoid head outputs fake_probability ∈ [0, 1].",
  },
  {
    title: "Temporal Analysis (video only)",
    description:
      "For videos, 30 uniformly sampled frames are scored individually. A high standard deviation across frame scores boosts the final probability — GAN-generated videos often flicker between convincing and unconvincing frames.",
  },
  {
    title: "GradCAM Heatmap",
    description:
      "Gradient-weighted Class Activation Maps highlight which pixel regions most influenced the model's prediction. A jet-colourmap overlay is saved and returned so you can see exactly where manipulation was suspected.",
  },
  {
    title: "Verdict",
    description:
      "fake_probability ≥ 0.65 → FAKE | ≤ 0.35 → REAL | between → UNCERTAIN. Confidence = |prob − 0.5| × 2, capped at 1.",
  },
];

const FAQ = [
  {
    q: "Can it detect all deepfake types?",
    a: "The model is trained on face-swap deepfakes (FaceForensics++ style). Expression/puppet deepfakes, face reenactment, and purely AI-generated (DALL·E, Midjourney) images may not be detected reliably without fine-tuning.",
  },
  {
    q: "What happens without model weights?",
    a: "The API falls back to random predictions for development purposes. All the pipeline (face detection, frame extraction, GradCAM) still runs — only the CNN output is random.",
  },
  {
    q: "Is uploaded media stored?",
    a: "Uploads and GradCAM heatmaps are saved to the server's uploads/ directory and served at /uploads/*. They are not automatically purged — configure storage retention separately for production.",
  },
  {
    q: "How accurate is it?",
    a: "State-of-the-art EfficientNet-B4 models trained on FaceForensics++ typically achieve ~96% accuracy on the test set. Real-world accuracy varies with compression, resolution, and deepfake method.",
  },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm mb-2">
          EfficientNet-B4 + GradCAM
        </div>
        <h1 className="text-3xl font-bold text-white">How it works</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          A six-stage ML pipeline that detects AI-manipulated faces in images and
          videos, with visual explainability via gradient heatmaps.
        </p>
      </div>

      {/* Pipeline */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-6">Detection pipeline</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {PIPELINE.map((step, i) => (
            <PipelineStep
              key={i}
              step={i + 1}
              title={step.title}
              description={step.description}
              last={i === PIPELINE.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Model specs */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Model specifications</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Architecture", value: "EfficientNet-B4" },
            { label: "Input size", value: "224 × 224 px" },
            { label: "Parameters", value: "~19M" },
            { label: "Output", value: "Sigmoid (binary)" },
            { label: "Face detector", value: "Haar Cascade (OpenCV)" },
            { label: "Video frames", value: "30 uniformly sampled" },
            { label: "Framework", value: "PyTorch 2.3 + timm" },
            { label: "Explainability", value: "Grad-CAM (block 6)" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
            >
              <span className="text-sm text-gray-500">{s.label}</span>
              <span className="text-sm font-medium text-gray-200 font-mono">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Verdict thresholds */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Verdict thresholds</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {[
            { range: "≥ 0.65", verdict: "FAKE", color: "text-red-400", bg: "bg-red-500/10" },
            { range: "0.35 – 0.65", verdict: "UNCERTAIN", color: "text-amber-400", bg: "bg-amber-500/10" },
            { range: "≤ 0.35", verdict: "REAL", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-6 py-4 ${i > 0 ? "border-t border-gray-800" : ""} ${row.bg}`}
            >
              <span className="font-mono text-sm text-gray-300">{row.range}</span>
              <span className={`text-sm font-bold tracking-widest ${row.color}`}>{row.verdict}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">FAQ</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-200 hover:text-white transition-colors"
              >
                {item.q}
                <span className={`text-indigo-400 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium px-6 py-3 rounded-xl"
        >
          Try it now
        </Link>
      </div>
    </div>
  );
}
