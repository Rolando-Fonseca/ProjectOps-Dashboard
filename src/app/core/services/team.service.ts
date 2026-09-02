import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { TeamMember } from '../models';

const API = '/api/team';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  private readonly resource = httpResource<TeamMember[]>(() => API, { defaultValue: [] });
  private readonly mutationError = signal<string | null>(null);

  readonly members = this.resource.value.asReadonly();
  readonly loading = this.resource.isLoading;
  readonly error = computed(
    () => this.mutationError() ?? this.resource.error()?.message ?? null
  );

  readonly memberCount = computed(() => this.members().length);

  readonly roleBreakdown = computed(() => {
    const roles: Record<string, number> = {};
    for (const m of this.members()) {
      roles[m.role] = (roles[m.role] ?? 0) + 1;
    }
    return Object.entries(roles).map(([role, count]) => ({ role, count }));
  });

  reload(): void {
    this.mutationError.set(null);
    this.resource.reload();
  }

  memberById(id: string) {
    return computed(() => this.members().find(m => m.id === id));
  }

  membersByProject(projectId: string) {
    return computed(() => this.members().filter(m => m.projectIds.includes(projectId)));
  }

  add(member: Omit<TeamMember, 'id'>): void {
    this.http.post<TeamMember>(API, member).subscribe({
      next: created => this.resource.value.update(list => [...list, created]),
      error: err => this.mutationError.set(err.message),
    });
  }

  update(id: string, changes: Partial<TeamMember>): void {
    this.http.patch<TeamMember>(`${API}/${id}`, changes).subscribe({
      next: updated => this.resource.value.update(list => list.map(m => m.id === id ? updated : m)),
      error: err => this.mutationError.set(err.message),
    });
  }

  remove(id: string): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => this.resource.value.update(list => list.filter(m => m.id !== id)),
      error: err => this.mutationError.set(err.message),
    });
  }
}
