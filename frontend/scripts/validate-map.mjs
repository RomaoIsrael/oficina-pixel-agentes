// Script de validacion standalone (no forma parte del build): reconstruye la
// misma grilla que officeMap.ts en JS plano y verifica con un flood-fill que
// todas las areas son alcanzables desde el spawn. Se corre con `node
// scripts/validate-map.mjs` durante desarrollo del mapa.
const COLS = 48;
const ROWS = 30;
const WALL = 0;

function fillRect(grid, rect, tile) {
  for (let row = rect.y; row < rect.y + rect.h; row++) {
    for (let col = rect.x; col < rect.x + rect.w; col++) {
      if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) grid[row][col] = tile;
    }
  }
}

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(WALL));
const areas = [];
let nextId = 1;
function room(name, rect) {
  const tile = nextId++;
  fillRect(grid, rect, tile);
  areas.push({ name, rect, tile });
}

fillRect(grid, { x: 1, y: 13, w: 46, h: 2 }, 100);
fillRect(grid, { x: 22, y: 15, w: 2, h: 13 }, 100);
areas.push({ name: "corridor", rect: { x: 1, y: 13, w: 46, h: 2 }, tile: 100 });

room("qa", { x: 1, y: 1, w: 14, h: 11 });
room("meeting", { x: 17, y: 1, w: 13, h: 11 });
room("data", { x: 33, y: 1, w: 14, h: 11 });
room("study", { x: 1, y: 16, w: 14, h: 8 });
room("director", { x: 16, y: 16, w: 5, h: 8 });
room("freedesk", { x: 25, y: 16, w: 8, h: 8 });
room("cafeteria", { x: 34, y: 16, w: 13, h: 8 });
room("reception", { x: 14, y: 25, w: 20, h: 4 });

fillRect(grid, { x: 6, y: 12, w: 2, h: 1 }, 100);
fillRect(grid, { x: 22, y: 12, w: 2, h: 1 }, 100);
fillRect(grid, { x: 39, y: 12, w: 2, h: 1 }, 100);
fillRect(grid, { x: 6, y: 15, w: 2, h: 1 }, 100);
fillRect(grid, { x: 21, y: 19, w: 1, h: 2 }, 100);
fillRect(grid, { x: 24, y: 19, w: 1, h: 2 }, 100);
fillRect(grid, { x: 39, y: 15, w: 2, h: 1 }, 100);
fillRect(grid, { x: 20, y: 29, w: 4, h: 1 }, 100);

// Flood fill desde el spawn
const spawn = { x: 23, y: 27 };
const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
const queue = [[spawn.y, spawn.x]];
visited[spawn.y][spawn.x] = true;
let count = 0;
while (queue.length) {
  const [r, c] = queue.pop();
  count++;
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    if (visited[nr][nc]) continue;
    if (grid[nr][nc] === WALL) continue;
    visited[nr][nc] = true;
    queue.push([nr, nc]);
  }
}

console.log(`Tiles caminables alcanzados desde el spawn: ${count}`);
let totalWalkable = 0;
for (const row of grid) for (const t of row) if (t !== WALL) totalWalkable++;
console.log(`Total de tiles caminables en el mapa: ${totalWalkable}`);

let ok = true;
for (const area of areas) {
  const { x, y, w, h } = area.rect;
  let reachable = 0;
  let total = 0;
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      total++;
      if (visited[r][c]) reachable++;
    }
  }
  const status = reachable > 0 ? "OK" : "*** INALCANZABLE ***";
  if (reachable === 0) ok = false;
  console.log(`  ${area.name.padEnd(12)} tiles=${total} alcanzables=${reachable}  ${status}`);
}

if (count !== totalWalkable) {
  console.log(`\n*** ADVERTENCIA: hay ${totalWalkable - count} tiles caminables NO conectados al spawn. ***`);
  ok = false;
}

console.log(ok ? "\nMapa OK: todas las areas son alcanzables." : "\nMapa con problemas de conectividad, revisar arriba.");
process.exit(ok ? 0 : 1);
