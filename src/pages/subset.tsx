// src/pages/knapsack.tsx
import { useState } from "react";
import Navbar from "../components/navbar.tsx";
import { subsetSum , findSubset ,type SubsetTree, type SubsetItem } from "../algorithms/subset";
import { motion, AnimatePresence } from "framer-motion";

type SubsetResult = {
  solutions: boolean[][];
  tree: SubsetTree | null;
};

type Item = {
  id: number;
  value: number;
}
// simple colour palette for the segments
const SEGMENT_COLORS = [
  "#6366F1", // indigo
  "#06B6D4", // cyan
  "#22C55E", // green
  "#F97316", // orange
  "#E11D48", // pink
  "#A855F7", // purple
];

function decodeSolution(path: boolean[], items: number[]) {
  return path
    .map((include, i) => (include ? items[i] : null))
    .filter((v) => v !== null) as number[];
}


export default function SubsetPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [valueInput, setValueInput] = useState("");
  const [targetInput, setTargetInput] = useState<number>();
  const [result, setResult] = useState<SubsetResult | null>(null);



  const handleRunAlgorithm = () => {
    const tree : SubsetTree = subsetSum(items.map(i => i.value), targetInput || 0);
    const subsets : boolean[][] = findSubset(tree);
    setResult({ solutions: subsets, tree });
    console.log("Subsets found: ", subsets);
  };


  const handleAddItem = () => {
    const value = Number(valueInput);
    if (!value || value <= 0) return;

    setItems((prev) => {
      return [
        ...prev,
        {
          id: Date.now(),
          value,
        },
      ];
    });
    setValueInput("");
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

const handleClearItems = () => {
  setItems([]);
  setResult(null);
};



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 flex gap-8">
        {/* === LEFT SIDEBAR === */}
        <section className="w-full md:w-96 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Subset Sum Settings
          </h1>

          {/* Add item */}
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">
              Add item 
            </div>
            <div className="flex items-end justify-center gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  min={1}
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-70 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddItem}
                className="h-[36px] w-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 
                 text-white text-lg !font-bold transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="flex items-center justify-between mt-1">
            <div className="text-sm font-medium text-slate-600">
              Items ({items.length})
            </div>
            <button
              onClick={handleClearItems}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Clear items
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 max-h-40 overflow-auto text-sm">
            {items.length === 0 ? (
              <div className="text-xs text-slate-500">
                No items yet. Add some on top.
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-1 border border-slate-200"
                  >
                    <span className="font-medium text-slate-700">
                      {item.value}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="ml-2 text-xs text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Target Input */}
          <div className="text-sm font-medium text-slate-600">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Target  
            </div>
            <div className="grid gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  min={1}
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.valueAsNumber)}
                  placeholder="e.g. 60"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Capacity + run */}
          <div className="mt-1">
            <button
              onClick={handleRunAlgorithm}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
              disabled={items.length === 0 || !targetInput}
            >
              Run algorithm
            </button>
          </div>
        </section>

        {/* === RIGHT VISUALIZATION PANEL === */}
        <section className="hidden md:flex flex-1 items-center justify-center">
          <div className="w-full h-[480px] rounded-3xl border border-slate-200 bg-white shadow-sm px-8 py-6 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex items-center justify-center text-sm text-slate-500 text-center">
                Run the algorithm to see the subset sum visualization.
              </motion.div>
            ) : (
              <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto ">
                {/* Header / stats */}
                <header className="text-sm text-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    Subset sum result
                  </h2>
                </header>

                <div className="flex-1 flex flex-col gap-4 overflow-auto pr-4">
                  {result.solutions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No subset found matching target.
                    </p>
                  ) : (
                    result.solutions.map((sol, idx) => {
                      const values = decodeSolution(sol, items.map(i => i.value));

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: .2 }}
                          className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                        >
                          <div className="text-sm font-semibold text-slate-700 mb-1">
                            Solution #{idx + 1}
                          </div>

                          {/* Print array solution*/}
                          <div className="text-xs text-slate-600 mb-1">
                            Boolean path:{" "}
                            <span className="font-mono">
                              [
                              {sol.map((v, i) => (
                                <span
                                  key={i}
                                  className={v ? "text-emerald-600 font-semibold" : "text-slate-500"}
                                >
                                  {v ? "true" : "false"}
                                  {i < sol.length - 1 ? ", " : ""}
                                </span>
                              ))}
                              ]
                            </span>
                          </div>

                          {/* Print values and sum */}
                          <div className="text-xs text-slate-600">
                            Values:{" "}
                            <span className="font-mono font-medium text-yellow-600">
                              {values.join(" + ")} = {values.reduce((a, b) => a + b, 0)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
