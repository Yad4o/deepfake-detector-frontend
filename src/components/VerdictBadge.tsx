import type { Verdict } from "../types";

const styles: Record<Verdict, string> = {
  fake: "bg-red-500/20 text-red-400 border border-red-500/30",
  real: "bg-green-500/20 text-green-400 border border-green-500/30",
  uncertain: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
};

const labels: Record<Verdict, string> = {
  fake: "FAKE",
  real: "REAL",
  uncertain: "UNCERTAIN",
};

interface Props {
  verdict: Verdict;
  large?: boolean;
}

export default function VerdictBadge({ verdict, large }: Props) {
  return (
    <span
      className={`inline-block rounded-full font-bold tracking-widest ${styles[verdict]} ${
        large ? "text-sm px-4 py-1.5" : "text-xs px-3 py-0.5"
      }`}
    >
      {labels[verdict]}
    </span>
  );
}
