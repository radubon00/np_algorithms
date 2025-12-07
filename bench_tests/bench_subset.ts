/// <reference types="node" />

import { isSubsetSum as treeSubset } from "../src/algorithms/subset";
import {  isSubsetSum as matrixSubset } from "../src/algorithms/subsetCom";
import { performance } from "perf_hooks";
import * as fs from "fs";


const N_VALUES = [10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120];
const TRIALS = 30;

const MAX_VALUE = 100;

const OUTPUT_FILE = "bench_results/subset_benchmark_results.csv";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomItems(n: number): number[] {
    return Array.from({ length: n }, (_) => (randomInt(1,MAX_VALUE)));
}

function generateTarget(n: number): number {
    return(randomInt(1,MAX_VALUE));
}

function measureMs(fn: () => void): number {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
}

type ResultRow = {
  algo: "matrix" | "tree";
  n: number;
  timeMs: number;
  score: number;
};

function writeCsv(rows: ResultRow[]) {
  const header = "Algorithm,N,Time (ms),Score";

  const lines = rows.map(
    (r) =>
      `${r.algo},${r.n},${r.timeMs.toFixed(6)},${r.score.toFixed(
        2
      )}`
  );

  const csv = [header, ...lines].join("\n");

  // Ensure folder exists
  const folder = "bench_results";
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  fs.writeFileSync(OUTPUT_FILE, csv, "utf-8");
}

async function main() {
  const results: ResultRow[] = [];

  for (const n of N_VALUES) {
    console.log(`\n=== n = ${n} ===`);

    for (let trial = 1; trial <= TRIALS; trial++) {
      const items = generateRandomItems(n);
      const target = generateTarget(n);

      const matrixStart = performance.now();
      const matrixResult = matrixSubset(items, target);
      const matrixTime = performance.now() - matrixStart;
      const matrixValue = matrixResult;

      results.push({
        algo: "matrix",
        n,
        timeMs: matrixTime,
        score: 100, 
      });

      // ---- RUN HEURISTIC ----
      const treeStart = performance.now();
      const treeResult = treeSubset(items, target);
      const treeTime = performance.now() - treeStart;
      const treeValue = treeResult;

      const treeScore =
        matrixValue === treeValue ? (treeTime / matrixTime) * 100 : -100;

      results.push({
        algo: "tree",
        n,
        timeMs: treeTime,
        score: treeScore,
      });

      process.stdout.write(
        `\rTrial ${trial}/${TRIALS} done — TREE=${treeTime.toFixed(
          3
        )}ms (${treeScore.toFixed(1)}%), MATRIX=${matrixTime.toFixed(3)}ms`
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