import Navbar from "../components/navbar.tsx";
import knapsackImg from "../assets/knapsack icon.png";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        
        {/* Hero section */}
        <section className="grid gap-10 md:grid-cols-[2fr,1fr] items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Algorithm Visualizer
            </h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Explore algorithms with step-by-step visualizations, simplifying
              the learning process and making it more engaging for a better 
              understanding.
            </p>
          </div>
        </section>

        {/* Cards section */}
        <section>
          <div className="grid gap-6 md:grid-cols-3">

            {/* Card 1: Pathfinder */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                Pathfinder image placeholder
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Pathfinder</h2>
                <p className="text-sm text-slate-600">
                  Visualize graph algorithms like Dijkstra, BFS and DFS on
                  interactive graphs.
                </p>
              </div>
            </div>

            {/* Card 2: Recursion Tree */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                Recursion tree image placeholder
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Recursion Tree</h2>
                <p className="text-sm text-slate-600">
                  Understand recursive algorithms by visualizing how function
                  calls expand into a tree.
                </p>
              </div>
            </div>

            {/* Card 3: Knapsack */}
            <div
              className="cursor-pointer rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
              onClick={() => navigate("/knapsack")}
            >
              <div className="h-40 w-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                <img
                  src={knapsackImg}
                  alt="Knapsack"
                  className="h-full w-auto object-contain p-4"
                />
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">
                  Knapsack Algorithm
                </h2>
                <p className="text-sm text-slate-600">
                  Explore how different strategies solve the 0/1 knapsack
                  problem using heuristics, dynamic programming, and visual 
                  step-by-step comparisons.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
