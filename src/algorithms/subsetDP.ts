export function isSubsetSumArray(arr: number[], target: number) : boolean[][] {
    const n = arr.length;
    let array = Array.from(Array(n + 1), () => Array(target + 1)); //(target+1)(c)
    for(let i = 0; i <= n; i++){
        for(let j= 0; j <= target; j++){
            array[i][j] = false;    
            if(j === 0) array[i][j] = true;
        }
    }

    for(let i = 1; i <= n; i++){
        let z= 0;
        for(let j= z; j <= target; j++){
            if(arr[i-1] > j){
                array[i][j] = array[i-1][j];
            }else if (arr[i-1] === j){
                array[i][j] = true;
            }else{
                array[i][j] = array[i-1][j] ||  array[i-1][j-arr[i-1]];
            }
        }
    }
    return array; 
}

export function isSubsetSum(arr: number[], target: number) : boolean {
    const n = arr.length;
    let array = Array.from(Array(n + 1), () => Array(target + 1)); //(target+1)(c)
    for(let i = 0; i <= n; i++){
        for(let j= 0; j <= target; j++){
            array[i][j] = false;    
            if(j === 0) array[i][j] = true;
        }
    }

    for(let i = 1; i <= n; i++){
        let z= 0;
        for(let j= z; j <= target; j++){
            if(arr[i-1] > j){
                array[i][j] = array[i-1][j];
            }else if (arr[i-1] === j){
                array[i][j] = true;
            }else{
                array[i][j] = array[i-1][j] ||  array[i-1][j-arr[i-1]];
            }
        }
    }
    return array[n][target];
}