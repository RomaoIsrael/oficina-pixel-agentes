import Phaser from "phaser";
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "../config/mapConfig";
import { Palette } from "../config/palette";

/** Pantalla de inicio: título + "PRESIONA START" parpadeante. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(Palette.uiBg);

    this.add
      .text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 30, "OFICINA PIXEL\nDE AGENTES", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 50, "PRESIONA START", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#f2c199",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.15 },
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 14, "v0.1 — motor en construcción", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#8a8a92",
      })
      .setOrigin(0.5);

    const startGame = () => this.scene.start("Office");
    this.input.keyboard?.once("keydown", startGame);
    this.input.once("pointerdown", startGame);
  }
}
