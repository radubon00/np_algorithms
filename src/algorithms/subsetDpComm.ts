
export function isSubsetSum(arr:number[], sum: number) {
    const n = arr.length;

    const dp = Array.from(Array(n + 1), () => Array(sum + 1).fill(false));

    for (let i = 0; i <= n; i++) {
        dp[i][0] = true;
    }

    // Fill the dp table in bottom-up manner
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= sum; j++) {
            if (j < arr[i - 1]) {
            
                // Exclude the current element
                dp[i][j] = dp[i - 1][j];
            } else {
            
                // Include or exclude
                dp[i][j] = dp[i - 1][j] 
                || dp[i - 1][j - arr[i - 1]];
            }
        }
    }
    return dp[n][sum];
}
