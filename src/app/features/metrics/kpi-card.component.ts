import { Component, input } from '@angular/core';
import { Kpi } from '../../core/models';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="kpi-card" [attr.data-trend]="kpi().trend">
      <div class="kpi-card__label">{{ kpi().label }}</div>
      <div class="kpi-card__body">
        <span class="kpi-card__value">{{ kpi().value }}</span>
        <span class="kpi-card__change">
          @if (kpi().change > 0) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M18 15l-6-6-6 6"/></svg>
            +{{ kpi().change }}
          } @else if (kpi().change < 0) {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M6 9l6 6 6-6"/></svg>
            {{ kpi().change }}
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14"/></svg>
          }
        </span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem 1.125rem;
      border-left: 3px solid #e2e8f0;
      transition: border-color 0.15s ease;
    }
    .kpi-card[data-trend="up"] { border-left-color: #10b981; }
    .kpi-card[data-trend="down"] { border-left-color: #ef4444; }
    .kpi-card[data-trend="neutral"] { border-left-color: #94a3b8; }
    .kpi-card__label {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.375rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .kpi-card__body {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .kpi-card__value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }
    .kpi-card__change {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      font-size: 0.6875rem;
      font-weight: 500;
    }
    .kpi-card[data-trend="up"] .kpi-card__change { color: #10b981; }
    .kpi-card[data-trend="down"] .kpi-card__change { color: #ef4444; }
    .kpi-card[data-trend="neutral"] .kpi-card__change { color: #94a3b8; }
  `],
})
export class KpiCard {
  readonly kpi = input.required<Kpi>();
}
