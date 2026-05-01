import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TeamMember } from '../models';

const API = '/api/team';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly _members = signal<TeamMember[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly members = this._members.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly memberCount = computed(() => this._members().length);

  readonly roleBreakdown = computed(() => {
    const roles: Record<string, number> = {};
    for (const m of this._members()) {
      roles[m.role] = (roles[m.role] ?? 0) + 1;
    }
    return Object.entries(roles).map(([role, count]) => ({ role, count }));
  });

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<TeamMember[]>(API).subscribe({
      next: data => { this._members.set(data); this._loading.set(false); },
      error: err => { this._error.set(err.message); this._loading.set(false); },
    });
  }

  memberById(id: string) {
    return computed(() => this._members().find(m => m.id === id));
  }

  membersByProject(projectId: string) {
    return computed(() => this._members().filter(m => m.projectIds.includes(projectId)));
  }

  add(member: Omit<TeamMember, 'id'>): void {
    this.http.post<TeamMember>(API, member).subscribe({
      next: created => this._members.update(list => [...list, created]),
      error: err => this._error.set(err.message),
    });
  }

  update(id: string, changes: Partial<TeamMember>): void {
    this.http.patch<TeamMember>(`${API}/${id}`, changes).subscribe({
      next: updated => this._members.update(list => list.map(m => m.id === id ? updated : m)),
      error: err => this._error.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this._members.update(list => list.filter(m => m.id !== id)),
      error: err => this._error.set(err.message),
    });
  }
}
