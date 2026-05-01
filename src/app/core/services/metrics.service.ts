import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Metrics } from '../models';

const API = '/api/metrics';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly _metrics = signal<Metrics | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly metrics = this._metrics.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly kpis = computed(() => this._metrics()?.kpis ?? []);
  readonly tasksByStatus = computed(() => this._metrics()?.tasksByStatus ?? []);
  readonly projectsByStatus = computed(() => this._metrics()?.projectsByStatus ?? []);
  readonly weeklyVelocity = computed(() => this._metrics()?.weeklyVelocity ?? []);
  readonly maxVelocity = computed(() => Math.max(...this.weeklyVelocity().map(w => w.completed), 1));
  readonly maxTaskCount = computed(() => Math.max(...this.tasksByStatus().map(s => s.count), 1));

  constructor(private http: HttpClient) {}

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);
    this.http.get<Metrics>(`${API}/main`).subscribe({
      next: data => { this._metrics.set(data); this._loading.set(false); },
      error: err => { this._error.set(err.message); this._loading.set(false); },
    });
  }

  update(changes: Partial<Metrics>): void {
    this.http.patch<Metrics>(`${API}/main`, changes).subscribe({
      next: updated => this._metrics.set(updated),
      error: err => this._error.set(err.message),
    });
  }
}
