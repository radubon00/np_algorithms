import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        
        {/* Logo / Title */}
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Algorithm Visualizer
        </Link>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm text-slate-600">
          <Link className="hover:text-slate-900 transition-colors" to="/">
            Home
          </Link>

          <Link className="hover:text-slate-900 transition-colors" to="/knapsack">
            Knapsack
          </Link>

          <Link className="hover:text-slate-900 transition-colors" to="/subset-sum">
            Subset Sum
          </Link>
        </nav>

      </div>
    </header>
  );
}
