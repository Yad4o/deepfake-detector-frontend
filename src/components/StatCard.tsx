interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "red" | "green" | "yellow" | "indigo" | "default";
}

const accents: Record<string, string> = {
  red: "text-red-400",
  green: "text-emerald-400",
  yellow: "text-amber-400",
  indigo: "text-indigo-400",
  default: "text-white",
};

export default function StatCard({ label, value, sub, accent = "default" }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}
