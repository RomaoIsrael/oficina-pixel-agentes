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
    this.generatePlayerAtlas();
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

  /**
   * Jugador: 16x20 (un poco más alto que ancho, como los sprites GB
   * clásicos). En vez de usar `Graphics.generateTexture()` por frame (que
   * en algunos navegadores/GPU con el renderer WebGL termina generando
   * texturas sin datos válidos y revienta al hacer setTexture/anims.play
   * con "Cannot set properties of undefined (setting 'width')"), se dibuja
   * TODO en un único <canvas> 2D normal — el mismo mecanismo con el que
   * cualquier imagen llega a Phaser — y se registra como un atlas con un
   * frame nombrado por cada combinación (dirección, paso de caminata).
   * `Player` hace `setTexture("player-atlas", "down-0")`, etc.
   */
  private generatePlayerAtlas(): void {
    const w = 16;
    const h = 20;
    const facings: Facing[] = ["down", "up", "left", "right"];

    const canvas = document.createElement("canvas");
    canvas.width = w * facings.length;
    canvas.height = h * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo crear el contexto 2D para el atlas del jugador.");
    }

    const bodyColor = `#${Palette.playerBody.toString(16).padStart(6, "0")}`;
    const accentColor = `#${Palette.playerAccent.toString(16).padStart(6, "0")}`;

    facings.forEach((facing, col) => {
      for (const frame of [0, 1]) {
        const ox = col * w;
        const oy = frame * h;

        // Cuerpo.
        ctx.fillStyle = bodyColor;
        ctx.fillRect(ox + 2, oy + 4, w - 4, h - 8);
        // Cabeza.
        ctx.fillStyle = "#f0c8a0";
        ctx.beginPath();
        ctx.arc(ox + w / 2, oy + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        // Indicador de dirección (mirada).
        ctx.fillStyle = accentColor;
        const eyeOffset = frame === 0 ? 0 : 1;
        if (facing === "down") ctx.fillRect(ox + w / 2 - 3, oy + 5 + eyeOffset, 6, 2);
        if (facing === "up") ctx.fillRect(ox + w / 2 - 3, oy + 2, 6, 2);
        if (facing === "left") ctx.fillRect(ox + 2, oy + 5 + eyeOffset, 4, 2);
        if (facing === "right") ctx.fillRect(ox + w - 6, oy + 5 + eyeOffset, 4, 2);
        // "Piernas" alternadas para simular caminata.
        if (frame === 0) {
          ctx.fillRect(ox + 3, oy + h - 5, 3, 4);
          ctx.fillRect(ox + w - 6, oy + h - 6, 3, 4);
        } else {
          ctx.fillRect(ox + 3, oy + h - 6, 3, 4);
          ctx.fillRect(ox + w - 6, oy + h - 5, 3, 4);
        }
      }
    });

    this.textures.addCanvas("player-atlas", canvas);
    const texture = this.textures.get("player-atlas");
    facings.forEach((facing, col) => {
      for (const frame of [0, 1]) {
        texture.add(`${facing}-${frame}`, 0, col * w, frame * h, w, h);
      }
    });
  }
}
