import { Component, inject, computed } from '@angular/core';
import { MetricsService } from '../../core/services/metrics.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { TeamService } from '../../core/services/team.service';
import { KpiCard } from './kpi-card.component';
import { ChartWrapper } from './chart-wrapper.component';
import { LoadingSpinner } from '../../shared/ui/loading-spinner.component';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [KpiCard, ChartWrapper, LoadingSpinner],
  template: `
    <div class="metrics-dashboard">
      <h1>Metrics</h1>

      @if (metricsService.loading()) {
        <app-loading-spinner message="Loading metrics..." />
      } @else {
        <div class="metrics-dashboard__kpis">
          @for (kpi of metricsService.kpis(); track kpi.label) {
            <app-kpi-card [kpi]="kpi" />
          }
        </div>

        <div class="metrics-dashboard__charts">
          <app-chart-wrapper
            title="Tasks by Status"
            [labels]="tasksByStatusLabels()"
            [data]="tasksByStatusData()"
            type="doughnut"
            [colors]="['#94a3b8', '#3b82f6', '#f59e0b', '#10b981']" />

          <app-chart-wrapper
            title="Projects by Status"
            [labels]="projectsByStatusLabels()"
            [data]="projectsByStatusData()"
            type="doughnut"
            [colors]="['#3b82f6', '#f59e0b', '#10b981']" />

          <app-chart-wrapper
            title="Weekly Velocity"
            [labels]="velocityLabels()"
            [data]="velocityData()" />

          <app-chart-wrapper
            title="Team Task Load"
            [labels]="memberLabels()"
            [data]="memberTaskData()"
            [colors]="['#8b5cf6']" />
        </div>
      }
    </div>
  `,
  styles: [`
    .metrics-dashboard h1 {
      margin: 0 0 1.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    .metrics-dashboard__kpis {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .metrics-dashboard__charts {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1rem;
    }
  `],
})
export class MetricsDashboard {
  protected readonly metricsService = inject(MetricsService);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly teamService = inject(TeamService);

  readonly tasksByStatusLabels = computed(() =>
    this.metricsService.tasksByStatus().map(s => s.status)
  );
  readonly tasksByStatusData = computed(() =>
    this.metricsService.tasksByStatus().map(s => s.count)
  );

  readonly projectsByStatusLabels = computed(() =>
    this.metricsService.projectsByStatus().map(s => s.status)
  );
  readonly projectsByStatusData = computed(() =>
    this.metricsService.projectsByStatus().map(s => s.count)
  );

  readonly velocityLabels = computed(() =>
    this.metricsService.weeklyVelocity().map(w => w.week)
  );
  readonly velocityData = computed(() =>
    this.metricsService.weeklyVelocity().map(w => w.completed)
  );

  readonly memberLabels = computed(() =>
    this.teamService.members().map(m => m.name.split(' ')[0])
  );
  readonly memberTaskData = computed(() =>
    this.teamService.members().map(m => this.taskService.tasksByAssignee(m.id)().length)
  );

  constructor() {
    this.metricsService.loadAll();
    this.projectService.loadAll();
    this.taskService.loadAll();
    this.teamService.loadAll();
  }
}
