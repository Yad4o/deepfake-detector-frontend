interface Props {
  scores: number[];
  height?: number;
}

export default function FrameChart({ scores, height = 64 }: Props) {
  if (!scores.length) return null;
  return (
    <div>
      <div className="flex items-end gap-px" style={{ height }}>
        {scores.map((score, i) => {
          const color =
            score >= 0.65
              ? "bg-red-500"
              : score <= 0.35
                ? "bg-emerald-500"
                : "bg-amber-500";
          return (
            <div
              key={i}
              title={`Frame ${i + 1}: ${Math.round(score * 100)}%`}
              className={`flex-1 rounded-sm transition-all cursor-default ${color} hover:opacity-80`}
              style={{ height: `${Math.max(score * 100, 4)}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>Frame 1</span>
        <span>Frame {scores.length}</span>
      </div>
    </div>
  );
}
