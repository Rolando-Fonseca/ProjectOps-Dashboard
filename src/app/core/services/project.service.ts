import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Project, ProjectStatus } from '../models';

const API = '/api/projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  // httpResource dispara la carga al crearse y expone value/isLoading/error
  // como signals; las mutaciones escriben en value() para no refetchear.
  private readonly resource = httpResource<Project[]>(() => API, { defaultValue: [] });
  private readonly mutationError = signal<string | null>(null);

  readonly projects = this.resource.value.asReadonly();
  readonly loading = this.resource.isLoading;
  readonly error = computed(
    () => this.mutationError() ?? this.resource.error()?.message ?? null
  );

  readonly activeProjects = computed(() =>
    this.projects().filter(p => p.status === 'active')
  );

  readonly projectCount = computed(() => this.projects().length);

  readonly byStatus = computed(() => {
    const map: Record<ProjectStatus, Project[]> = { active: [], 'on-hold': [], completed: [], archived: [] };
    for (const p of this.projects()) {
      map[p.status].push(p);
    }
    return map;
  });

  readonly avgProgress = computed(() => {
    const list = this.projects();
    return list.length === 0 ? 0 : Math.round(list.reduce((s, p) => s + p.progress, 0) / list.length);
  });

  reload(): void {
    this.mutationError.set(null);
    this.resource.reload();
  }

  projectById(id: string) {
    return computed(() => this.projects().find(p => p.id === id));
  }

  add(project: Omit<Project, 'id'>): void {
    this.http.post<Project>(API, project).subscribe({
      next: created => this.resource.value.update(list => [...list, created]),
      error: err => this.mutationError.set(err.message),
    });
  }

  update(id: string, changes: Partial<Project>): void {
    this.http.patch<Project>(`${API}/${id}`, changes).subscribe({
      next: updated => this.resource.value.update(list => list.map(p => p.id === id ? updated : p)),
      error: err => this.mutationError.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this.resource.value.update(list => list.filter(p => p.id !== id)),
      error: err => this.mutationError.set(err.message),
    });
  }
}
