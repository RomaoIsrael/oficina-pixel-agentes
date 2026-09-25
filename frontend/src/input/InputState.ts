/**
 * Estado de entrada unificado: teclado y controles táctiles escriben aquí,
 * y el jugador solo lee de aquí. Así no le importa de dónde vino la orden.
 */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean; // Z / Enter / Espacio / botón A
  cancel: boolean; // botón B
}

export function createInputState(): InputState {
  return { up: false, down: false, left: false, right: false, action: false, cancel: false };
}

/** Escribe en `target` el OR logico de `a` y `b` (usado para mezclar teclado + tactil). */
export function mergeInputInto(target: InputState, a: InputState, b: InputState): void {
  target.up = a.up || b.up;
  target.down = a.down || b.down;
  target.left = a.left || b.left;
  target.right = a.right || b.right;
  target.action = a.action || b.action;
  target.cancel = a.cancel || b.cancel;
}
