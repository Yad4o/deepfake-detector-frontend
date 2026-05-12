import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();
  const nav = [
    { to: "/", label: "Analyze" },
    { to: "/history", label: "History" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-white tracking-tight">
            Deepfake Detector
          </Link>
          <nav className="flex gap-6">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm font-medium transition-colors ${
                  pathname === n.to
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-600 py-4">
        Powered by EfficientNet-B4
      </footer>
    </div>
  );
}
