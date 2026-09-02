import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from '../models';

const task = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: `Task ${id}`,
  description: '',
  status: 'todo',
  priority: 'medium',
  projectId: 'p1',
  assigneeId: 'tm-1',
  dueDate: '',
  ...overrides,
});

const TASKS: Task[] = [
  task('t1', { status: 'done', priority: 'high' }),
  task('t2', { status: 'in-progress', priority: 'critical', assigneeId: 'tm-2' }),
  task('t3', { status: 'todo', projectId: 'p2' }),
  task('t4', { status: 'done', priority: 'low' }),
];

describe('TaskService (httpResource)', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(ApplicationRef).tick();
    http.expectOne('/api/tasks').flush(TASKS);
    await vi.waitFor(() => expect(service.tasks().length).toBe(TASKS.length));
  });

  it('agrupa por estado y cuenta abiertas/hechas', () => {
    expect(service.byStatus().done.length).toBe(2);
    expect(service.byStatus()['in-progress'].length).toBe(1);
    expect(service.openCount()).toBe(2);
    expect(service.doneCount()).toBe(2);
  });

  it('calcula el porcentaje de completado', () => {
    expect(service.completionRate()).toBe(50);
  });

  it('filtra prioridades altas y críticas', () => {
    expect(service.highPriority().map(t => t.id)).toEqual(['t1', 't2']);
  });

  it('filtra por proyecto y por asignado', () => {
    expect(service.tasksByProject('p2')().map(t => t.id)).toEqual(['t3']);
    expect(service.tasksByAssignee('tm-2')().map(t => t.id)).toEqual(['t2']);
  });

  it('update refleja el cambio en los computeds', async () => {
    service.update('t3', { status: 'done' });
    http.expectOne('/api/tasks/t3').flush(task('t3', { status: 'done', projectId: 'p2' }));
    await vi.waitFor(() => expect(service.doneCount()).toBe(3));
    expect(service.completionRate()).toBe(75);
  });
});
