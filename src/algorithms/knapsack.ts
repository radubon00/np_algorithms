// src/algorithms/knapsack.ts

export type KnapsackItem = {
  name: string;
  weight: number;
  value: number;
};

export type HeuristicResult = {
  selectedItems: KnapsackItem[];
  totalValue: number;
  remainingCapacity: number;
  alphaUsed: number | null;
};

export function heuristicKnapsack(
  items: KnapsackItem[],
  capacity: number
): HeuristicResult {
  // 1) Filter items that can't fit + compute min/max for normalization
  let minW = Infinity;
  let maxW = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;

  const working = items.filter((it) => it.weight <= capacity);

  if (working.length === 0) {
    return {
      selectedItems: [],
      totalValue: 0,
      remainingCapacity: capacity,
      alphaUsed: null,
    };
  }

  for (const item of working) {
    const w = item.weight;
    const v = item.value;

    if (w < minW) minW = w;
    if (w > maxW) maxW = w;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }

  // 2) Normalize weight and value
  const epsilon = 0.0001;
  const normalized = working.map((item) => {
    const normW = (item.weight - minW) / (maxW - minW + epsilon);
    const normV = (item.value - minV) / (maxV - minV + epsilon);
    return { ...item, normW, normV };
  });

  // 3) Explore alphas and keep best knapsack
  let best: HeuristicResult = {
    selectedItems: [],
    totalValue: 0,
    remainingCapacity: capacity,
    alphaUsed: null,
  };

  const alphaValues = [0.2, 0.5, 0.8];

  for (const alpha of alphaValues) {
    const beta = 1 - alpha;

    // 3a) Score items
    const scored = normalized
      .map((item) => ({
        item,
        score: alpha * item.normV - beta * item.normW,
      }))
      .sort((a, b) => b.score - a.score);

    // 3b) Greedy build knapsack
    let capacityLeft = capacity;
    let valueCur = 0;
    const chosen: KnapsackItem[] = [];

    for (const { item } of scored) {
      if (item.weight <= capacityLeft) {
        chosen.push({
          name: item.name,
          weight: item.weight,
          value: item.value,
        });
        capacityLeft -= item.weight;
        valueCur += item.value;
      }
    }

    // 3c) Second pass: try to fill leftover with unused items (by value)
    if (capacityLeft > 0) {
      const chosenNames = new Set(chosen.map((it) => it.name));
      const unused = working
        .filter((it) => !chosenNames.has(it.name))
        .slice()
        .sort((a, b) => b.value - a.value);

      for (const item of unused) {
        if (item.weight <= capacityLeft) {
          chosen.push({ ...item });
          capacityLeft -= item.weight;
          valueCur += item.value;
        }
        if (capacityLeft <= 0) break;
      }
    }

    // 3d) Update best
    if (valueCur > best.totalValue) {
      best = {
        selectedItems: chosen,
        totalValue: valueCur,
        remainingCapacity: capacityLeft,
        alphaUsed: alpha,
      };
    }
  }

  console.log(`Returned knapsack for alpha=${best.alphaUsed ?? "none"}`);
  return best;
}
