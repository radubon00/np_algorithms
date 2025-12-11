// bench_knapsack.ts
/// <reference types="node" />

import { performance } from "perf_hooks";
import * as fs from "fs";
import { buildCompleteGraph } from "../src/algorithms/geoutils";
import { resolverTSPconPoda, resolverTSPHeldKarp } from "../src/algorithms/tsp";

import type { SimpleCity } from "../src/algorithms/geoutils";

// --------------------------------------------
// CONFIG
// --------------------------------------------
const N_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const TRIALS = 30;

const MAX_COORD = 1000;

const OUTPUT_FILE = "bench_results/tsp_benchmark_results.csv";

// --------------------------------------------
// HELPERS
// --------------------------------------------
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomCities(n: number): SimpleCity[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    lat: randomInt(0, MAX_COORD),
    lng: randomInt(0, MAX_COORD),
  }));
}

// --------------------------------------------
// RESULT TYPE
// --------------------------------------------
type ResultRow = {
  algo: "Con Poda" | "Held-Karp";
  n: number;
  timeMs: number;
  routeLength: number;
  qualityScore: 100 | number;
};

// --------------------------------------------
// CSV WRITER
// --------------------------------------------
function writeCsv(rows: ResultRow[]) {
  const header = "Algorithm,N,Time (ms),Route Length,Quality Score";

  const lines = rows.map(
    (r) =>
      `${r.algo},${r.n},${r.timeMs.toFixed(6)},${r.routeLength.toFixed(
        2
      )},${r.qualityScore.toFixed(2)}`
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
      const cities = generateRandomCities(n);
      const graph = buildCompleteGraph(cities);
      const startIndex = randomInt(0, n - 1); // starting from first city

      // ---- RUN Hald-Karp ----

      const heldKarpStart = performance.now();
      const heldKarpResult = resolverTSPHeldKarp(graph, startIndex);
      const heldKarpTime = performance.now() - heldKarpStart;
      const heldKarpValue = heldKarpResult.totalDistanceKm;

      results.push({
        algo: "Held-Karp",
        n,
        timeMs: heldKarpTime,
        qualityScore: 100, // always 100
        routeLength: heldKarpValue,
      });

      // ---- RUN Con Poda----
      const podaStart = performance.now();
      const podaResult = resolverTSPconPoda(graph, startIndex);
      const podaTime = performance.now() - podaStart;
      const podaValue = podaResult.totalDistanceKm;

      const podaScore = heldKarpValue ? (heldKarpValue / podaValue) * 100 : 0;

      results.push({
        algo: "Con Poda",
        n,
        timeMs: podaTime,
        qualityScore: podaScore,
        routeLength: podaValue,
      });

      process.stdout.write(
        `\rTrial ${trial}/${TRIALS} done — H=${heldKarpTime.toFixed(
          3
        )}ms km(${heldKarpValue.toFixed(1)}), P=${podaTime.toFixed(3)}ms km(${podaValue.toFixed(1)})`
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
