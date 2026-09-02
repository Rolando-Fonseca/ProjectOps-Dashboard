import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_DB, MockDb } from '../data/mock-db';

// Backend simulado en memoria: replica la API de json-server (/api/*) dentro
// del propio bundle, para que la demo desplegada funcione sin servidor.
// En desarrollo (environment.useMockApi = false) se desactiva y las peticiones
// siguen su curso hacia json-server a través del proxy.

const LATENCY_MS = 250;

type Collection = 'projects' | 'tasks' | 'team';
const COLLECTIONS: Collection[] = ['projects', 'tasks', 'team'];

let store: MockDb | null = null;

function getStore(): MockDb {
  store ??= structuredClone(MOCK_DB);
  return store;
}

/** Solo para tests: descarta el estado en memoria y vuelve a los datos semilla. */
export function resetMockApiStore(): void {
  store = null;
}

function respond(body: unknown): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(LATENCY_MS));
}

function notFound(url: string): Observable<never> {
  return throwError(
    () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url })
  );
}

function handleCollection(
  req: HttpRequest<unknown>,
  collection: Collection,
  id: string | null
): Observable<HttpEvent<unknown>> {
  const items = getStore()[collection] as Array<{ id: string }>;

  if (!id) {
    if (req.method === 'GET') return respond(items);
    if (req.method === 'POST') {
      const created = { ...(req.body as object), id: crypto.randomUUID() };
      items.push(created);
      return respond(created);
    }
    return notFound(req.url);
  }

  const index = items.findIndex(item => item.id === id);
  if (index === -1) return notFound(req.url);

  if (req.method === 'GET') return respond(items[index]);
  if (req.method === 'PATCH' || req.method === 'PUT') {
    items[index] = { ...items[index], ...(req.body as object), id };
    return respond(items[index]);
  }
  if (req.method === 'DELETE') {
    const [removed] = items.splice(index, 1);
    return respond(removed);
  }
  return notFound(req.url);
}

export function mockApiInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  if (!environment.useMockApi || !req.url.startsWith('/api/')) {
    return next(req);
  }

  const [resource, id = null] = req.url.replace('/api/', '').split('/');

  if (resource === 'metrics') {
    const metrics = getStore().metrics.find(m => m.id === (id ?? 'main'));
    if (!metrics) return notFound(req.url);
    if (req.method === 'PATCH') Object.assign(metrics, req.body);
    return respond(metrics);
  }

  if (COLLECTIONS.includes(resource as Collection)) {
    return handleCollection(req, resource as Collection, id);
  }

  return notFound(req.url);
}
