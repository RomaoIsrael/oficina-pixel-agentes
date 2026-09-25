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
colisiones, jugador y los tres agentes (teclado + táctil), cámara y pantalla de inicio.
Ver `docs/` para los documentos de integración de la Fase 0.

## Repositorios hermanos

Este proyecto integra tres programas existentes, clonados como carpetas **hermanas**
(fuera de este repo, en `../<repo>`), nunca versionados dentro de este:

- `../Garmin_Connect_Summary` — Resumen de actividad/salud de Garmin Connect (privado).
- `../dossier-builder-qaqc` — Generador de dossiers de calidad QA/QC (Python).
- `../practica_perfiles_analistas` — Práctica de pruebas para concursos públicos (HTML).

## Arquitectura (resumen)

- **Motor de la oficina**: un solo archivo HTML (`oficina.html`) con JavaScript plano y
  Canvas 2D — **sin Node, sin npm, sin paso de compilación**. Se abre directo con doble
  clic en el navegador, igual que `Garmin_Connect_Summary/garmin-ai/dashboard.html` y
  `practica_perfiles_analistas/index.html`. Se eligió este enfoque (en vez de
  Vite + TypeScript + Phaser 3, usado en un primer intento) porque requería instalar
  Node.js y depender de WebGL, lo que causó varios problemas en equipos corporativos
  restringidos — ver el historial de commits para el detalle de esa iteración.
- **Backend**: Python + FastAPI — orquesta agentes (API de Anthropic con tool use) y
  hace de puente hacia los tres programas reales mediante adaptadores
  (`backend/adapters/`).
- **Comunicación**: REST para acciones, WebSocket para estado en tiempo real.
- **Modos**: DEMO (datos ficticios, publicable sin exponer nada real) y REAL (conectado
  a los programas de Romao).

Más detalle en `docs/` conforme avancen las fases.

## Instalación y ejecución

### Motor de la oficina

**No requiere instalar nada.** Descarga (o clona) este repositorio y abre
`oficina.html` con doble clic — se abre en tu navegador por defecto.

Deberías ver la pantalla de título ("OFICINA PIXEL DE AGENTES" / "PRESIONA START"); al
presionar cualquier tecla o tocar la pantalla entras a la oficina y puedes caminar con
las flechas/WASD (o la cruceta táctil en celular/tablet). El nombre del área donde
estás parado se muestra arriba a la izquierda. Vera, Ramiro y Aurelio ya aparecen de
pie junto a su escritorio (todavía sin rutinas ni diálogo — eso llega en fases
siguientes).

> **Nota de esta sesión**: el entorno donde se escribió este código no tiene salida a
> internet para descargar paquetes (ni npm ni pip), así que la verificación se hizo con
> `node --check` (sintaxis de JavaScript) y comparando las coordenadas del mapa contra
> la versión anterior ya validada con un flood-fill (todas las áreas alcanzables desde
> la recepción). No pude abrir el archivo en un navegador real acá — pruébalo en tu
> máquina y avísame si algo no se ve como se espera.

### Backend

Pendiente — se documentará en la Fase 4/5 (chat con IA y conexión real), cuando
exista código de backend que instalar y ejecutar.

## Agregar un agente nuevo

Pendiente — ver `docs/AGREGAR_AGENTE.md` (se creará en fases posteriores).

## Licencia y créditos

Ver `CREDITS.md` (pendiente) para cualquier asset externo usado, si lo hubiera —
solo se usarán assets CC0, documentados ahí.
