// bench_knapsack.ts
/// <reference types="node" />

import { performance } from "perf_hooks";
import * as fs from "fs";
import { heuristicKnapsack, type KnapsackItem } from "../src/algorithms/knapsack";
import { knapsackDP } from "../src/algorithms/knapsackDP";

// --------------------------------------------
// CONFIG
// --------------------------------------------
const N_VALUES = [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120];
const TRIALS = 30;

const MAX_WEIGHT = 50;
const MAX_VALUE = 100;

const OUTPUT_FILE = "bench_results/knapsack_benchmark_results.csv";

// --------------------------------------------
// HELPERS
// --------------------------------------------
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomItems(n: number): KnapsackItem[] {
  return Array.from({ length: n }, (_, i) => ({
    name: String.fromCharCode(65 + (i % 26)),
    weight: randomInt(1, MAX_WEIGHT),
    value: randomInt(1, MAX_VALUE),
  }));
}

function chooseCapacity(items: KnapsackItem[]): number {
  const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
  return Math.max(1, Math.floor(totalWeight * 0.5));
}

function measureMs(fn: () => void): number {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
}

// --------------------------------------------
// RESULT TYPE
// --------------------------------------------
type ResultRow = {
  algo: "heuristic" | "dp";
  n: number;
  capacity: number;
  timeMs: number;
  score: number; // percentage 0–100
};

// --------------------------------------------
// CSV WRITER
// --------------------------------------------
function writeCsv(rows: ResultRow[]) {
  const header = "Algorithm,N,Capacity,Time (ms),Score";

  const lines = rows.map(
    (r) =>
      `${r.algo},${r.n},${r.capacity},${r.timeMs.toFixed(6)},${r.score.toFixed(
        2
      )}`
  );

  const csv = [header, ...lines].join("\n");

  // Ensure folder exists
  const folder = "bench_results";
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  fs.writeFileSync(OUTPUT_FILE, csv, "utf-8");
}

// --------------------------------------------
// MAIN BENCHMARK LOOP
// --------------------------------------------
async function main() {
  const results: ResultRow[] = [];

  for (const n of N_VALUES) {
    console.log(`\n=== n = ${n} ===`);

    for (let trial = 1; trial <= TRIALS; trial++) {
      const items = generateRandomItems(n);
      const capacity = chooseCapacity(items);

      // ---- RUN DP ----
      const dpStart = performance.now();
      const dpResult = knapsackDP(items, capacity);
      const dpTime = performance.now() - dpStart;
      const dpValue = dpResult.totalValue;

      results.push({
        algo: "dp",
        n,
        capacity,
        timeMs: dpTime,
        score: 100, // always 100
      });

      // ---- RUN HEURISTIC ----
      const heuristicStart = performance.now();
      const heuristicResult = heuristicKnapsack(items, capacity);
      const heuristicTime = performance.now() - heuristicStart;
      const heuristicValue = heuristicResult.totalValue;

      const heuristicScore =
        dpValue > 0 ? (heuristicValue / dpValue) * 100 : 100;

      results.push({
        algo: "heuristic",
        n,
        capacity,
        timeMs: heuristicTime,
        score: heuristicScore,
      });

      process.stdout.write(
        `\rTrial ${trial}/${TRIALS} done — H=${heuristicTime.toFixed(
          3
        )}ms (${heuristicScore.toFixed(1)}%), DP=${dpTime.toFixed(3)}ms`
      );
    }

    console.log(); // newline
  }

  writeCsv(results);
  console.log(`\nSaved benchmark to: ${OUTPUT_FILE}`);
}

// Run
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
