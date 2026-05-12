import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let _id = 0;
const _listeners: Array<(toasts: ToastItem[]) => void> = [];
let _toasts: ToastItem[] = [];

function notify() {
  _listeners.forEach((fn) => fn([..._toasts]));
}

export function toast(message: string, type: ToastType = "info") {
  const item: ToastItem = { id: _id++, message, type };
  _toasts = [..._toasts, item];
  notify();
  setTimeout(() => {
    _toasts = _toasts.filter((t) => t.id !== item.id);
    notify();
  }, 4000);
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-900 border-green-600 text-green-200",
  error: "bg-red-900 border-red-600 text-red-200",
  info: "bg-gray-800 border-gray-600 text-gray-200",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _listeners.push(setToasts);
    return () => {
      const idx = _listeners.indexOf(setToasts);
      if (idx !== -1) _listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg border text-sm shadow-lg ${typeStyles[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
