import Phaser from "phaser";
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./config/mapConfig";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { OfficeScene } from "./scenes/OfficeScene";
import { setupTouchControls, isLikelyTouchDevice } from "./input/TouchControls";
import { touchInput } from "./input/sharedInput";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0a0a12",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, OfficeScene],
};

new Phaser.Game(config);

setupTouchControls(touchInput);

// Sugerencia de girar el celular en modo retrato (solo pantallas chicas: en
// tablet/PC, aunque sea "vertical" por ventana angosta, no tiene sentido).
function updateRotateHint(): void {
  const hint = document.getElementById("rotate-hint");
  if (!hint) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 500;
  const shouldShow = isLikelyTouchDevice() && isPortrait && isSmallScreen;
  hint.classList.toggle("visible", shouldShow);
}

window.addEventListener("resize", updateRotateHint);
window.addEventListener("orientationchange", updateRotateHint);
updateRotateHint();
