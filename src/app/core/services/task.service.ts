import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Task, TaskStatus } from '../models';

const API = '/api/tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private readonly resource = httpResource<Task[]>(() => API, { defaultValue: [] });
  private readonly mutationError = signal<string | null>(null);

  readonly tasks = this.resource.value.asReadonly();
  readonly loading = this.resource.isLoading;
  readonly error = computed(
    () => this.mutationError() ?? this.resource.error()?.message ?? null
  );

  readonly byStatus = computed(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], 'in-progress': [], review: [], done: [] };
    for (const t of this.tasks()) {
      map[t.status].push(t);
    }
    return map;
  });

  readonly highPriority = computed(() =>
    this.tasks().filter(t => t.priority === 'high' || t.priority === 'critical')
  );

  readonly openCount = computed(() => this.tasks().filter(t => t.status !== 'done').length);
  readonly doneCount = computed(() => this.tasks().filter(t => t.status === 'done').length);
  readonly completionRate = computed(() => {
    const total = this.tasks().length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  });

  reload(): void {
    this.mutationError.set(null);
    this.resource.reload();
  }

  tasksByProject(projectId: string) {
    return computed(() => this.tasks().filter(t => t.projectId === projectId));
  }

  tasksByAssignee(assigneeId: string) {
    return computed(() => this.tasks().filter(t => t.assigneeId === assigneeId));
  }

  add(task: Omit<Task, 'id'>): void {
    this.http.post<Task>(API, task).subscribe({
      next: created => this.resource.value.update(list => [...list, created]),
      error: err => this.mutationError.set(err.message),
    });
  }

  update(id: string, changes: Partial<Task>): void {
    this.http.patch<Task>(`${API}/${id}`, changes).subscribe({
      next: updated => this.resource.value.update(list => list.map(t => t.id === id ? updated : t)),
      error: err => this.mutationError.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this.resource.value.update(list => list.filter(t => t.id !== id)),
      error: err => this.mutationError.set(err.message),
    });
  }
}
