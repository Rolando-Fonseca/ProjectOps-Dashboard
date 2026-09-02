import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../core/models';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { PercentValuePipe } from '../../shared/pipes/percent.pipe';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, StatusLabelPipe, PercentValuePipe],
  template: `
    <div class="project-card">
      <div class="project-card__header">
        <h3 class="project-card__name">{{ project().name }}</h3>
        <span class="project-card__status" [attr.data-status]="project().status">
          {{ project().status | statusLabel }}
        </span>
      </div>
      <p class="project-card__desc">{{ project().description }}</p>
      <div class="project-card__progress">
        <div class="project-card__progress-bar">
          <div class="project-card__progress-fill" [style.width.%]="project().progress"></div>
        </div>
        <span class="project-card__progress-label">{{ project().progress | percentValue }}</span>
      </div>
      <div class="project-card__footer">
        <div class="project-card__meta">
          <span class="project-card__chip">{{ project().teamMemberIds.length }} members</span>
          <span class="project-card__chip">{{ project().taskIds.length }} tasks</span>
        </div>
        <div class="project-card__actions">
          <a class="project-card__link" [routerLink]="['/projects', project().id]">Open</a>
          <button class="project-card__btn project-card__btn--edit" (click)="edit.emit(); $event.stopPropagation()">Edit</button>
          <button class="project-card__btn project-card__btn--delete" (click)="delete.emit(); $event.stopPropagation()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-card {
      display: block; background: var(--surface); border: 1px solid var(--border);
      border-radius: 0.75rem; padding: 1.25rem; color: inherit;
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .project-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); border-color: var(--border-strong); }
    .project-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .project-card__name { margin: 0; font-size: 0.9375rem; font-weight: 600; color: var(--text); line-height: 1.3; }
    .project-card__status {
      font-size: 0.6875rem; padding: 0.125rem 0.5rem; border-radius: 9999px;
      font-weight: 500; white-space: nowrap; flex-shrink: 0;
    }
    .project-card__status[data-status="active"] { background: var(--chip-info-bg); color: var(--chip-info-text); }
    .project-card__status[data-status="on-hold"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .project-card__status[data-status="completed"] { background: var(--chip-success-bg); color: var(--chip-success-text); }
    .project-card__status[data-status="archived"] { background: var(--border-soft); color: var(--text-muted); }
    .project-card__desc {
      margin: 0 0 1rem; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .project-card__progress { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .project-card__progress-bar { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .project-card__progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width 0.3s ease; }
    .project-card__progress-label { font-size: 0.6875rem; color: var(--text-muted); font-weight: 500; min-width: 32px; text-align: right; }
    .project-card__footer { display: flex; align-items: center; justify-content: space-between; }
    .project-card__meta { display: flex; gap: 0.5rem; }
    .project-card__chip { font-size: 0.6875rem; color: var(--text-muted); background: var(--bg); padding: 0.125rem 0.5rem; border-radius: 0.25rem; }
    .project-card__actions { display: flex; gap: 0.375rem; }
    .project-card__link {
      font-size: 0.6875rem; font-weight: 500; color: #3b82f6; text-decoration: none;
      padding: 0.125rem 0.375rem; border-radius: 0.25rem;
    }
    .project-card__link:hover { background: var(--chip-info-soft); }
    .project-card__btn {
      font-size: 0.6875rem; font-weight: 500; border: none; cursor: pointer;
      padding: 0.125rem 0.375rem; border-radius: 0.25rem; transition: background 0.15s ease;
    }
    .project-card__btn--edit { color: var(--text-secondary); background: transparent; }
    .project-card__btn--edit:hover { background: var(--border-soft); }
    .project-card__btn--delete { color: var(--chip-danger-text); background: transparent; }
    .project-card__btn--delete:hover { background: var(--chip-danger-soft); }
  `],
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
