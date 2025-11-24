// src/pages/knapsack.tsx
import { useState } from "react";
import Navbar from "../components/navbar.tsx";
import { heuristicKnapsack } from "../algorithms/knapsack";

type Item = {
  id: number;
  name: string;
  weight: number;
  value: number;
};

export default function KnapsackPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [capacity, setCapacity] = useState("");

  // For now we’ll keep this empty – later you’ll plug in your JS knapsack algorithm
const handleRunAlgorithm = () => {
  const cap = Number(capacity);
  if (!cap || cap <= 0) return;

  const result = heuristicKnapsack(items, cap);

  // later you can store this in state to visualize
  console.log("Best knapsack:", result.selectedItems);
  console.log("Total value:", result.totalValue);
  console.log("Remaining capacity:", result.remainingCapacity);
  console.log("Alpha used:", result.alphaUsed);
};

  const nextName = String.fromCharCode(65 + (items.length % 26)); // A, B, C...

  const handleAddItem = () => {
    const weight = Number(weightInput);
    const value = Number(valueInput);

    if (!weight || !value || weight <= 0 || value <= 0) return;

    const newItem: Item = {
      id: Date.now(),
      name: nextName,
      weight,
      value,
    };

    setItems((prev) => [...prev, newItem]);
    setWeightInput("");
    setValueInput("");
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearItems = () => {
    setItems([]);
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
          <div className="w-full h-[480px] rounded-3xl border border-dashed border-slate-300 bg-white shadow-sm flex items-center justify-center text-sm text-slate-500 px-6 text-center">
            Visualization area. Later we’ll draw the knapsack, show selected vs
            unselected items, total value, and remaining capacity.
          </div>
        </section>
      </main>
    </div>
  );
}
