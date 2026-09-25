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

En construcción — Fase 1 (motor de la oficina): mapa completo con las 8 áreas,
colisiones, jugador (teclado + táctil), cámara y pantalla de inicio. Ver `docs/` para
los documentos de integración de la Fase 0.

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

### Frontend (motor de la oficina)

Requiere [Node.js](https://nodejs.org/) 18 o superior.

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`). Deberías
ver la pantalla de título ("OFICINA PIXEL DE AGENTES" / "PRESIONA START"); al
presionar cualquier tecla o tocar la pantalla entras a la oficina y puedes caminar
con las flechas/WASD (o la cruceta táctil en celular/tablet). El nombre del área
donde estás parado se muestra arriba a la izquierda.

Otros comandos útiles:

```bash
npm run typecheck   # solo revisa tipos, sin generar nada
npm run build        # build de producción en frontend/dist/
node scripts/validate-map.mjs   # verifica que todas las areas del mapa sean alcanzables
```

> **Nota de esta sesión**: el entorno donde se escribió este código no tiene salida a
> `registry.npmjs.org` (política de red del sandbox), así que no pude correr
> `npm install` ni ver la app corriendo acá. Sí pude validar la sintaxis con `tsc
> --noEmit` (sin resolver el paquete `phaser`, que requiere estar instalado) y la
> conectividad del mapa con `validate-map.mjs`. Por favor corre los pasos de arriba en
> tu máquina y avísame si algo no compila o se ve distinto a lo esperado.

### Backend

Pendiente — se documentará en la Fase 4/5 (chat con IA y conexión real), cuando
exista código de backend que instalar y ejecutar.

## Agregar un agente nuevo

Pendiente — ver `docs/AGREGAR_AGENTE.md` (se creará en fases posteriores).

## Licencia y créditos

Ver `CREDITS.md` (pendiente) para cualquier asset externo usado, si lo hubiera —
solo se usarán assets CC0, documentados ahí.
