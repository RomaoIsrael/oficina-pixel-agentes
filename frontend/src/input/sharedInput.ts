import { createInputState } from "./InputState";

/**
 * Estado de entrada táctil, compartido entre escenas. El teclado se lee
 * directo dentro de cada escena (Phaser liga el teclado a la escena activa),
 * pero el táctil vive en botones DOM montados una sola vez en main.ts, así
 * que necesita un lugar estable donde escribir sin importar qué escena esté
 * activa.
 */
export const touchInput = createInputState();
