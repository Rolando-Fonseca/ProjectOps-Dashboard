import { Component, input, output, inject, computed } from '@angular/core';
import { TeamMember } from '../../core/models';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-member-card',
  standalone: true,
  template: `
    <div class="member-card">
      <div class="member-card__avatar">{{ member().avatar }}</div>
      <div class="member-card__info">
        <div class="member-card__name">{{ member().name }}</div>
        <div class="member-card__role">{{ member().role }}</div>
        <div class="member-card__email">{{ member().email }}</div>
      </div>
      <div class="member-card__right">
        <div class="member-card__stats">
          <div class="member-card__stat">
            <span class="member-card__stat-value">{{ member().projectIds.length }}</span>
            <span class="member-card__stat-label">Proj</span>
          </div>
          <div class="member-card__stat">
            <span class="member-card__stat-value">{{ taskCount() }}</span>
            <span class="member-card__stat-label">Tasks</span>
          </div>
        </div>
        <div class="member-card__actions">
          <button class="member-card__btn" (click)="edit.emit()">Edit</button>
          <button class="member-card__btn member-card__btn--danger" (click)="delete.emit()">Del</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-card {
      display: flex; align-items: center; gap: 0.875rem; background: var(--surface);
      border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem 1.125rem;
      transition: box-shadow 0.15s ease;
    }
    .member-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .member-card__avatar {
      width: 42px; height: 42px; border-radius: 50%; background: #3b82f6; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;
    }
    .member-card__info { flex: 1; min-width: 0; }
    .member-card__name { font-size: 0.875rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .member-card__role { font-size: 0.75rem; color: var(--text-muted); }
    .member-card__email { font-size: 0.6875rem; color: var(--text-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .member-card__right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.375rem; flex-shrink: 0; }
    .member-card__stats { display: flex; gap: 0.75rem; }
    .member-card__stat { display: flex; flex-direction: column; align-items: center; }
    .member-card__stat-value { font-size: 0.9375rem; font-weight: 700; color: var(--text); line-height: 1; }
    .member-card__stat-label { font-size: 0.5625rem; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.5px; }
    .member-card__actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s ease; }
    .member-card:hover .member-card__actions { opacity: 1; }
    .member-card__btn {
      font-size: 0.625rem; font-weight: 500; border: none; cursor: pointer;
      padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: var(--text-secondary); background: transparent;
    }
    .member-card__btn:hover { background: var(--border-soft); }
    .member-card__btn--danger { color: var(--chip-danger-text); }
    .member-card__btn--danger:hover { background: var(--chip-danger-soft); }
  `],
})
export class MemberCard {
  readonly member = input.required<TeamMember>();
  readonly edit = output<void>();
  readonly delete = output<void>();
  private readonly taskService = inject(TaskService);

  readonly taskCount = computed(() =>
    this.taskService.tasksByAssignee(this.member().id)().length
  );
}
