import Phaser from "phaser";
import { TILE_SIZE, MAP_WIDTH_PX, MAP_HEIGHT_PX } from "../config/mapConfig";
import { buildOfficeMap, TileType, areaAt, type OfficeMapData } from "../map/officeMap";
import { Player } from "../entities/Player";
import { createInputState, mergeInputInto } from "../input/InputState";
import { touchInput } from "../input/sharedInput";

/** Genera rectángulos de colisión fusionando corridas horizontales de tiles
 * de pared contiguos, en vez de un body por tile — mucho más liviano para
 * Arcade Physics con un mapa de 48x30. */
function buildWallRects(map: OfficeMapData): Phaser.Geom.Rectangle[] {
  const rects: Phaser.Geom.Rectangle[] = [];
  for (let row = 0; row < map.rows; row++) {
    let runStart = -1;
    for (let col = 0; col <= map.cols; col++) {
      const isWall = col < map.cols && map.grid[row][col] === TileType.Wall;
      if (isWall && runStart === -1) {
        runStart = col;
      } else if (!isWall && runStart !== -1) {
        rects.push(
          new Phaser.Geom.Rectangle(
            runStart * TILE_SIZE,
            row * TILE_SIZE,
            (col - runStart) * TILE_SIZE,
            TILE_SIZE
          )
        );
        runStart = -1;
      }
    }
  }
  return rects;
}

export class OfficeScene extends Phaser.Scene {
  private player!: Player;
  private map!: OfficeMapData;
  private keyboardInput = createInputState();
  private mergedInput = createInputState();
  private keys!: {
    up: Phaser.Input.Keyboard.Key[];
    down: Phaser.Input.Keyboard.Key[];
    left: Phaser.Input.Keyboard.Key[];
    right: Phaser.Input.Keyboard.Key[];
    action: Phaser.Input.Keyboard.Key[];
    cancel: Phaser.Input.Keyboard.Key[];
  };
  private currentAreaLabel!: Phaser.GameObjects.Text;
  private currentAreaId: string | null = null;

  constructor() {
    super("Office");
  }

  create(): void {
    this.map = buildOfficeMap();
    this.setupKeyboard();
    this.drawFloor();
    const wallRects = buildWallRects(this.map);
    const wallGroup = this.physics.add.staticGroup();
    for (const rect of wallRects) {
      const body = this.add.rectangle(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height);
      this.physics.add.existing(body, true);
      wallGroup.add(body);
    }

    const furnitureGroup = this.drawFurniture();

    const spawnX = this.map.spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = this.map.spawn.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY, this.mergedInput);
    this.physics.add.collider(this.player, wallGroup);
    this.physics.add.collider(this.player, furnitureGroup);

    this.physics.world.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.roundPixels = true;

    this.currentAreaLabel = this.add
      .text(8, 8, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ffffff",
        backgroundColor: "#14141ccc",
        padding: { x: 6, y: 3 },
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) {
      this.keys = { up: [], down: [], left: [], right: [], action: [], cancel: [] };
      return;
    }
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: [kb.addKey(K.UP), kb.addKey(K.W)],
      down: [kb.addKey(K.DOWN), kb.addKey(K.S)],
      left: [kb.addKey(K.LEFT), kb.addKey(K.A)],
      right: [kb.addKey(K.RIGHT), kb.addKey(K.D)],
      action: [kb.addKey(K.Z), kb.addKey(K.ENTER), kb.addKey(K.SPACE)],
      cancel: [kb.addKey(K.X), kb.addKey(K.ESC)],
    };
  }

  private anyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((k) => k.isDown);
  }

  private drawFloor(): void {
    for (let row = 0; row < this.map.rows; row++) {
      for (let col = 0; col < this.map.cols; col++) {
        const tile = this.map.grid[row][col];
        this.add
          .image(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, `tile-${tile}`)
          .setDepth(0);
      }
    }
  }

  private drawFurniture(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();
    for (const item of this.map.furniture) {
      const px = item.x * TILE_SIZE;
      const py = item.y * TILE_SIZE;
      const w = item.w * TILE_SIZE;
      const h = item.h * TILE_SIZE;
      for (let ty = 0; ty < item.h; ty++) {
        for (let tx = 0; tx < item.w; tx++) {
          this.add
            .image(px + tx * TILE_SIZE + TILE_SIZE / 2, py + ty * TILE_SIZE + TILE_SIZE / 2, `furniture-${item.kind}`)
            .setDepth(py + h);
        }
      }
      const body = this.add.rectangle(px + w / 2, py + h / 2, w, h);
      body.setVisible(false);
      this.physics.add.existing(body, true);
      group.add(body);

      if (item.label) {
        this.add
          .text(px + w / 2, py - 2, item.label, {
            fontFamily: "monospace",
            fontSize: "7px",
            color: "#ffffff",
          })
          .setOrigin(0.5, 1)
          .setDepth(py + h + 1);
      }
    }
    return group;
  }

  update(_time: number, delta: number): void {
    this.keyboardInput.up = this.anyDown(this.keys.up);
    this.keyboardInput.down = this.anyDown(this.keys.down);
    this.keyboardInput.left = this.anyDown(this.keys.left);
    this.keyboardInput.right = this.anyDown(this.keys.right);
    this.keyboardInput.action = this.anyDown(this.keys.action);
    this.keyboardInput.cancel = this.anyDown(this.keys.cancel);

    mergeInputInto(this.mergedInput, this.keyboardInput, touchInput);

    this.player.update(delta);
    this.player.setDepth(this.player.y);

    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);
    const area = areaAt(this.map, tileX, tileY);
    if (area && area.id !== this.currentAreaId) {
      this.currentAreaId = area.id;
      this.currentAreaLabel.setText(area.name);
    }
  }
}
