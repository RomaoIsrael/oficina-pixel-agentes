# Integración: practica_perfiles_analistas (agente Profe Aurelio)

Repositorio: `RomaoIsrael/practica_perfiles_analistas` (público). Clonado como
hermano en `../practica_perfiles_analistas`.

⚠️ **Dato sensible encontrado** (reportado a Romao, decisión: dejarlo tal cual, no
tocar ese repo): `index.html` línea 655 tiene hardcodeado
`"contact": "romaoarlekin@gmail.com · tel. 0983886153"` y un endpoint real de Google
Apps Script (`CFG.endpoint`) al que la app envía telemetría de uso. La oficina **no
debe** copiar ni mostrar ese contacto en ningún lado del modo demo.

## Qué hace

Web app de una sola página (`index.html`, ~2 600 líneas, 380 KB) para practicar
pruebas de concursos públicos ecuatorianos (SRI, TCE, LOEI/Colegio Militar N.º 13):
conocimientos por materia (28 categorías: Código Tributario, LRTI, IVA, retenciones,
LOSEP, derecho constitucional/electoral/procesal, expresión escrita, etc.),
psicotécnicas (numérico, lógico, verbal, espacial —con figuras SVG generadas—,
abstracto, atención) y psicosociales (juicio situacional). También permite subir
archivos propios ("Mis materiales") vía `pdf.js` (cargado desde cdnjs) para generar
preguntas de apuntes del propio usuario.

## Cómo se ejecuta hoy

Se abre `index.html` directo en el navegador (o se sirve estático). Todo el estado
(usuario, progreso, respuestas) vive en `localStorage` del navegador — no hay
backend propio más allá del endpoint de telemetría opcional. Login liviano por
cédula ecuatoriana + PIN (hasheados con SHA-256 client-side, `userIdOf`/`pinHash`),
sin contraseña real ni cuenta en servidor: es más bien un identificador local que un
sistema de autenticación.

## Entradas / salidas

| | |
|---|---|
| Entrada | Selección de categoría/perfil, respuestas del usuario, PDFs propios subidos ("Mis materiales") |
| Salida | Banco de preguntas generadas/aleatorizadas en pantalla, estadísticas de progreso guardadas en `localStorage` |
| Persistencia | 100% en el navegador del usuario (`localStorage`); telemetría opcional hacia el Apps Script si `CFG.endpoint` está configurado |

## Funciones candidatas a "tool" del agente Profe Aurelio

A diferencia de los otros dos, aquí **no hay funciones Python que envolver** — todo
es JS de navegador. Las "tools" del agente serían llamadas a un servicio que replique
esa lógica, o directamente pedirle al frontend de la oficina que abra/controle la
práctica:

1. **`listar_categorias() -> [{id, name, desc}]`** — del array `CATS` (28 categorías
   + psicotécnicas + psicosociales).
2. **`generar_preguntas(categoria, n) -> [{text, opts, ans, exp}]`** — replica de
   `genOne`/`genMany`/`Q`/`QC`/`Qa`/`GQ`. El banco de preguntas de conocimientos está
   escrito como literales JS; se puede extraer a JSON y reimplementar el generador de
   psicotécnicas (numérico/espacial/abstracto, que sí es procedural) en TypeScript
   para el frontend de la oficina, o en Python para el backend si el agente debe
   "hacer 10 preguntas" dentro del chat de texto.
3. **`corregir_respuesta(pregunta_id, respuesta) -> {correcta, explicacion}`**.
4. **`cargar_material_propio(pdf) -> preguntas_generadas`** — usa `pdf.js`
   (extracción de texto) tal como ya hace la app.

Encargos naturales para "ENCARGAR TAREA" con Aurelio: *"Hazme 10 preguntas de
LOSEP"*, *"Ponme un examen de razonamiento espacial"*, *"Genera preguntas de este PDF
que te subo"*.

## Credenciales necesarias

**Ninguna** para la práctica en sí. El endpoint de telemetría (`CFG.endpoint`) es
opcional y no se replica en la oficina.

## Opciones de integración para los programas HTML (Garmin y pruebas)

Evaluadas contra: cuánto respeta "todo debe ser original", cuánto esfuerzo de
adaptación, y si funciona igual de bien en modo demo y modo real.

### (a) Extraer la lógica JS a módulos reutilizables

El backend/frontend importa funciones puras (generador de preguntas, corrector,
parser de PDF) como un paquete TS/JS independiente del HTML original.

- ✅ Máxima integración: el agente puede "conversar" sobre resultados concretos, la
  UI se ve 100% parte de la oficina (mismo estilo pixel art).
  ✅ Reutilizable tanto en modo demo (con banco de preguntas de ejemplo) como en modo
  real (banco completo).
- ❌ Requiere reescribir/portar ~2 000 líneas de JS vanilla a TS y probarlas de
  nuevo. Para `practica_perfiles_analistas` es factible (código ya limpio, sin
  dependencias raras). Para Garmin's `dashboard.html` **no aplica** — ver doc de
  Garmin, está atado al runtime de Artifacts.

### (b) Abrirlo dentro de la oficina en un panel/iframe

Al interactuar con el agente, se abre el HTML original (o una versión ligeramente
adaptada) en un panel superpuesto o iframe.

- ✅ Cero esfuerzo de portar lógica; usa el programa tal cual existe.
- ❌ Rompe la inmersión visual (salta del pixel art a una web app de diseño
  totalmente distinto) — choca con el pedido de "ambientación moderna pero
  coherente". El teléfono/correo hardcodeado en `practica_perfiles_analistas`
  quedaría visible si se embebe tal cual, salvo que se le pida a Romao limpiarlo
  antes (ya dijo que lo deje como está en el repo original, así que este modo lo
  expondría igual en la oficina — motivo adicional para preferir (a) o (c) para esa
  app si algún día importa ocultarlo).
- ❌ Para Garmin, ni siquiera es viable: el iframe no tendría acceso a
  `window.claude.use`.

### (c) Exponer su lógica desde el backend

El backend Python re-implementa o envuelve la lógica (banco de preguntas como JSON +
generador de psicotécnicas en Python; para Garmin, los scripts ya son Python así que
esto es simplemente "usar el adaptador").

- ✅ Consistente con la arquitectura ya definida (adaptadores en
  `backend/adapters/`), permite que el mismo agente responda igual desde el chat de
  texto o desde una acción del menú.
- ❌ Para las preguntas de conocimientos (texto fijo), es trabajo casi mecánico
  (extraer los literales `Q(...)` a JSON); para las psicotécnicas con figuras SVG
  generadas proceduralmente, hay que decidir si el SVG se genera en el backend y se
  manda como string, o si esa parte puntual sí vive en el frontend (más simple, ya
  que son puramente visuales y no necesitan el agente-IA para generarse).

### Recomendación

- **Garmin (Vera)**: opción única real es la (c) para los scripts Python, más una
  visualización nueva en el frontend (ver `INTEGRACION-garmin.md`). Las opciones (a)
  y (b) no aplican por la dependencia de Artifacts de `dashboard.html`.
- **Pruebas (Aurelio)**: combinar (a) para el generador de preguntas y el corrector
  (se porta bien, queda 100% integrado visualmente) con una parte de (c) si el
  agente necesita generar preguntas desde el chat de texto sin abrir el panel
  visual. Se descarta (b) por romper la coherencia visual pixel art.
