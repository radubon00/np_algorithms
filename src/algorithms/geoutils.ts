export type SimpleCity = {
  id: number;
  name?: string;
  lat: number;
  lng: number;
};

// Haversine formula to compute distance (in kilometers) between two lat/lng points
export function haversineDistanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const a =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Build a full distance matrix for an array of cities. Distances in kilometers.
export function buildDistanceMatrix(cities: SimpleCity[]) {
  const n = cities.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = haversineDistanceKm(
        cities[i].lat,
        cities[i].lng,
        cities[j].lat,
        cities[j].lng
      );
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }

  return matrix;
}

// Neighbor entry for adjacency list (from a source index to this neighbor)
export type Neighbor = { toIndex: number; toId: number; weight: number };

// CompleteGraph: nodes + adjacency list + distance matrix + id->index map
export type CompleteGraph = {
  nodes: SimpleCity[];
  idToIndex: Map<number, number>;
  adjacencyList: Neighbor[][]; // adjacencyList[srcIndex] = array of neighbors
  distanceMatrix: number[][]; // symmetric matrix (km)
};

export function buildCompleteGraph(cities: SimpleCity[]): CompleteGraph {
  const n = cities.length;
  const distanceMatrix = buildDistanceMatrix(cities);

  const idToIndex = new Map<number, number>();
  for (let i = 0; i < n; i++) idToIndex.set(cities[i].id, i);

  const adjacencyList: Neighbor[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      adjacencyList[i].push({
        toIndex: j,
        toId: cities[j].id,
        weight: distanceMatrix[i][j],
      });
    }
  }

  return { nodes: cities, idToIndex, adjacencyList, distanceMatrix };
}

export function getDistanceById(
  graph: CompleteGraph,
  fromId: number,
  toId: number
): number | undefined {
  const fromIndex = graph.idToIndex.get(fromId);
  const toIndex = graph.idToIndex.get(toId);
  if (fromIndex === undefined || toIndex === undefined) return undefined;
  return graph.distanceMatrix[fromIndex][toIndex];
}

/**
 * Return a readable string representation of the complete graph.
 * - Shows each node (index + id + optional name) and its neighbors
 *   in order of increasing weight. Neighbors are shown as `id[index](d km)`.
 * - `maxNeighbors` truncates the neighbor list for compact output (default 8).
 */
export function formatCompleteGraph(
  graph: CompleteGraph,
  maxNeighbors = 8
): string {
  const lines: string[] = [];
  const n = graph.nodes.length;

  lines.push(`CompleteGraph: ${n} nodes`);
  lines.push("Index  Id     Name (lat,lng)");
  for (let i = 0; i < n; i++) {
    const node = graph.nodes[i];
    const name = node.name ? ` ${node.name}` : "";
    lines.push(
      `${i.toString().padEnd(6)} ${node.id
        .toString()
        .padEnd(6)}${name} (${node.lat.toFixed(4)},${node.lng.toFixed(4)})`
    );
  }

  lines.push("");
  lines.push("Adjacency (neighbors):");

  for (let i = 0; i < n; i++) {
    const neighbors = graph.adjacencyList[i];
    const parts = neighbors
      .slice(0, maxNeighbors)
      .map((nb) => `${nb.toId}[${nb.toIndex}](${nb.weight.toFixed(2)}km)`);
    const more =
      neighbors.length > maxNeighbors
        ? ` ... (+${neighbors.length - maxNeighbors})`
        : "";
    lines.push(`${i} (${graph.nodes[i].id}) -> ${parts.join(", ")}${more}`);
  }

  // summary: distances matrix sample (first few rows)
  const sample = Math.min(n, 6);
  lines.push("");
  lines.push(`Distance matrix (km) — first ${sample} rows/cols:`);
  const header = ["idx"]
    .concat(Array.from({ length: sample }, (_, j) => j.toString()))
    .join("\t");
  lines.push(header);
  for (let i = 0; i < sample; i++) {
    const row = [i.toString()]
      .concat(
        Array.from({ length: sample }, (_, j) =>
          graph.distanceMatrix[i][j].toFixed(2)
        )
      )
      .join("\t");
    lines.push(row);
  }

  return lines.join("\n");
}

export function printCompleteGraph(
  graph: CompleteGraph,
  maxNeighbors = 8
): void {
  // prints to console; useful for quick debugging in Node or browser console
  // Keep output compact by default
  // eslint-disable-next-line no-console
  console.log(formatCompleteGraph(graph, maxNeighbors));
}
