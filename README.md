# ProjectOps Dashboard

Panel interno para visualizar proyectos, tareas, equipo y métricas de un equipo de software. Proyecto **P3** del módulo (Sesión 8 — Angular 20/21: signals + zoneless), construido orquestando IA con foco en ingeniería de contexto.

> **Demo:** _pendiente de despliegue_ · **Docs:** [docs/architecture.md](docs/architecture.md) · [docs/prompts.md](docs/prompts.md)

## Qué demuestra este proyecto

- **Angular 21 zoneless**: sin `zone.js`; toda la reactividad viene de signals.
- **Signals de punta a punta**: `httpResource` en la capa de datos, `computed` para derivar estado, `linkedSignal` para el tema, `input()` para los parámetros de ruta.
- **Standalone + lazy loading**: cada vista se carga con `loadComponent`, sin NgModules.
- **Demo desplegable sin backend**: un interceptor HTTP sirve la API desde datos embebidos en el bundle de producción; en desarrollo la misma app habla con `json-server`.
- **Tests**: 33 tests con vitest sobre servicios, interceptor, pipes y tema.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 21 (standalone, zoneless) |
| Estado | Signals (`signal`, `computed`, `linkedSignal`, `httpResource`) |
| Estilos | SCSS con design tokens CSS (tema claro/oscuro) + Tailwind 4 |
| Charts | Chart.js via ng2-charts |
| API mock (dev) | json-server + proxy `/api` |
| API mock (prod) | Interceptor HTTP en memoria con datos embebidos |
| Tests | vitest + jsdom (`ng test`) |

## Cómo ejecutarlo

```bash
npm install

# Desarrollo: json-server (puerto 3000) + app (puerto 4200) a la vez
npm run dev

# Solo la app (espera json-server en 3000)
npm start

# Tests
npm test

# Build de producción (regenera el mock embebido desde db.json)
npm run build
```

Para probar el modo "sin backend" en local: `npx ng serve --configuration production`.

## Estructura

```
src/app/
├── core/
│   ├── models/          # Project, Task, TeamMember, Metrics
│   ├── services/        # httpResource + computeds por feature, ThemeService
│   ├── interceptors/    # mock-api.interceptor (API en memoria para prod)
│   └── data/            # mock-db.ts (generado desde db.json)
├── features/
│   ├── projects/        # board con filtros + detalle (route input binding)
│   ├── tasks/           # lista con búsqueda y filtros, CRUD
│   ├── team/            # miembros con roles y carga de trabajo
│   └── metrics/         # KPIs + 4 charts
├── layouts/             # sidebar + topbar + router-outlet
└── shared/
    ├── ui/              # modal, spinner, empty-state, sidebar, topbar
    └── pipes/           # elapsedTime, percentValue, statusLabel
```

## Datos mock

`db.json` es la única fuente de verdad:

- **Desarrollo**: `json-server` la sirve en `/api` (via proxy).
- **Producción**: `npm run sync:mock` (enganchado a `prebuild`) la embebe como `mock-db.ts` y el interceptor responde desde memoria, con CRUD funcional por sesión.

## Documentación

- [docs/architecture.md](docs/architecture.md) — decisiones de arquitectura + diagrama Mermaid: zoneless, capa de datos, tema.
- [docs/signals.md](docs/signals.md) — catálogo de señales y grafo de dependencias entre ellas.
- [docs/backlog.md](docs/backlog.md) — historias de usuario (implementadas y pendientes).
- [docs/prompts.md](docs/prompts.md) — ingeniería de contexto: qué se pidió a la IA, en qué orden y con qué contexto.
- [docs/brief.json](docs/brief.json) — brief original del proyecto.

---

Proyecto del curso Founder IA · Sesión 8 · construido con orquestación de IA (Claude Code).
