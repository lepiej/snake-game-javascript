// Hamiltonian cycle solver for snake grid
// Returns an array of {x, y} positions representing the cycle
function findHamiltonianCycle(width, height) {
  // Build adjacency list for grid
  const adj = {};
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const key = `${x},${y}`;
      adj[key] = [];
      if (x > 0) adj[key].push(`${x-1},${y}`);
      if (x < width-1) adj[key].push(`${x+1},${y}`);
      if (y > 0) adj[key].push(`${x},${y-1}`);
      if (y < height-1) adj[key].push(`${x},${y+1}`);
    }
  }
  // Backtracking search
  const path = [];
  const visited = new Set();
  function dfs(x, y) {
    const key = `${x},${y}`;
    path.push({x, y});
    visited.add(key);
    if (path.length === width * height) {
      // Check if cycle
      const first = path[0];
      if (adj[key].includes(`${first.x},${first.y}`)) return true;
    }
    for (const next of adj[key]) {
      if (!visited.has(next)) {
        const [nx, ny] = next.split(',').map(Number);
        if (dfs(nx, ny)) return true;
      }
    }
    path.pop();
    visited.delete(key);
    return false;
  }
  if (dfs(0, 0)) return path;
  return null;
}

// Export for use in main script
if (typeof window !== 'undefined') window.findHamiltonianCycle = findHamiltonianCycle;
