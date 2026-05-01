import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, ProjectStatus } from '../models';

const API = '/api/projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly _projects = signal<Project[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeProjects = computed(() =>
    this._projects().filter(p => p.status === 'active')
  );

  readonly projectCount = computed(() => this._projects().length);

  readonly byStatus = computed(() => {
    const map: Record<ProjectStatus, Project[]> = { active: [], 'on-hold': [], completed: [], archived: [] };
    for (const p of this._projects()) {
      map[p.status].push(p);
    }
    return map;
  });

  readonly avgProgress = computed(() => {
    const list = this._projects();
    return list.length === 0 ? 0 : Math.round(list.reduce((s, p) => s + p.progress, 0) / list.length);
  });

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Project[]>(API).subscribe({
      next: data => { this._projects.set(data); this._loading.set(false); },
      error: err => { this._error.set(err.message); this._loading.set(false); },
    });
  }

  projectById(id: string) {
    return computed(() => this._projects().find(p => p.id === id));
  }

  add(project: Omit<Project, 'id'>): void {
    this.http.post<Project>(API, project).subscribe({
      next: created => this._projects.update(list => [...list, created]),
      error: err => this._error.set(err.message),
    });
  }

  update(id: string, changes: Partial<Project>): void {
    this.http.patch<Project>(`${API}/${id}`, changes).subscribe({
      next: updated => this._projects.update(list => list.map(p => p.id === id ? updated : p)),
      error: err => this._error.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this._projects.update(list => list.filter(p => p.id !== id)),
      error: err => this._error.set(err.message),
    });
  }
}
