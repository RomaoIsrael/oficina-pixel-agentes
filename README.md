# Oficina Pixel de Agentes

Oficina virtual en pixel art (inspirada en Game Boy / Game Boy Color, pero con más
colores, animaciones fluidas y ambientación moderna) donde viven agentes de IA
conectados a programas reales. El jugador (Romao, Director) camina por la oficina como
un personaje más; cada agente tiene nombre, cargo, escritorio y su propio programa real
detrás.

Todo el arte, música y sonidos son 100% originales (solo el *estilo* de presentación
está inspirado en Game Boy/GBC; ningún sprite, melodía ni nombre proviene de Pokémon ni
de Nintendo).

## Estado del proyecto

En construcción — Fase 0 (exploración e integración). Ver `docs/` a medida que se
generen los documentos de cada fase.

## Repositorios hermanos

Este proyecto integra tres programas existentes, clonados como carpetas **hermanas**
(fuera de este repo, en `../<repo>`), nunca versionados dentro de este:

- `../Garmin_Connect_Summary` — Resumen de actividad/salud de Garmin Connect (privado).
- `../dossier-builder-qaqc` — Generador de dossiers de calidad QA/QC (Python).
- `../practica_perfiles_analistas` — Práctica de pruebas para concursos públicos (HTML).

## Arquitectura (resumen)

- **Frontend**: Vite + TypeScript + Phaser 3, pathfinding A\* (easystar.js).
- **Backend**: Python + FastAPI — orquesta agentes (API de Anthropic con tool use) y
  hace de puente hacia los tres programas reales mediante adaptadores
  (`backend/adapters/`).
- **Comunicación**: REST para acciones, WebSocket para estado en tiempo real.
- **Modos**: DEMO (datos ficticios, publicable sin exponer nada real) y REAL (conectado
  a los programas de Romao).

Más detalle en `docs/` conforme avancen las fases.

## Instalación y ejecución

Pendiente — se documentará al cerrar la Fase 1 (motor de la oficina) y la Fase 5
(conexión real), cuando exista código para instalar y ejecutar.

## Agregar un agente nuevo

Pendiente — ver `docs/AGREGAR_AGENTE.md` (se creará en fases posteriores).

## Licencia y créditos

Ver `CREDITS.md` (pendiente) para cualquier asset externo usado, si lo hubiera —
solo se usarán assets CC0, documentados ahí.
