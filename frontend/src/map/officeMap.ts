import { MAP_COLS, MAP_ROWS, TILE_SIZE } from "../config/mapConfig";

/**
 * Tipos de tile del mapa. Todos los pisos son distintos "por área" para que,
 * en la Fase 1 (sin arte real todavía), cada zona de la oficina se distinga
 * por color. En la Fase 2 cada uno de estos tipos se mapea a un tile real
 * del tileset generado.
 */
export enum TileType {
  Wall = 0,
  FloorCorridor = 1,
  FloorReception = 2,
  FloorQA = 3,
  FloorData = 4,
  FloorStudy = 5,
  FloorCafeteria = 6,
  FloorMeeting = 7,
  FloorDirector = 8,
  FloorFreeDesk = 9,
}

const WALKABLE = new Set<TileType>([
  TileType.FloorCorridor,
  TileType.FloorReception,
  TileType.FloorQA,
  TileType.FloorData,
  TileType.FloorStudy,
  TileType.FloorCafeteria,
  TileType.FloorMeeting,
  TileType.FloorDirector,
  TileType.FloorFreeDesk,
]);

export function isWalkableTile(t: TileType): boolean {
  return WALKABLE.has(t);
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AreaDef {
  id: string;
  name: string;
  rect: Rect;
  floor: TileType;
}

export type FurnitureKind = "desk" | "table" | "shelf" | "plant" | "counter" | "clock";

export interface FurnitureDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: FurnitureKind;
  /** Etiqueta opcional (ej. nombre del agente dueño del escritorio). Se usa desde la Fase 2 en adelante. */
  label?: string;
}

export interface OfficeMapData {
  cols: number;
  rows: number;
  tileSize: number;
  /** grid[fila][columna] */
  grid: TileType[][];
  areas: AreaDef[];
  furniture: FurnitureDef[];
  /** Punto de aparición del jugador, en coordenadas de tile. */
  spawn: { x: number; y: number };
}

function fillRect(grid: TileType[][], rect: Rect, tile: TileType): void {
  for (let row = rect.y; row < rect.y + rect.h; row++) {
    for (let col = rect.x; col < rect.x + rect.w; col++) {
      if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
        grid[row][col] = tile;
      }
    }
  }
}

/**
 * Construye el mapa completo de la oficina: pasillo principal + columna
 * vertical hacia recepción, las 8 áreas pedidas y la entrada principal (el
 * único punto donde se abre la pared exterior). Los "cuartos" se dibujan
 * primero como paredes (relleno base) y luego se tallan como piso; entre
 * cada cuarto y el pasillo queda 1 tile de pared que se abre como puerta.
 */
export function buildOfficeMap(): OfficeMapData {
  const cols = MAP_COLS;
  const rows = MAP_ROWS;
  const grid: TileType[][] = Array.from({ length: rows }, () => Array<TileType>(cols).fill(TileType.Wall));

  // -- Pasillo principal (horizontal) y columna hacia recepción --------
  fillRect(grid, { x: 1, y: 13, w: 46, h: 2 }, TileType.FloorCorridor);
  fillRect(grid, { x: 22, y: 15, w: 2, h: 13 }, TileType.FloorCorridor);

  const areas: AreaDef[] = [
    { id: "corridor", name: "Pasillo", rect: { x: 1, y: 13, w: 46, h: 2 }, floor: TileType.FloorCorridor },
  ];

  function room(id: string, name: string, rect: Rect, floor: TileType): void {
    fillRect(grid, rect, floor);
    areas.push({ id, name, rect, floor });
  }

  // -- Fila superior ------------------------------------------------------
  room("qa", "Área Técnica QA/QC", { x: 1, y: 1, w: 14, h: 11 }, TileType.FloorQA);
  room("meeting", "Sala de Reuniones", { x: 17, y: 1, w: 13, h: 11 }, TileType.FloorMeeting);
  room("data", "Área de Datos y Rendimiento", { x: 33, y: 1, w: 14, h: 11 }, TileType.FloorData);

  // -- Fila inferior --------------------------------------------------
  room("study", "Sala de Estudio", { x: 1, y: 16, w: 14, h: 8 }, TileType.FloorStudy);
  room("director", "Oficina del Director", { x: 16, y: 16, w: 5, h: 8 }, TileType.FloorDirector);
  room("freedesk", "Escritorios Libres", { x: 25, y: 16, w: 8, h: 8 }, TileType.FloorFreeDesk);
  room("cafeteria", "Cafetería", { x: 34, y: 16, w: 13, h: 8 }, TileType.FloorCafeteria);

  // -- Recepción (entrada principal) --------------------------------------
  room("reception", "Recepción", { x: 14, y: 25, w: 20, h: 4 }, TileType.FloorReception);

  // -- Puertas (huecos de 1-2 tiles entre cuarto y pasillo/columna) -------
  fillRect(grid, { x: 6, y: 12, w: 2, h: 1 }, TileType.FloorQA);
  fillRect(grid, { x: 22, y: 12, w: 2, h: 1 }, TileType.FloorMeeting);
  fillRect(grid, { x: 39, y: 12, w: 2, h: 1 }, TileType.FloorData);
  fillRect(grid, { x: 6, y: 15, w: 2, h: 1 }, TileType.FloorStudy);
  fillRect(grid, { x: 21, y: 19, w: 1, h: 2 }, TileType.FloorDirector);
  fillRect(grid, { x: 24, y: 19, w: 1, h: 2 }, TileType.FloorFreeDesk);
  fillRect(grid, { x: 39, y: 15, w: 2, h: 1 }, TileType.FloorCafeteria);

  // -- Entrada principal: unico hueco en la pared exterior -----------
  fillRect(grid, { x: 20, y: 29, w: 4, h: 1 }, TileType.FloorReception);

  const furniture: FurnitureDef[] = [
    { x: 3, y: 3, w: 3, h: 1, kind: "desk", label: "Ramiro" },
    { x: 36, y: 3, w: 3, h: 1, kind: "desk", label: "Vera" },
    { x: 3, y: 18, w: 3, h: 1, kind: "desk", label: "Aurelio" },
    { x: 20, y: 4, w: 6, h: 2, kind: "table" },
    { x: 17, y: 18, w: 2, h: 2, kind: "desk", label: "Romão" },
    { x: 36, y: 19, w: 4, h: 2, kind: "counter" },
    { x: 26, y: 17, w: 2, h: 1, kind: "desk" },
    { x: 30, y: 17, w: 2, h: 1, kind: "desk" },
    { x: 26, y: 21, w: 2, h: 1, kind: "desk" },
    { x: 30, y: 21, w: 2, h: 1, kind: "desk" },
    { x: 3, y: 8, w: 2, h: 2, kind: "shelf" },
    { x: 38, y: 20, w: 1, h: 1, kind: "plant" },
    { x: 15, y: 26, w: 1, h: 1, kind: "plant" },
  ];

  return {
    cols,
    rows,
    tileSize: TILE_SIZE,
    grid,
    areas,
    furniture,
    spawn: { x: 23, y: 27 },
  };
}

/** Devuelve el área (sala) a la que pertenece una posición en tiles, si hay alguna. */
export function areaAt(map: OfficeMapData, tileX: number, tileY: number): AreaDef | null {
  for (const area of map.areas) {
    const { x, y, w, h } = area.rect;
    if (tileX >= x && tileX < x + w && tileY >= y && tileY < y + h) {
      return area;
    }
  }
  return null;
}
