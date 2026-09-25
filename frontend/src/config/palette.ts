/**
 * Paleta de colores original de la oficina, inspirada en Game Boy Color pero
 * ampliada. Todos los valores son de autoría propia (ningún color literal ni
 * combinación proviene de un juego existente); solo el espíritu "pocos
 * colores planos, alto contraste" está inspirado en la estética GBC.
 *
 * Estos colores son PLACEHOLDER para la Fase 1 (motor): sirven para dibujar
 * pisos, paredes y muebles como rectángulos simples mientras no existen los
 * sprites reales (Fase 2, generador de pixel art con Pillow).
 */
export const Palette = {
  wall: 0x2b2440,
  wallTop: 0x3a3060,
  corridorFloor: 0xb9c7d6,
  doorFloor: 0xe4d9b8,

  receptionFloor: 0xead9b3,
  qaFloor: 0xf2c199,
  dataFloor: 0xa6e0dc,
  studyFloor: 0xbfe3a6,
  cafeteriaFloor: 0xf0d9a6,
  meetingFloor: 0xc9b8ec,
  directorFloor: 0xf3d17a,
  freeDeskFloor: 0xd6d6cf,

  deskWood: 0x8a5a34,
  deskWoodDark: 0x6d4426,
  chair: 0x4a4a52,
  plant: 0x4e9c53,
  plantPot: 0x8a5a34,
  window: 0xdff1ff,
  bookshelf: 0x6d4426,

  playerBody: 0x3f5ba0,
  playerAccent: 0xf2c199,

  uiBg: 0x14141c,
  uiBorder: 0xf5f5f0,
} as const;
