interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "?", title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-600 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
