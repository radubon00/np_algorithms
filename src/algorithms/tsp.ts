import type { SimpleCity, CompleteGraph } from "./geoutils";

export type TSPResult = {
  nodes: SimpleCity[];
  totalDistanceKm: number;
  order: number[]; // indices into nodes array (cycle order, returns to start)
};

export function resolverTSPconPoda(
  graph: CompleteGraph,
  startIndex = 0
): TSPResult {
  const n = graph.nodes.length;
  if (n === 0) return { nodes: [], totalDistanceKm: 0, order: [] };
  if (n === 1)
    return { nodes: graph.nodes.slice(), totalDistanceKm: 0, order: [0] };
  if (n === 2) {
    const dist = graph.distanceMatrix[0][1] + graph.distanceMatrix[1][0];
    return {
      nodes: graph.nodes.slice(),
      totalDistanceKm: dist,
      order: [0, 1],
    };
  }

  const dist = graph.distanceMatrix;

  let minDistance = Infinity;
  let bestOrder: number[] = [];

  // Array para rastrear nodos visitados
  const visited = new Array(n).fill(false);

  // Marcamos el nodo inicial como visitado
  visited[startIndex] = true;

  function backtrack(
    currentNode: number,
    countVisited: number,
    currentCost: number,
    path: number[]
  ) {
    if (currentCost >= minDistance) {
      return; // Podar esta rama
    }

    // Caso Base: si todos los nodos han sido visitados
    if (countVisited === n) {
      const totalCost = currentCost + dist[currentNode][startIndex];

      if (totalCost < minDistance) {
        minDistance = totalCost;
        bestOrder = path.slice();
      }
      return;
    }

    for (let nextNode = 0; nextNode < n; nextNode++) {
      if (!visited[nextNode]) {
        visited[nextNode] = true;
        path.push(nextNode);

        const newCost = currentCost + dist[currentNode][nextNode];

        backtrack(nextNode, countVisited + 1, newCost, path);

        // Backtrack
        visited[nextNode] = false;
        path.pop();
      }
    }
  }

  backtrack(startIndex, 1, 0, [startIndex]);

  return {
    nodes: graph.nodes.slice(),
    totalDistanceKm: minDistance,
    order: bestOrder,
  };
}

export function resolverTSPHeldKarp(
  graph: CompleteGraph,
  startIndex = 0
): TSPResult {
  const n = graph.nodes.length;

  // Casos triviales
  if (n === 0) return { nodes: [], totalDistanceKm: 0, order: [] };
  if (n === 1)
    return { nodes: graph.nodes.slice(), totalDistanceKm: 0, order: [0] };
  if (n === 2) {
    const dist = graph.distanceMatrix[0][1] + graph.distanceMatrix[1][0];
    return {
      nodes: graph.nodes.slice(),
      totalDistanceKm: dist,
      order: [0, 1],
    };
  }

  const dist = graph.distanceMatrix;

  // Mapa de costos: Si visite el subconjunto 'mask' y termine en 'i', cual es el costo minimo
  const dp = new Map<string, number>();

  // Mapa de padres: Para llegar a este estado (mask) de que nodo veniamos
  const parent = new Map<string, number>();

  // Helper para convertir el estado (numeros) en txt clave
  const key = (mask: number, last: number) => `${mask},${last}`;

  // Creamos la mascara inicial: Solo el bit del inicio esta activo (ej: 0001 para n=4 y startIndex=0)
  const startMask = 1 << startIndex;

  // Costo inicial: Empezamos en el nodo inicial con costo 0
  dp.set(key(startMask, startIndex), 0);

  // Generamos todos los numeros desde 0 hasta 2^n -1 (Todas las combinaciones de nodos visitados)
  const allMasks: number[] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    // Solo consideramos las mascaras que incluyen el nodo inicial
    if (mask & (1 << startIndex)) {
      allMasks.push(mask);
    }
  }

  // Ordenamos las mascaras por numero de bits activos (nodos visitados)
  // Primero vamos a resolver grupos de 2 ciudades, luego 3, etc.
  allMasks.sort((a, b) => {
    const countA = countBits(a);
    const countB = countBits(b);
    return countA - countB;
  });

  // llenamos la tabla dp
  // 1. Para cada mascara (conjunto de nodos visitados)
  for (const mask of allMasks) {
    const visited = getBitsSet(mask);

    // 2. Para cada ciudad en el conjunto visitado (nodo final)
    for (const last of visited) {
      const currentKey = key(mask, last);
      const currentCost = dp.get(currentKey);

      // Si este estado no es alcanzable (aun no calculado), saltamos
      if (currentCost === undefined) continue;

      // 3. Intentamos extender el camino a cada nodo no visitado (next)
      for (let next = 0; next < n; next++) {
        // Si el nodo ya fue visitado, saltamos (no se volver a visitar)
        if (mask & (1 << next)) continue;

        // Calculamos la nueva mascara y el nuevo costo
        const newMask = mask | (1 << next); // marcamos 'next' como visitado
        const newKey = key(newMask, next); // clave para el nuevo estado
        const newCost = currentCost + dist[last][next]; // costo acumulado

        // Si este nuevo estado no ha sido calculado o encontramos un costo menor, actualizamos
        if (!dp.has(newKey) || newCost < dp.get(newKey)!) {
          dp.set(newKey, newCost);
          parent.set(newKey, last);
        }
      }
    }
  }

  // Calculamos el costo minimo para regresar al nodo inicial desde cualquier nodo final
  const fullMask = (1 << n) - 1; // Mascara con todos los nodos visitados (111...1)
  let minCost = Infinity;
  let lastNode = -1;

  // Revisamos todas las posibles ciudades finales antes de regresar al inicio
  for (let i = 0; i < n; i++) {
    if (i === startIndex) continue; // No podemos terminar en el nodo inicial antes de regresar al inicio

    const finalKey = key(fullMask, i); // Estado: Visite todas las ciudades y termine en 'i'
    const cost = dp.get(finalKey);

    // Si este estado es alcanzable, calculamos el costo total incluyendo el regreso al inicio
    if (cost !== undefined) {
      // Costo total incluyendo regreso al nodo inicial
      const totalCost = cost + dist[i][startIndex];

      // Actualizamos el costo minimo y el nodo final si es necesario
      if (totalCost < minCost) {
        minCost = totalCost;
        lastNode = i; // El mejor lugar desde donde regresar al inicio fue 'i'
      }
    }
  }

  // Reconstruimos el camino optimo utilizando el mapa de padres
  const path: number[] = [];
  let currentMask = fullMask; // Empezamos con todos los nodos visitados
  let currentNode = lastNode; // Empezamos desde el mejor nodo final encontrado

  while (currentNode !== -1) {
    path.push(currentNode); // Agregamos el nodo actual al camino

    const currentKey = key(currentMask, currentNode);
    const prevNode = parent.get(currentKey); // Nodo desde el cual llegamos a currentNode

    if (prevNode !== undefined) {
      // Actualizamos la mascara y el nodo actual para retroceder en el camino
      // XOR (^) para quitar el bit del nodo actual de la mascara
      currentMask ^= 1 << currentNode;
      currentNode = prevNode; // Retrocedemos al nodo anterior
    } else {
      break; // Hemos llegado al nodo inicial
    }
  }

  // Como reconstruimos el camino al reves, lo invertimos al final
  path.reverse();

  return {
    nodes: graph.nodes.slice(),
    totalDistanceKm: minCost,
    order: path,
  };
}

// Cuenta el numero de bits activos en un entero  (eje countBits(13) = 3 porque 13 = 1101 binario)
function countBits(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

// Nos dice cuales bits estan activos en una mascara (eje getBitsSet(13) = [0,2,3] porque 13 = 1101 binario)
function getBitsSet(mask: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < 32; i++) {
    if (mask & (1 << i)) {
      result.push(i);
    }
  }
  return result;
}
