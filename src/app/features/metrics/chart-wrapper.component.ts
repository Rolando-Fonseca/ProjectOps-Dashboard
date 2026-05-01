import { Component, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartConfiguration } from 'chart.js';

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
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .chart-wrapper__title {
      margin: 0 0 1rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1e293b;
    }
    .chart-wrapper__canvas {
      position: relative;
      max-height: 260px;
    }
  `],
})
export class ChartWrapper {
  readonly title = input.required<string>();
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly type = input<ChartType>('bar');
  readonly colors = input<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']);

  readonly chartData = computed<ChartConfiguration['data']>(() => ({
    labels: this.labels(),
    datasets: [{
      data: this.data(),
      backgroundColor: this.type() === 'doughnut'
        ? this.colors()
        : this.colors()[0],
      borderColor: this.type() === 'doughnut' ? '#ffffff' : this.colors()[0],
      borderWidth: this.type() === 'doughnut' ? 2 : 0,
      borderRadius: this.type() === 'bar' ? 4 : 0,
      maxBarThickness: 40,
    }],
  }));

  readonly chartOptions = computed<ChartConfiguration['options']>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: this.type() === 'doughnut',
        position: 'bottom' as const,
        labels: { padding: 16, usePointStyle: true, font: { size: 11 } },
      },
    },
    ...(this.type() !== 'doughnut' ? {
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 11 } }, grid: { color: '#f1f5f9' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    } : {}),
  }));
}
