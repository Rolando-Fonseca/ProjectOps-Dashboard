import { defineConfig } from 'vitest/config';

// Config extra que el builder @angular/build:unit-test mezcla con la suya
// (angular.json > test > runnerConfig). El pool "threads" usa worker_threads
// en lugar de procesos hijos: más rápido y compatible con entornos que
// restringen child_process (sandboxes de CI).
export default defineConfig({
  test: {
    pool: 'threads',
  },
});
