import Phaser from "phaser";
import { TILE_SIZE } from "../config/mapConfig";
import { Palette } from "../config/palette";
import { TileType } from "../map/officeMap";
import type { Facing } from "../entities/Player";

const TILE_COLORS: Record<TileType, number> = {
  [TileType.Wall]: Palette.wall,
  [TileType.FloorCorridor]: Palette.corridorFloor,
  [TileType.FloorReception]: Palette.receptionFloor,
  [TileType.FloorQA]: Palette.qaFloor,
  [TileType.FloorData]: Palette.dataFloor,
  [TileType.FloorStudy]: Palette.studyFloor,
  [TileType.FloorCafeteria]: Palette.cafeteriaFloor,
  [TileType.FloorMeeting]: Palette.meetingFloor,
  [TileType.FloorDirector]: Palette.directorFloor,
  [TileType.FloorFreeDesk]: Palette.freeDeskFloor,
};

const FURNITURE_COLORS: Record<string, number> = {
  desk: Palette.deskWood,
  table: Palette.deskWood,
  shelf: Palette.bookshelf,
  plant: Palette.plant,
  counter: Palette.deskWoodDark,
  clock: Palette.uiBorder,
};

/**
 * Genera TODAS las texturas placeholder por código (rectángulos de color, sin
 * archivos de imagen) para poder probar el motor completo (Fase 1) antes de
 * que exista el generador de sprites reales (Fase 2, scripts Python +
 * Pillow). Cambiar de placeholders a arte real en la Fase 2 no debería
 * requerir tocar ninguna otra escena: basta con reemplazar lo que se genera
 * aquí por `this.load.spritesheet(...)`.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    // Nada que cargar desde archivos todavía — todo se genera en create().
  }

  create(): void {
    this.generateTileTextures();
    this.generateFurnitureTextures();
    this.generatePlayerTextures();
    this.generatePlayerAnimations();
    this.scene.start("Title");
  }

  private generateTileTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    for (const [type, color] of Object.entries(TILE_COLORS)) {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      // Borde sutil para distinguir tiles individuales dentro de una misma sala.
      g.lineStyle(1, 0x000000, 0.08);
      g.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      if (Number(type) === TileType.Wall) {
        g.fillStyle(Palette.wallTop, 1);
        g.fillRect(0, 0, TILE_SIZE, 4);
      }
      g.generateTexture(`tile-${type}`, TILE_SIZE, TILE_SIZE);
    }
    g.destroy();
  }

  private generateFurnitureTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    for (const [kind, color] of Object.entries(FURNITURE_COLORS)) {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 3);
      g.lineStyle(1, 0x000000, 0.25);
      g.strokeRoundedRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1, 3);
      g.generateTexture(`furniture-${kind}`, TILE_SIZE, TILE_SIZE);
    }
    g.destroy();
  }

  /** Jugador: 16x20 (un poco más alto que ancho, como los sprites GB clásicos). */
  private generatePlayerTextures(): void {
    const w = 16;
    const h = 20;
    const facings: Facing[] = ["down", "up", "left", "right"];
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    for (const facing of facings) {
      for (const frame of [0, 1]) {
        g.clear();
        // Cuerpo.
        g.fillStyle(Palette.playerBody, 1);
        g.fillRoundedRect(2, 4, w - 4, h - 8, 3);
        // Cabeza.
        g.fillStyle(0xf0c8a0, 1);
        g.fillCircle(w / 2, 6, 5);
        // Indicador de direccion (mirada).
        g.fillStyle(Palette.playerAccent, 1);
        const eyeOffset = frame === 0 ? 0 : 1;
        if (facing === "down") g.fillRect(w / 2 - 3, 5 + eyeOffset, 6, 2);
        if (facing === "up") g.fillRect(w / 2 - 3, 2, 6, 2);
        if (facing === "left") g.fillRect(2, 5 + eyeOffset, 4, 2);
        if (facing === "right") g.fillRect(w - 6, 5 + eyeOffset, 4, 2);
        // "Piernas" alternadas para simular caminata (frame 0 / frame 1).
        g.fillStyle(Palette.playerAccent, 1);
        if (frame === 0) {
          g.fillRect(3, h - 5, 3, 4);
          g.fillRect(w - 6, h - 6, 3, 4);
        } else {
          g.fillRect(3, h - 6, 3, 4);
          g.fillRect(w - 6, h - 5, 3, 4);
        }
        g.generateTexture(`player-${facing}-${frame}`, w, h);
      }
    }
    // Textura "por defecto" usada al crear el sprite antes de reproducir animación.
    g.clear();
    g.fillStyle(Palette.playerBody, 1);
    g.fillRoundedRect(2, 4, w - 4, h - 8, 3);
    g.fillStyle(0xf0c8a0, 1);
    g.fillCircle(w / 2, 6, 5);
    g.generateTexture("player-placeholder", w, h);
    g.destroy();
  }

  /**
   * Crea las animaciones "walk-*" e "idle-*" a partir de las texturas
   * generadas arriba. Usa dos texturas independientes como si fueran los
   * frames 0 y 1 de un spritesheet — Phaser lo permite referenciando cada
   * frame por su propia texture key. En la Fase 2, con un spritesheet real,
   * solo cambia de dónde salen esos frames; las claves de animación
   * ("walk-down", "idle-up", etc.) quedan iguales para no tocar Player.ts.
   */
  private generatePlayerAnimations(): void {
    const facings: Facing[] = ["down", "up", "left", "right"];
    for (const facing of facings) {
      this.anims.create({
        key: `walk-${facing}`,
        frames: [{ key: `player-${facing}-0` }, { key: `player-${facing}-1` }],
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-${facing}`,
        frames: [{ key: `player-${facing}-0` }],
        frameRate: 1,
      });
    }
  }
}
