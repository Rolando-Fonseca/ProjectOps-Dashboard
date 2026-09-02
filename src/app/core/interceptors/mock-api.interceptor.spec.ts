import { HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, filter, firstValueFrom, of } from 'rxjs';
import { MOCK_DB } from '../data/mock-db';
import { mockApiInterceptor, resetMockApiStore } from './mock-api.interceptor';
import { Task } from '../models';

// El interceptor es una función pura sobre (req, next): se prueba sin TestBed.
const passthrough = () => of(new HttpResponse({ status: 200, body: 'passthrough' }) as HttpEvent<unknown>);

async function respond(req: HttpRequest<unknown>): Promise<HttpResponse<unknown>> {
  const events = mockApiInterceptor(req, passthrough) as Observable<HttpEvent<unknown>>;
  return firstValueFrom(
    events.pipe(filter((e): e is HttpResponse<unknown> => e instanceof HttpResponse))
  );
}

describe('mockApiInterceptor', () => {
  beforeEach(() => resetMockApiStore());

  it('deja pasar las peticiones que no son /api/*', async () => {
    const res = await respond(new HttpRequest('GET', '/assets/logo.svg'));
    expect(res.body).toBe('passthrough');
  });

  it('GET de una colección devuelve los datos semilla', async () => {
    const res = await respond(new HttpRequest('GET', '/api/projects'));
    expect(res.body).toEqual(MOCK_DB.projects);
  });

  it('GET por id devuelve el elemento', async () => {
    const res = await respond(new HttpRequest('GET', '/api/projects/proj-1'));
    expect((res.body as { id: string }).id).toBe('proj-1');
  });

  it('POST crea con id generado y persiste en memoria', async () => {
    const nueva = { title: 'Nueva tarea', status: 'todo' } as Partial<Task>;
    const created = await respond(new HttpRequest('POST', '/api/tasks', nueva));
    expect((created.body as Task).id).toBeTruthy();
    expect((created.body as Task).title).toBe('Nueva tarea');

    const list = await respond(new HttpRequest('GET', '/api/tasks'));
    expect((list.body as Task[]).length).toBe(MOCK_DB.tasks.length + 1);
  });

  it('PATCH mezcla cambios sin tocar el resto', async () => {
    const res = await respond(new HttpRequest('PATCH', '/api/tasks/task-1', { status: 'done' }));
    const task = res.body as Task;
    expect(task.status).toBe('done');
    expect(task.id).toBe('task-1');
    expect(task.title).toBe(MOCK_DB.tasks[0].title);
  });

  it('DELETE elimina el elemento', async () => {
    await respond(new HttpRequest('DELETE', '/api/team/tm-1'));
    const list = await respond(new HttpRequest('GET', '/api/team'));
    expect((list.body as { id: string }[]).some(m => m.id === 'tm-1')).toBe(false);
  });

  it('GET /api/metrics/main devuelve las métricas', async () => {
    const res = await respond(new HttpRequest('GET', '/api/metrics/main'));
    expect((res.body as { kpis: unknown[] }).kpis.length).toBeGreaterThan(0);
  });

  it('responde 404 para ids inexistentes', async () => {
    const events = mockApiInterceptor(new HttpRequest('GET', '/api/projects/nope'), passthrough);
    await expect(firstValueFrom(events)).rejects.toMatchObject({ status: 404 });
  });

  it('las mutaciones no contaminan los datos semilla entre tests', async () => {
    const list = await respond(new HttpRequest('GET', '/api/tasks'));
    expect((list.body as Task[]).length).toBe(MOCK_DB.tasks.length);
  });
});

describe('mockApiInterceptor (aserciones de tipo de error)', () => {
  it('el 404 es un HttpErrorResponse', async () => {
    const events = mockApiInterceptor(new HttpRequest('GET', '/api/unknown'), passthrough);
    await expect(firstValueFrom(events)).rejects.toBeInstanceOf(HttpErrorResponse);
  });
});
