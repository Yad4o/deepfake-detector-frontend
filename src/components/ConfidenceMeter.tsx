interface Props {
  fakeProb: number;
  confidence: number;
}

export default function ConfidenceMeter({ fakeProb, confidence }: Props) {
  const pct = Math.round(fakeProb * 100);
  const confPct = Math.round(confidence * 100);

  const barColor =
    fakeProb >= 0.65
      ? "bg-red-500"
      : fakeProb <= 0.35
        ? "bg-green-500"
        : "bg-yellow-500";

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Fake Probability</span>
          <span className="font-mono font-semibold">{pct}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-0.5">
          <span>Real</span>
          <span>Fake</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Model Confidence</span>
          <span className="font-mono font-semibold">{confPct}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-700"
            style={{ width: `${confPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
