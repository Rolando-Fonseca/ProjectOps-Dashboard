# Backlog — ProjectOps Dashboard

Historias de usuario del producto. Las marcadas ✅ están implementadas en la versión actual; las ⏳ son el backlog real para iteraciones futuras.

## Implementadas

**HU-1 · Ver el estado de todos los proyectos** ✅
Como *manager del equipo*, quiero ver todos los proyectos con su estado y progreso en una sola vista, para saber de un vistazo qué avanza y qué está bloqueado.
*Criterios:* tarjetas con estado, barra de progreso y contadores; filtros por estado; resumen agregado (progreso medio, completados, en pausa).

**HU-2 · Profundizar en un proyecto** ✅
Como *manager*, quiero abrir un proyecto y ver sus tareas y su equipo asignado, para evaluar su salud sin preguntar a nadie.
*Criterios:* ruta propia (`/projects/:id`) enlazable; tareas con estado y prioridad; miembros con rol; manejo de id inexistente.

**HU-3 · Gestionar tareas** ✅
Como *miembro del equipo*, quiero crear, editar y borrar tareas con estado, prioridad, proyecto y asignado, para mantener el trabajo al día.
*Criterios:* CRUD completo; búsqueda por texto; filtros por estado; la tasa de completado se recalcula sola (signals).

**HU-4 · Ver la carga del equipo** ✅
Como *manager*, quiero ver quién está en qué proyectos y cuántas tareas tiene cada persona, para repartir el trabajo con criterio.
*Criterios:* tarjetas de miembro con contadores de proyectos y tareas; desglose por rol; alta/edición de miembros con asignación a proyectos.

**HU-5 · Métricas del equipo** ✅
Como *manager*, quiero KPIs y gráficos (tareas por estado, velocidad semanal, carga por persona), para detectar tendencias sin exportar nada.
*Criterios:* 4 KPIs con tendencia; 4 charts; los derivados de tasks/team se actualizan en vivo.

**HU-6 · Trabajar de noche** ✅
Como *usuario*, quiero que el dashboard respete mi preferencia de tema claro/oscuro y me deje cambiarla, para usarlo cómodo en cualquier entorno.
*Criterios:* sigue `prefers-color-scheme`; toggle manual persistente; charts incluidos.

## Pendientes

**HU-7 · KPIs vivos** ⏳
Como *manager*, quiero que los KPIs de la vista Metrics se recalculen a partir de los datos reales de tareas y proyectos (hoy vienen de un endpoint estático), para que nunca mientan.
*Nota técnica:* derivar los KPIs como `computed` de TaskService/ProjectService y retirar el endpoint `/metrics`.

**HU-8 · Tablero kanban** ⏳
Como *miembro del equipo*, quiero arrastrar tareas entre columnas de estado (todo → in-progress → review → done), para actualizar el flujo sin abrir formularios.
*Nota técnica:* CDK DragDrop sobre `byStatus()`; el drop dispara `taskService.update(id, { status })`.
