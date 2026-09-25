# Integración: Garmin_Connect_Summary (agente Vera Pulso)

Repositorio: `RomaoIsrael/Garmin_Connect_Summary` (**privado**), carpeta `garmin-ai/`.
Clonado como hermano en `../Garmin_Connect_Summary`.

## Qué hace

Sincroniza datos de bienestar y actividad física desde Garmin Connect (la cuenta
personal de Romao) y genera notas en markdown más un reporte de salud con
recomendación de rutina de entrenamiento. Es un conjunto de **scripts Python de línea
de comandos**, sin servidor ni API propia — cada script se ejecuta una vez y termina.

También existe `dashboard.html`, pero **no es una web app portable**: ver el
apartado "Obstáculo principal" más abajo.

## Cómo se ejecuta hoy

1. **Login (una sola vez, o cuando el token expira)**: `python login_garmin.py`
   - Lee email/contraseña desde `.garmin_credentials.json` (temporal, se borra
     apenas se lee).
   - Si Garmin pide MFA, escribe `ESPERANDO_CODIGO_MFA` en `.login_status.txt` y
     espera hasta 10 minutos a que aparezca un código en `.mfa_code.txt`.
   - Guarda el token de sesión en `.garmin_tokens/` (nunca la contraseña).
2. **Sincronizar**: `python sync_garmin.py --dias 3`
   - Usa el token guardado (no vuelve a pedir credenciales).
   - Trae bienestar (sueño, HRV, estrés, Body Battery, disposición para entrenar,
     VO2 Max, respiración, minutos de intensidad) y actividades recientes.
   - Escribe una nota `.md` por día en `garmin/bienestar/` y una por actividad en
     `garmin/actividades/`, más un `garmin/data.json` consolidado.
3. **Reporte**: `python reporte.py`
   - Lee `garmin/data.json`, calcula promedios/tendencias y genera
     `garmin/reporte_salud.md` con recomendación de rutina semanal.

## Entradas / salidas

| | |
|---|---|
| Entrada | Credenciales Garmin (solo en el login inicial), código MFA cuando se pide, `--dias N` |
| Salida | `garmin/bienestar/<fecha>.md`, `garmin/actividades/<fecha>_<slug>.md`, `garmin/data.json`, `garmin/reporte_salud.md` |
| Persistencia entre corridas | `.garmin_tokens/` (token de sesión, no la contraseña) |

## Funciones candidatas a "tool" del agente Vera Pulso

Ninguna de las tres es actualmente una función Python importable con retorno
estructurado — son scripts con `if __name__ == "__main__"`. Para exponerlas como
tools hace falta un adaptador delgado en `backend/adapters/garmin_adapter.py` que:

1. **`garmin_login(email, password) -> {status, needs_mfa}`**
   envuelve `login_garmin.py` (subprocess o refactor a función), maneja el archivo
   de credenciales temporal, y si pide MFA deja el flujo abierto para que la oficina
   pida el código al jugador (cuadro de diálogo) y lo escriba en `.mfa_code.txt`.
2. **`garmin_submit_mfa(code) -> {status}`** — escribe el código y desbloquea el login.
3. **`garmin_sync(dias=3) -> {bienestar: {...}, actividades: [...]}`** — envuelve
   `sync_garmin.py`, devuelve el `data.json` ya parseado.
4. **`garmin_reporte() -> {markdown, resumen_stats}`** — envuelve `reporte.py`,
   devuelve el reporte generado (y opcionalmente valores clave sueltos: pasos
   promedio, RHR, tendencia, etc. para que el agente los mencione en el chat sin
   tener que parsear markdown).

Encargos naturales para "ENCARGAR TAREA" con Vera: *"Sincroniza mis últimos 7 días"*,
*"Dame mi reporte de salud y rutina sugerida"*, *"¿Cómo dormí anoche?"* (léelo de la
última nota de bienestar sin resincronizar).

## Credenciales necesarias (solo nombres, sin valores)

- `GARMIN_EMAIL` / `GARMIN_PASSWORD` — solo se usan una vez para el login inicial;
  después basta el token guardado en `.garmin_tokens/`. En **modo real** deben vivir
  únicamente en `.env` del backend, nunca en el frontend.
- Ninguna credencial para `sync_garmin.py` ni `reporte.py` (usan el token ya guardado).

## Obstáculo principal: `dashboard.html` está atado al runtime de Claude Artifacts

`dashboard.html` (57 KB) usa `window.claude.use("db")` y `window.claude.use("mcp")`
— es un **Artifact de Claude con base de datos en vivo y envío de correo**, no una web
app autocontenida. No se puede:
- Extraer su JS a un módulo reutilizable normal (perdería el acceso a `db`/`mcp`).
- Embeberlo en un iframe de la oficina esperando que funcione igual (esos
  `window.claude.*` no existen fuera del runtime de Artifacts).

**Decisión recomendada**: no reutilizar `dashboard.html` dentro de la oficina.
En su lugar, el frontend de la oficina (Phaser + un panel HTML superpuesto) dibuja
**su propia visualización**, nueva, alimentada por el JSON que devuelve
`garmin_sync()`/`garmin_reporte()` a través del backend — inspirada en el diseño del
dashboard existente (colores, tipo de gráficos) pero sin ninguna dependencia del
runtime de Artifacts. Esto es autoría 100% nueva, coherente con el requisito de
"todo el arte y la interfaz deben ser originales".

## Otras notas

- Las series de datos personales de salud (`garmin/`) están correctamente excluidas
  del control de versiones (`.gitignore` del propio repo) — no hay datos reales de
  Romao commiteados en el repositorio.
- La zona horaria está fijada a `America/Bogota` en `common.py` — revisar si debe
  ser configurable o si sirve tal cual para el modo real.
- En **modo demo**, `garmin_sync`/`garmin_reporte` deben responder con datos
  ficticios (mock) generados localmente, sin tocar `garminconnect` ni ninguna
  credencial real.
