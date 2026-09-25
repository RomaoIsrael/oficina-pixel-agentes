/** Tamaño de tile en píxeles. 16x16, como los tiles clásicos de GB/GBC. */
export const TILE_SIZE = 16;

/** Dimensiones de la grilla del mapa (en tiles). */
export const MAP_COLS = 48;
export const MAP_ROWS = 30;

export const MAP_WIDTH_PX = MAP_COLS * TILE_SIZE;
export const MAP_HEIGHT_PX = MAP_ROWS * TILE_SIZE;

/** Resolución virtual base del juego (antes de escalar). 3:1.6875 ~ 16:9. */
export const VIRTUAL_WIDTH = 480;
export const VIRTUAL_HEIGHT = 270;
