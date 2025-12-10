export type KnapsackItem = {
  name: string;
  weight: number;
  value: number;
};

export type DPResult = {
  selectedItems: KnapsackItem[];
  totalValue: number;
};

export function knapsackDP(items: KnapsackItem[], capacity: number): DPResult {
  const n = items.length;

  // dp[i][w] = maximum value using first i items with capacity w
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));

  // Build DP table
  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];

    for (let w = 1; w <= capacity; w++) {
      if (weight <= w) {
        dp[i][w] = Math.max(
          value + dp[i - 1][w - weight], // include
          dp[i - 1][w]                  // exclude
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Total best value
  const totalValue = dp[n][capacity];

  // ░░ BACKTRACK TO RECOVER WHICH ITEMS WERE SELECTED ░░
  let w = capacity;
  const selectedItems: KnapsackItem[] = [];

  for (let i = n; i > 0 && w > 0; i--) {
    // If the value comes from including this item
    if (dp[i][w] !== dp[i - 1][w]) {
      const item = items[i - 1];
      selectedItems.push(item);
      w -= item.weight; // reduce capacity
    }
  }

  // Reverse to preserve original order (optional)
  selectedItems.reverse();

  return { selectedItems, totalValue };
}