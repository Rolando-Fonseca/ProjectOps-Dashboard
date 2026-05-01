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
      background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.5rem;
      border-left: 3px solid transparent; transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .task-row:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .task-row[data-status="in-progress"] { border-left-color: #3b82f6; }
    .task-row[data-status="review"] { border-left-color: #f59e0b; }
    .task-row[data-status="done"] { border-left-color: #10b981; opacity: 0.7; }
    .task-row[data-status="todo"] { border-left-color: #94a3b8; }
    .task-row__status {
      font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 9999px;
      font-weight: 500; white-space: nowrap;
    }
    .task-row__status[data-status="todo"] { background: #f1f5f9; color: #475569; }
    .task-row__status[data-status="in-progress"] { background: #dbeafe; color: #1d4ed8; }
    .task-row__status[data-status="review"] { background: #fef3c7; color: #b45309; }
    .task-row__status[data-status="done"] { background: #d1fae5; color: #047857; }
    .task-row__title { flex: 1; font-size: 0.8125rem; color: #1e293b; font-weight: 500; }
    .task-row[data-status="done"] .task-row__title { text-decoration: line-through; color: #94a3b8; }
    .task-row__priority { font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 9999px; font-weight: 500; }
    .task-row__priority[data-priority="critical"] { background: #fee2e2; color: #dc2626; }
    .task-row__priority[data-priority="high"] { background: #ffedd5; color: #ea580c; }
    .task-row__priority[data-priority="medium"] { background: #fef3c7; color: #b45309; }
    .task-row__priority[data-priority="low"] { background: #f1f5f9; color: #64748b; }
    .task-row__due { font-size: 0.6875rem; color: #94a3b8; white-space: nowrap; min-width: 60px; text-align: right; }
    .task-row__actions { display: flex; gap: 0.25rem; opacity: 0; transition: opacity 0.15s ease; }
    .task-row:hover .task-row__actions { opacity: 1; }
    .task-row__btn {
      font-size: 0.625rem; font-weight: 500; border: none; cursor: pointer;
      padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #475569; background: transparent;
    }
    .task-row__btn:hover { background: #f1f5f9; }
    .task-row__btn--danger { color: #dc2626; }
    .task-row__btn--danger:hover { background: #fef2f2; }
  `],
})
export class TaskRow {
  readonly task = input.required<Task>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
