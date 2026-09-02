import { Component, input, output } from '@angular/core';
import { Task } from '../../core/models';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { ElapsedTimePipe } from '../../shared/pipes/elapsed-time.pipe';

@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [StatusLabelPipe, ElapsedTimePipe],
  template: `
    <div class="task-row" [attr.data-status]="task().status">
      <span class="task-row__status" [attr.data-status]="task().status">
        {{ task().status | statusLabel }}
      </span>
      <span class="task-row__title">{{ task().title }}</span>
      <span class="task-row__priority" [attr.data-priority]="task().priority">
        {{ task().priority | statusLabel }}
      </span>
      <span class="task-row__due">{{ task().dueDate | elapsedTime }}</span>
      <div class="task-row__actions">
        <button class="task-row__btn" (click)="edit.emit()">Edit</button>
        <button class="task-row__btn task-row__btn--danger" (click)="delete.emit()">Del</button>
      </div>
    </div>
  `,
  styles: [`
    .task-row {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 0.5rem;
      border-left: 3px solid transparent; transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .task-row:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .task-row[data-status="in-progress"] { border-left-color: #3b82f6; }
    .task-row[data-status="review"] { border-left-color: #f59e0b; }
    .task-row[data-status="done"] { border-left-color: #10b981; opacity: 0.7; }
    .task-row[data-status="todo"] { border-left-color: var(--text-subtle); }
    .task-row__status {
      font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 9999px;
      font-weight: 500; white-space: nowrap;
    }
    .task-row__status[data-status="todo"] { background: var(--border-soft); color: var(--text-secondary); }
    .task-row__status[data-status="in-progress"] { background: var(--chip-info-bg); color: var(--chip-info-text); }
    .task-row__status[data-status="review"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .task-row__status[data-status="done"] { background: var(--chip-success-bg); color: var(--chip-success-text); }
    .task-row__title { flex: 1; font-size: 0.8125rem; color: var(--text); font-weight: 500; }
    .task-row[data-status="done"] .task-row__title { text-decoration: line-through; color: var(--text-subtle); }
    .task-row__priority { font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 9999px; font-weight: 500; }
    .task-row__priority[data-priority="critical"] { background: var(--chip-danger-bg); color: var(--chip-danger-text); }
    .task-row__priority[data-priority="high"] { background: var(--chip-orange-bg); color: var(--chip-orange-text); }
    .task-row__priority[data-priority="medium"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .task-row__priority[data-priority="low"] { background: var(--border-soft); color: var(--text-muted); }
    .task-row__due { font-size: 0.6875rem; color: var(--text-subtle); white-space: nowrap; min-width: 60px; text-align: right; }
    .task-row__actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s ease; }
    .task-row:hover .task-row__actions { opacity: 1; }
    .task-row__btn {
      font-size: 0.625rem; font-weight: 500; border: none; cursor: pointer;
      padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: var(--text-secondary); background: transparent;
    }
    .task-row__btn:hover { background: var(--border-soft); }
    .task-row__btn--danger { color: var(--chip-danger-text); }
    .task-row__btn--danger:hover { background: var(--chip-danger-soft); }
  `],
})
export class TaskRow {
  readonly task = input.required<Task>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
