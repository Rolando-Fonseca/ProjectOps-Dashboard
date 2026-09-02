// Regenera src/app/core/data/mock-db.ts a partir de db.json.
// db.json es la única fuente de verdad de los datos mock: json-server la sirve
// en desarrollo y este script la embebe en el bundle para producción.
// Uso: npm run sync:mock
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const db = JSON.parse(readFileSync(resolve(root, 'db.json'), 'utf-8'));

const out = `// Generado desde db.json por scripts/sync-mock.mjs — NO editar a mano.
// Para actualizar: edita db.json y ejecuta \`npm run sync:mock\`.
import type { Project, Task, TeamMember, Metrics } from '../models';

export interface MockDb {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  metrics: (Metrics & { id: string })[];
}

export const MOCK_DB: MockDb = ${JSON.stringify(db, null, 2)};
`;

const target = resolve(root, 'src/app/core/data/mock-db.ts');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out);
console.log(`mock-db.ts regenerado desde db.json (${db.projects.length} projects, ${db.tasks.length} tasks, ${db.team.length} team)`);
