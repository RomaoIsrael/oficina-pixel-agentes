import Phaser from "phaser";
import type { InputState } from "../input/InputState";

export type Facing = "up" | "down" | "left" | "right";

const SPEED = 90; // px/seg — velocidad de paseo normal.
const WALK_FRAME_MS = 160; // cada cuanto alterna el frame de "piernas" al caminar.

/**
 * El jugador (Romão, Director). En la Fase 1 usa una textura placeholder
 * generada por código (ver BootScene); la Fase 2 la reemplaza por el sprite
 * sheet real con animaciones de caminar en 4 direcciones.
 *
 * El "ciclo de caminata" cambia de frame dentro del atlas "player-atlas"
 * (ver BootScene.generatePlayerAtlas) con setTexture(key, frame), en vez de
 * usar this.anims.play() — más simple y predecible mientras no haya un
 * spritesheet real (Fase 2).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: Facing = "down";
  private input: InputState;
  private walkFrameTimer = 0;
  private walkFrameIndex: 0 | 1 = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, input: InputState) {
    super(scene, x, y, "player-atlas", "down-0");
    this.input = input;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Hitbox un poco más chica que el sprite completo, centrada en los pies,
    // para que se pueda "asomar" visualmente sobre paredes/muebles sin que
    // la colisión se sienta injusta (truco clásico de los juegos top-down).
    body.setSize(10, 8);
    body.setOffset(3, 12);
    body.setCollideWorldBounds(true);
  }

  update(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.input.left) vx -= 1;
    if (this.input.right) vx += 1;
    if (this.input.up) vy -= 1;
    if (this.input.down) vy += 1;

    if (vx !== 0 && vy !== 0) {
      const inv = Math.SQRT1_2;
      vx *= inv;
      vy *= inv;
    }

    body.setVelocity(vx * SPEED, vy * SPEED);

    const moving = vx !== 0 || vy !== 0;

    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? "right" : "left";
      } else {
        this.facing = vy > 0 ? "down" : "up";
      }
      this.walkFrameTimer += delta;
      if (this.walkFrameTimer >= WALK_FRAME_MS) {
        this.walkFrameTimer = 0;
        this.walkFrameIndex = this.walkFrameIndex === 0 ? 1 : 0;
      }
    } else {
      this.walkFrameTimer = 0;
      this.walkFrameIndex = 0;
    }

    this.setTexture("player-atlas", `${this.facing}-${this.walkFrameIndex}`);
  }
}
