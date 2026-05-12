import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "./Toast";

const NAV = [
  { to: "/", label: "Analyze" },
  { to: "/compare", label: "Compare" },
  { to: "/webcam", label: "Webcam" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white group-hover:bg-indigo-500 transition-colors">
              DF
            </div>
            <span className="font-semibold text-white tracking-tight hidden sm:block">
              Deepfake Detector
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === n.to
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-current transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === n.to
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>Deepfake Detector — EfficientNet-B4 + GradCAM</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-gray-400 transition-colors">How it works</Link>
            <a href="https://github.com/Yad4o/deepfake-detection-api" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
              API Repo
            </a>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}
