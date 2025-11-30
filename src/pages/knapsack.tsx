// src/pages/knapsack.tsx
import { useState } from "react";
import Navbar from "../components/navbar.tsx";
import { heuristicKnapsack, type KnapsackItem } from "../algorithms/knapsack";
import { motion, AnimatePresence } from "framer-motion";

type KnapsackResult = {
  selectedItems: { name: string; weight: number; value: number }[];
  totalValue: number;
  remainingCapacity: number;
  alphaUsed: number | null;
};

type Item = KnapsackItem & {
  id: number;
};


// simple colour palette for the segments
const SEGMENT_COLORS = [
  "#6366F1", // indigo
  "#06B6D4", // cyan
  "#22C55E", // green
  "#F97316", // orange
  "#E11D48", // pink
  "#A855F7", // purple
];

  function getNextName(currentItems: Item[]): string {
  const usedNames = new Set(currentItems.map((it) => it.name));

  // Try letters A–Z
  for (let code = 65; code <= 90; code++) {
    const candidate = String.fromCharCode(code); // 'A'..'Z'
    if (!usedNames.has(candidate)) {
      return candidate;
    }
  }

  // Fallback: if all 26 are used, just reuse based on length
  return String.fromCharCode(65 + (currentItems.length % 26));
}


export default function KnapsackPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [capacity, setCapacity] = useState("");
  const [result, setResult] = useState<KnapsackResult | null>(null);
  const nextName = getNextName(items);


const handleRunAlgorithm = () => {
  const cap = Number(capacity);
  if (!cap || cap <= 0 || items.length === 0) return;

    // strip `id` before passing to the algorithm (it doesn’t care)
    const algoItems: KnapsackItem[] = items.map(({ id, ...rest }) => rest);
    const algoResult = heuristicKnapsack(algoItems, cap);


  setResult(algoResult);

  // still log to console if you want
  console.log("Best knapsack:", algoResult.selectedItems);
  console.log("Total value:", algoResult.totalValue);
  console.log("Remaining capacity:", algoResult.remainingCapacity);
  console.log("Alpha used:", algoResult.alphaUsed);
};


  const handleAddItem = () => {
    const weight = Number(weightInput);
    const value = Number(valueInput);
    if (!weight || !value || weight <= 0 || value <= 0) return;

    setItems((prev) => {
      const name = getNextName(prev);
      return [
        ...prev,
        {
          id: Date.now(),
          name,
          weight,
          value,
        },
      ];
    });

    setWeightInput("");
    setValueInput("");
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

const handleClearItems = () => {
  setItems([]);
  setCapacity("");     // optional: also clear capacity input
  setResult(null);     // ✅ reset visualization to default state
};



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 flex gap-8">
        {/* === LEFT SIDEBAR === */}
        <section className="w-full md:w-96 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Knapsack Settings
          </h1>

          {/* Add item */}
          <div>
            <div className="text-sm font-medium text-slate-600 mb-1">
              Add item (next: {nextName})
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  min={1}
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2.5 transition-colors"
            >
              Add item
            </button>
          </div>

          {/* Items list */}
          <div className="flex items-center justify-between mt-2">
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
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      w: {item.weight} &nbsp;|&nbsp; v: {item.value}
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

          {/* Capacity + run */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Knapsack capacity
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-3"
            />

            <button
              onClick={handleRunAlgorithm}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
              disabled={items.length === 0 || !capacity}
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
                Run the algorithm to see the knapsack visualization.
              </motion.div>
            ) : (
              <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col gap-4">
                {/* Header / stats */}
                <header className="text-sm text-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    Knapsack result
                  </h2>
                  {(() => {
                    const usedWeight = result.selectedItems.reduce(
                      (sum, it) => sum + it.weight,
                      0
                    );
                    const capacityTotal = usedWeight + result.remainingCapacity;

                    return (
                      <p>
                        <span className="font-medium text-emerald-600">
                          Total value: {result.totalValue}
                        </span>
                        {" · "}
                        Capacity used:{" "}
                        <span className="font-medium">
                          {usedWeight} / {capacityTotal}
                        </span>
                        {" · "}
                        Remaining:{" "}
                        <span className="font-medium">
                          {result.remainingCapacity}
                        </span>
                        {result.alphaUsed !== null && (
                          <>
                            {" · "}α used:{" "}
                            <span className="font-mono">
                              {result.alphaUsed.toFixed(1)}
                            </span>
                          </>
                        )}
                      </p>
                    );
                  })()}
                </header>

                <div className="flex-1 flex gap-10 items-center">
                  {/* Bucket */}
                  {(() => {
                    const usedWeight = result.selectedItems.reduce(
                      (sum, it) => sum + it.weight,
                      0
                    );
                    const capacityTotal = usedWeight + result.remainingCapacity || 1;

                    // bigger items at the bottom to look nicer
                    const itemsSorted = [...result.selectedItems].sort(
                      (a, b) => b.weight - a.weight
                    );

                    return (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative h-80 w-48 border-[3px] border-slate-700 rounded-b-3xl rounded-t-md overflow-hidden bg-slate-100">
                          {/* stacked from bottom to top */}
                          <div className="absolute inset-0 flex flex-col">
                            {/* Empty / free space */}
                            {result.remainingCapacity > 0 && (
                              <motion.div
                                key="empty-space"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                  height: `${
                                    (result.remainingCapacity / capacityTotal) * 100
                                  }%`,transformOrigin: "top"
                                }}
                                className="w-full bg-slate-200/80 border-t border-slate-300 flex items-center justify-center text-sm font-medium text-slate-700"
                              >
                                Empty
                              </motion.div>
                            )}

                            {/* Item segments */}
                            {itemsSorted.map((item, idx) => (
                              <motion.div
                                key={`${item.name}-${idx}`}  // ✅ use name+index instead of item.id
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.4, delay: 0.05 * idx }}
                                style={{
                                  height: `${
                                    (item.weight / capacityTotal) * 100
                                  }%`,
                                  backgroundColor:
                                    SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                                    transformOrigin: "bottom"
                                }}
                                className="w-full border-t border-white/40 flex items-center justify-center text-xl font-semibold text-white"
                              >
                                {item.name}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chips list: inside vs outside */}
                  <div className="flex-1 flex flex-col gap-3 text-sm">
                    <div>
                      <h3 className="font-medium text-slate-800 mb-2">
                        Items inside the bag
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.selectedItems.length === 0 ? (
                          <span className="text-xs text-slate-500">
                            No items selected.
                          </span>
                        ) : (
                          result.selectedItems.map((it, idx) => (
                            <motion.span
                              key={it.name}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: 0.05 * idx }}
                              className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs"
                            >
                              <span className="font-semibold mr-1">{it.name}</span>
                              <span className="text-slate-600">
                                w:{it.weight} · v:{it.value}
                              </span>
                            </motion.span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-800 mb-2">
                        Items outside the bag
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const selectedNames = new Set(
                            result.selectedItems.map((it) => it.name)
                          );
                          const outside = items.filter(
                            (it) => !selectedNames.has(it.name)
                          );

                          if (outside.length === 0) {
                            return (
                              <span className="text-xs text-slate-500">
                                All current items are inside the knapsack.
                              </span>
                            );
                          }

                          return outside.map((it) => (
                            <span
                              key={it.id}
                              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs"
                            >
                              <span className="font-semibold mr-1">{it.name}</span>
                              <span className="text-slate-600">
                                w:{it.weight} · v:{it.value}
                              </span>
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
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
