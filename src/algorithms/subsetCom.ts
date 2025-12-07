
function isSubsetSumRec(arr: number[], n: number, sum: number): boolean {

    // Base Cases
    if (sum === 0) return true;
    if (n === 0) return false;    

    // If the last element is greater than
    // the sum, ignore it
    if (arr[n - 1] > sum) {
        return isSubsetSumRec(arr, n - 1, sum);
    }

    // Check if sum can be obtained by including
    // or excluding the last element
    return isSubsetSumRec(arr, n - 1, sum) || 
           isSubsetSumRec(arr, n - 1, sum - arr[n - 1]);
}

export function isSubsetSum(arr: number[], sum:number) {
    return isSubsetSumRec(arr, arr.length, sum);
}
