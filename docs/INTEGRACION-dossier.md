# Integración: dossier-builder-qaqc (agente Ing. Ramiro Sello)

Repositorio: `RomaoIsrael/dossier-builder-qaqc` (público). Clonado como hermano en
`../dossier-builder-qaqc`. Ya verificado en su día a día: sin PDFs reales, sin
credenciales, solo ejemplos sintéticos en `examples/`.

## Qué hace

App de escritorio (PySide6) que arma un "dossier" de calidad QA/QC: toma una
plantilla PDF con marcadores (carátula, índice, páginas separadoras de sección) e
inserta documentos individuales en cada sección, aplanando (rasterizando) los que
tienen firma electrónica para que no se corrompan al combinarse, y reconstruye los
marcadores del PDF final. Genera además un manifest.json y un reporte de generación.

## Cómo se ejecuta hoy

Vía interfaz gráfica (`python main.py`) — el usuario carga la plantilla, arrastra
documentos a cada sección, configura DPI/calidad de aplanado y pulsa "Generar".
**Buena noticia para el adaptador**: toda la lógica real vive en `app/core/` y
`app/models/`, completamente desacoplada de la UI PySide6 — se puede importar y usar
sin abrir ninguna ventana.

## Entradas / salidas

| | |
|---|---|
| Entrada | Un PDF plantilla con bookmarks, N documentos PDF a insertar por sección, `ProjectSettings` (DPI, formato de imagen, patrón de nombre, etc.) |
| Salida | PDF final en `02_DOSSIER_FINAL/`, copias en `00_ORIGINALES_FIRMADOS/` y `01_DOCUMENTOS_PROCESADOS/`, `manifest.json` y `Reporte_Generacion.pdf` en `03_REPORTES/` |
| Persistencia | Proyecto portable `.dossierproj` (JSON); índice SQLite local de proyectos recientes y generaciones (`app/services/database.py`) |

## Funciones candidatas a "tool" del agente Ramiro Sello

Estas SÍ son funciones Python normales, importables directo (sin subprocess):

1. **`ProjectService.new_project(name) -> Project`** / **`build_section_tree_from_toc(toc)`**
   — crear un proyecto nuevo a partir de una plantilla PDF (extraer TOC con
   `pdf_engine.extract_toc`).
2. **`agregar_documento(project, section_id, ruta_pdf)`** — añadir un documento a una
   sección (lógica ya existente en `MainWindow._add_paths_to_section`, hay que
   extraerla de la UI a `app/core/` o replicarla en el adaptador).
3. **`validate_project(project) -> ValidationReport`** — valida antes de generar
   (errores/advertencias, ej. secciones sin documentos, firmas sin tratar).
4. **`DossierBuilder(project).generate(output_root, output_filename=None, progress_cb=...) -> GenerationResult`**
   — la función principal: arma el PDF completo. `progress_cb` encaja perfecto con
   el WebSocket de progreso en tiempo real que pide la arquitectura.
5. **`detect_signatures(path) -> SignatureInfo`** — detectar si un PDF individual
   tiene firma electrónica (para explicarle al usuario por qué algo se va a aplanar).
6. **`ProjectService.save(project, path)` / `.open(path)`** — guardar/abrir proyectos.

Encargos naturales para "ENCARGAR TAREA" con Ramiro: *"Arma el dossier del pozo
X con estos documentos"*, *"Valida el proyecto actual"*, *"¿Qué documentos tienen
firma y se van a aplanar?"*.

## Credenciales necesarias

**Ninguna.** Es 100% procesamiento local de archivos, sin llamadas a servicios
externos ni autenticación.

## Obstáculos

- **Ninguno estructural** — es el programa más fácil de adaptar de los tres, porque
  ya está desacoplado de su UI (algo que confirmamos a fondo durante su desarrollo).
- **Sí hay que decidir**: cómo llegan los archivos PDF de "cada sección" desde la
  oficina web hasta el backend (subida de archivos vía el chat/menú "ENCARGAR TAREA",
  o una carpeta que el agente observa). En **modo real** son archivos del disco de
  Romao; en **modo demo** deben ser los PDF de ejemplo sintéticos de `examples/`.
- El aplanado de firmas (`flatten_pdf`) usa PyMuPDF y puede tardar varios segundos
  por documento a 450 DPI — conviene reportar progreso real vía WebSocket, no una
  barra falsa, tal como ya hace `progress_cb` en `DossierBuilder.generate()`.
- Genera archivos reales en disco (el dossier final, backups). Toda acción que cree
  o modifique archivos debe pedir confirmación antes, como indica el requerimiento
  general — aquí el punto de confirmación natural es justo antes de llamar a
  `generate()`.
