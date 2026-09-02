# Ingeniería de contexto — cómo se orquestó la IA

Este documento registra **qué se pidió a la IA, en qué orden y con qué contexto** para llevar el proyecto de "generado en clase" a "estándar profesional". Es el entregable de ingeniería de contexto de la Sesión 8: el valor no está en los prompts literales sino en la estrategia — qué contexto se carga antes de pedir nada, en qué orden se piden las cosas y qué se verifica después de cada paso.

## Fase 0 — Generación en clase (punto de partida)

El esqueleto se generó en la sesión con un brief estructurado ([brief.json](brief.json)): entidades, vistas y endpoints. De ahí salió un proyecto funcional con servicios basados en `signal` + `computed`, componentes standalone con lazy loading y json-server como API mock.

**Lección de contexto:** dar a la IA el modelo de dominio (entidades + relaciones + endpoints) antes que ningún detalle visual produce una arquitectura consistente a la primera. Lo visual se itera barato; el modelo de dominio, no.

## Fase 1 — Análisis antes que código

Primer prompt de la fase de profesionalización: *"revisa qué podemos rescatar de esta carpeta"* — deliberadamente **sin** pedir código todavía.

La IA leyó el proyecto completo (servicios, componentes, config, git) y produjo un diagnóstico: qué estaba bien (arquitectura, signals), qué faltaba (tests, docs, deploy) y qué estaba roto (artefactos de `tsc` ensuciando `src/`, un `computed` no reactivo en el topbar). Ese diagnóstico se convirtió en el plan de fases.

**Lección:** pedir diagnóstico y plan antes que código convierte a la IA de generador a ingeniero. El bug del topbar (invisible en runtime con Zone.js) apareció en esta lectura, no ejecutando la app.

## Fase 2 — Orden de las peticiones

El orden importó tanto como el contenido:

1. **Limpieza primero** (artefactos compilados, `.gitignore`) — trabajar sobre repo sucio contamina cada diff posterior.
2. **Capa de datos** (`httpResource` + interceptor mock + entornos) — es la pieza de la que depende todo lo demás; los componentes se simplifican como efecto colateral (desaparecen los `loadAll()`).
3. **UI transversal** (tokens + tema) — un barrido mecánico de colores→variables hecho con `sed`, no a mano: 15 ficheros en una pasada, verificable con `grep`.
4. **Tests** — después del refactor, para testear el contrato final y no tirar specs.
5. **Docs** — al final, cuando describen lo que existe de verdad.

Cada fase terminó en un commit con mensaje que explica el porqué, y con verificación antes de commitear: `ng build` tras el refactor, screenshots en navegador (claro/oscuro, 4 vistas) tras el tema, `ng test` en verde tras los specs.

## Fase 3 — Contexto que se le dio a la IA en cada petición

| Petición | Contexto cargado antes |
|----------|------------------------|
| Diagnóstico inicial | Árbol completo del repo, `package.json`, `git log`, código fuente de servicios y componentes |
| Migración a httpResource | Los 4 servicios existentes completos (para preservar su API pública y no romper componentes) |
| Interceptor mock | `db.json` real (ids incluidos), contrato de json-server observado en los servicios |
| Modo oscuro | Inventario de todos los hex usados (via grep) antes de decidir el mapa de tokens |
| Tests | Ids reales de `db.json` verificados antes de escribir aserciones (el primer intento asumió `member-1`; era `tm-1`) |

**Lección:** cada prompt de generación fue precedido por una lectura dirigida. La IA nunca escribió contra una API imaginada — siempre contra el código o los datos reales, verificados en el paso anterior.

## Fase 4 — Qué se verificó y qué salió mal

Registro honesto de las iteraciones (nada salió perfecto a la primera):

- `sync-mock.mjs` importó `fileURLToPath` del módulo equivocado (`node:path` en vez de `node:url`) → detectado al ejecutarlo, no al leerlo.
- El barrido de colores dejó fuera `chart-wrapper.component.ts` → detectado en el screenshot de Metrics en dark (tarjetas blancas), no en el build.
- vitest no arrancaba con el pool por defecto (`forks`) en el entorno sandboxed → cambiado a `threads` via `runnerConfig`.
- El test del detalle de proyecto usó un id inventado (`p1`) → la vista mostró "Project not found" y obligó a verificar los ids reales (`proj-1`).

**Lección final:** la orquestación no es prompt → código → siguiente. Es prompt → código → **ejecutar/mirar/testear** → corregir → commit. Cada error de la lista lo encontró una verificación, no una relectura.
