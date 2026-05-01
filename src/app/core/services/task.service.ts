import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskStatus } from '../models';

const API = '/api/tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly byStatus = computed(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], 'in-progress': [], review: [], done: [] };
    for (const t of this._tasks()) {
      map[t.status].push(t);
    }
    return map;
  });

  readonly highPriority = computed(() =>
    this._tasks().filter(t => t.priority === 'high' || t.priority === 'critical')
  );

  readonly openCount = computed(() => this._tasks().filter(t => t.status !== 'done').length);
  readonly doneCount = computed(() => this._tasks().filter(t => t.status === 'done').length);
  readonly completionRate = computed(() => {
    const total = this._tasks().length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  });

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Task[]>(API).subscribe({
      next: data => { this._tasks.set(data); this._loading.set(false); },
      error: err => { this._error.set(err.message); this._loading.set(false); },
    });
  }

  tasksByProject(projectId: string) {
    return computed(() => this._tasks().filter(t => t.projectId === projectId));
  }

  tasksByAssignee(assigneeId: string) {
    return computed(() => this._tasks().filter(t => t.assigneeId === assigneeId));
  }

  add(task: Omit<Task, 'id'>): void {
    this.http.post<Task>(API, task).subscribe({
      next: created => this._tasks.update(list => [...list, created]),
      error: err => this._error.set(err.message),
    });
  }

  update(id: string, changes: Partial<Task>): void {
    this.http.patch<Task>(`${API}/${id}`, changes).subscribe({
      next: updated => this._tasks.update(list => list.map(t => t.id === id ? updated : t)),
      error: err => this._error.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this._tasks.update(list => list.filter(t => t.id !== id)),
      error: err => this._error.set(err.message),
    });
  }
}
