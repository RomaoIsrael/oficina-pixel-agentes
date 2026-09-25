import type { InputState } from "./InputState";

/** Detecta si conviene mostrar los controles táctiles (sin teclado físico fiable). */
export function isLikelyTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Conecta la cruceta y los botones A/B del DOM (ver index.html) al InputState
 * compartido. Los botones son elementos HTML superpuestos al canvas (no
 * sprites de Phaser) para que respondan a multitouch de forma confiable en
 * cualquier navegador móvil.
 */
export function setupTouchControls(input: InputState): void {
  if (!isLikelyTouchDevice()) return;

  document.body.classList.add("touch-active");
  const container = document.getElementById("touch-controls");
  if (!container) return;

  const dirKeys: Record<string, keyof InputState> = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
  };

  container.querySelectorAll<HTMLElement>("[data-dir]").forEach((el) => {
    const dir = el.dataset.dir as string;
    const key = dirKeys[dir];
    if (!key) return;
    const press = (e: Event) => {
      e.preventDefault();
      input[key] = true;
      el.classList.add("pressed");
    };
    const release = (e: Event) => {
      e.preventDefault();
      input[key] = false;
      el.classList.remove("pressed");
    };
    el.addEventListener("pointerdown", press);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("pointerleave", release);
  });

  container.querySelectorAll<HTMLElement>("[data-action]").forEach((el) => {
    const action = el.dataset.action === "a" ? "action" : "cancel";
    const press = (e: Event) => {
      e.preventDefault();
      input[action] = true;
      el.classList.add("pressed");
    };
    const release = (e: Event) => {
      e.preventDefault();
      input[action] = false;
      el.classList.remove("pressed");
    };
    el.addEventListener("pointerdown", press);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("pointerleave", release);
  });
}
