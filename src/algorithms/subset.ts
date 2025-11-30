

export type SubsetItem = {
    index: number;
    currentSum: number;
    accomplice: boolean;
    next_included?: SubsetItem;
    next_excluded?: SubsetItem;
} | null;

export type SubsetTree = {
    root: SubsetItem | null;
    target: number;
} | null;

export function subsetSum(items: number[], target: number) : SubsetTree {
    const n = items.length;
    if (n===0) return null;

    const tree : SubsetTree = { root: {index: 0, currentSum: 0, accomplice: target === 0}, target };
    const buildTree = (node: SubsetItem, list: number[], target: number):void => {
        if (node === null || node.index >= n) return;
        const included : SubsetItem = { 
            index: node.index + 1, 
            currentSum: node.currentSum + list[node.index], 
            accomplice: target === node.currentSum + list[node.index]
        };

        const excluded : SubsetItem = { 
            index: node.index + 1, 
            currentSum: node.currentSum, 
            accomplice: target === node.currentSum
        };

        buildTree(included, list, target);
        buildTree(excluded, list, target);
        node.next_included = included;
        node.next_excluded = excluded;
    }

    buildTree(tree.root, items, target);
    return tree;
}

export function findSubset(tree: SubsetTree | null): boolean[][] {
    if (tree === null || tree.root === null) return [];
    
    const results: boolean[][] = [];
    const DeepSearch = (node: SubsetItem | null , path: boolean[]):void => {
        if (node === null) return;
        if (node.accomplice && node.next_excluded === undefined && node.next_included === undefined) {
            console.log("Found subset path: ", path);
            results.push(path);
            return;
        }
        DeepSearch(node?.next_included || null, [...path, true]);
        DeepSearch(node?.next_excluded || null, [...path, false]);
    }
    DeepSearch(tree.root, []);
    return results;
}