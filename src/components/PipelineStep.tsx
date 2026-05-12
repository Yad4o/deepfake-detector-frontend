interface Props {
  step: number;
  title: string;
  description: string;
  last?: boolean;
}

export default function PipelineStep({ step, title, description, last }: Props) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
          {step}
        </div>
        {!last && <div className="w-px flex-1 bg-gray-800 mt-2" />}
      </div>
      <div className={`pb-8 ${last ? "" : ""}`}>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
