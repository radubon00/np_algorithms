// src/pages/knapsack.tsx
import { useState } from "react";
import Navbar from "../components/navbar.tsx";
import MapView from "../components/MapView";
import { resolverTSPconPoda, resolverTSPHeldKarp } from "../algorithms/tsp.ts";
import {
  buildCompleteGraph,
  printCompleteGraph,
} from "../algorithms/geoutils.ts";
import type { TSPResult } from "../algorithms/tsp.ts";

export default function TSPPage() {
  const [algorithmSelected, setAlgorithmSelected] = useState<number>(0);

  // cities for TSP visualization (populate with 30 example cities including coordinates)
  const [cities, setCities] = useState<
    {
      id: number;
      name: string;
      lat: number;
      lng: number;
      resolving?: boolean;
    }[]
  >([]);
  const [startCityId, setStartCityId] = useState<number | null>(null);
  const [routeOrder, setRouteOrder] = useState<number[] | null>(null);

  const handleRunAlgorithm = () => {
    console.log("Running");

    const graph = buildCompleteGraph(cities);

    console.log("Graph Complete:");
    printCompleteGraph(graph);

    let indexStartCity: number = startCityId
      ? cities.findIndex((c) => c.id === startCityId)
      : 0;

    if (algorithmSelected === 0) {
      const result: TSPResult = resolverTSPconPoda(graph, indexStartCity);
      console.log("TSP Result:", result);
      setRouteOrder(result.order.length ? result.order : null);
    } else {
      const result: TSPResult = resolverTSPHeldKarp(graph, indexStartCity);
      console.log("TSP Result:", result);
      setRouteOrder(result.order.length ? result.order : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 flex gap-8">
        {/* === LEFT SIDEBAR === */}
        <section className="w-full md:w-96 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Travelling Salesman Problem Settings
          </h1>

          {/* Algorithm selector */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Implementacion
            </label>
            <select
              value={algorithmSelected}
              onChange={(e) => setAlgorithmSelected(Number(e.target.value))}
              className="w-full cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-3"
            >
              <option value={0}>By Kelvin Melgar</option>
              <option value={1}>Held-Karp</option>
            </select>
          </div>

          {/* Cities list + Start city selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-600">
                Selected cities
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Total: {cities.length}
                </span>
                <button
                  onClick={() => {
                    setCities([]);
                    setStartCityId(null);
                    setRouteOrder(null);
                  }}
                  disabled={cities.length === 0}
                  className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 max-h-40 overflow-auto mb-3">
              {cities.length === 0 ? (
                <div className="text-xs p-3 text-slate-500">
                  No cities selected.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {cities.map((c) => (
                    <li
                      key={c.id}
                      className="px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-100"
                    >
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        {c.resolving ? (
                          <span
                            className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-slate-400"
                            aria-hidden
                          />
                        ) : null}
                        <span>{c.name}</span>
                      </span>
                      <button
                        onClick={() =>
                          setCities((prev) => prev.filter((x) => x.id !== c.id))
                        }
                        className="text-xs text-red-500 hover:text-red-600 ml-2 cursor-pointer hover:underline"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label className="block text-sm font-medium text-slate-600 mb-1">
              Start city
            </label>
            <select
              value={startCityId ?? ""}
              onChange={(e) =>
                setStartCityId(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">(none)</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* run */}
          <div className="mt-2">
            <button
              onClick={handleRunAlgorithm}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
            >
              Run algorithm
            </button>
          </div>
        </section>
        {/* === RIGHT VISUALIZATION PANEL === */}
        <section className="hidden md:flex flex-1 items-center justify-center">
          <div className="w-full h-[580px] rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
            <div className="h-full">
              <MapView
                cities={cities}
                setCities={setCities}
                startCityId={startCityId}
                setStartCityId={setStartCityId}
                setRouteOrder={setRouteOrder}
                routeOrder={routeOrder}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
