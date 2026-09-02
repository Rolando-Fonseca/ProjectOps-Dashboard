import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Metrics } from '../models';

const API = '/api/metrics';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);

  private readonly resource = httpResource<Metrics | null>(() => `${API}/main`, { defaultValue: null });
  private readonly mutationError = signal<string | null>(null);

  readonly metrics = this.resource.value.asReadonly();
  readonly loading = this.resource.isLoading;
  readonly error = computed(
    () => this.mutationError() ?? this.resource.error()?.message ?? null
  );

  readonly kpis = computed(() => this.metrics()?.kpis ?? []);
  readonly tasksByStatus = computed(() => this.metrics()?.tasksByStatus ?? []);
  readonly projectsByStatus = computed(() => this.metrics()?.projectsByStatus ?? []);
  readonly weeklyVelocity = computed(() => this.metrics()?.weeklyVelocity ?? []);
  readonly maxVelocity = computed(() => Math.max(...this.weeklyVelocity().map(w => w.completed), 1));
  readonly maxTaskCount = computed(() => Math.max(...this.tasksByStatus().map(s => s.count), 1));

  reload(): void {
    this.mutationError.set(null);
    this.resource.reload();
  }

  update(changes: Partial<Metrics>): void {
    this.http.patch<Metrics>(`${API}/main`, changes).subscribe({
      next: updated => this.resource.value.set(updated),
      error: err => this.mutationError.set(err.message),
    });
  }
}
