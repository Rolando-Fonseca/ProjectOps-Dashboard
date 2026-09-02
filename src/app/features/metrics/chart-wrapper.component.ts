import { Component, input, computed, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartConfiguration } from 'chart.js';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-wrapper">
      <h3 class="chart-wrapper__title">{{ title() }}</h3>
      <div class="chart-wrapper__canvas">
        <canvas
          baseChart
          [data]="chartData()"
          [options]="chartOptions()"
          [type]="type()">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .chart-wrapper__title {
      margin: 0 0 1rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text);
    }
    .chart-wrapper__canvas {
      position: relative;
      max-height: 260px;
    }
  `],
})
export class ChartWrapper {
  private readonly themeService = inject(ThemeService);

  readonly title = input.required<string>();
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly type = input<ChartType>('bar');
  readonly colors = input<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']);

  // Chart.js pinta en canvas y no ve las variables CSS: los colores de texto,
  // rejilla y borde dependen del signal del tema para redibujarse al cambiarlo.
  private readonly dark = computed(() => this.themeService.theme() === 'dark');

  readonly chartData = computed<ChartConfiguration['data']>(() => ({
    labels: this.labels(),
    datasets: [{
      data: this.data(),
      backgroundColor: this.type() === 'doughnut'
        ? this.colors()
        : this.colors()[0],
      borderColor: this.type() === 'doughnut'
        ? (this.dark() ? '#1e293b' : '#ffffff')
        : this.colors()[0],
      borderWidth: this.type() === 'doughnut' ? 2 : 0,
      borderRadius: this.type() === 'bar' ? 4 : 0,
      maxBarThickness: 40,
    }],
  }));

  readonly chartOptions = computed<ChartConfiguration['options']>(() => {
    const tickColor = this.dark() ? '#94a3b8' : '#64748b';
    const gridColor = this.dark() ? '#283548' : '#f1f5f9';
    const legendColor = this.dark() ? '#cbd5e1' : '#334155';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.type() === 'doughnut',
          position: 'bottom' as const,
          labels: { padding: 16, usePointStyle: true, font: { size: 11 }, color: legendColor },
        },
      },
      ...(this.type() !== 'doughnut' ? {
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 11 }, color: tickColor }, grid: { color: gridColor } },
          x: { ticks: { font: { size: 11 }, color: tickColor }, grid: { display: false } },
        },
      } : {}),
    };
  });
}
