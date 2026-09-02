import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { TeamService } from '../../core/services/team.service';
import { TaskRow } from './task-row.component';
import { Modal } from '../../shared/ui/modal.component';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { LoadingSpinner } from '../../shared/ui/loading-spinner.component';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { Task, TaskStatus, TaskPriority } from '../../core/models';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [TaskRow, Modal, FormsModule, StatusLabelPipe, LoadingSpinner, EmptyState],
  template: `
    <div class="tasks-list">
      <div class="tasks-list__header">
        <div>
          <h1>Tasks</h1>
          <span class="tasks-list__subtitle">{{ taskService.openCount() }} open &middot; {{ taskService.doneCount() }} done &middot; {{ taskService.completionRate() }}% completion</span>
        </div>
        <div class="tasks-list__actions">
          <input class="tasks-list__search-input" type="text" placeholder="Search tasks..."
            [value]="searchQuery()" (input)="onSearch($event)" />
          <button class="tasks-list__add" (click)="openAdd()">+ Add Task</button>
        </div>
      </div>

      <div class="tasks-list__filters">
        @for (status of statuses; track status) {
          <button class="tasks-list__filter"
            [class.tasks-list__filter--active]="selectedStatus() === status"
            (click)="selectedStatus.set(status)">
            {{ status | statusLabel }}
          </button>
        }
        <button class="tasks-list__filter"
          [class.tasks-list__filter--active]="selectedStatus() === null"
          (click)="selectedStatus.set(null)">All</button>
      </div>

      @if (taskService.loading()) {
        <app-loading-spinner message="Loading tasks..." />
      } @else if (filteredTasks().length === 0) {
        <app-empty-state [message]="'No tasks match your filters'" />
      } @else {
        <div class="tasks-list__body">
          @for (task of filteredTasks(); track task.id) {
            <app-task-row [task]="task" (edit)="openEdit(task)" (delete)="removeTask(task.id)" />
          }
        </div>
      }
    </div>

    <app-modal [open]="modalOpen()" [title]="editingId() ? 'Edit Task' : 'New Task'" (cancel)="closeModal()">
      <form class="form" (ngSubmit)="save()">
        <label class="form__label">Title
          <input class="form__input" [(ngModel)]="form.title" name="title" required />
        </label>
        <label class="form__label">Description
          <textarea class="form__input form__textarea" [(ngModel)]="form.description" name="description"></textarea>
        </label>
        <div class="form__row">
          <label class="form__label">Status
            <select class="form__input" [(ngModel)]="form.status" name="status">
              @for (s of statuses; track s) { <option [value]="s">{{ s | statusLabel }}</option> }
            </select>
          </label>
          <label class="form__label">Priority
            <select class="form__input" [(ngModel)]="form.priority" name="priority">
              @for (p of priorities; track p) { <option [value]="p">{{ p | statusLabel }}</option> }
            </select>
          </label>
        </div>
        <div class="form__row">
          <label class="form__label">Project
            <select class="form__input" [(ngModel)]="form.projectId" name="projectId">
              @for (p of projectService.projects(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }
            </select>
          </label>
          <label class="form__label">Assignee
            <select class="form__input" [(ngModel)]="form.assigneeId" name="assigneeId">
              @for (m of teamService.members(); track m.id) { <option [value]="m.id">{{ m.name }}</option> }
            </select>
          </label>
        </div>
        <label class="form__label">Due Date
          <input class="form__input" type="date" [(ngModel)]="form.dueDate" name="dueDate" />
        </label>
        <div class="form__actions">
          <button class="form__btn form__btn--secondary" type="button" (click)="closeModal()">Cancel</button>
          <button class="form__btn form__btn--primary" type="submit">{{ editingId() ? 'Update' : 'Create' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .tasks-list__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem; }
    .tasks-list__header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .tasks-list__subtitle { font-size: 0.75rem; color: var(--text-muted); }
    .tasks-list__actions { display: flex; align-items: center; gap: 0.5rem; }
    .tasks-list__search-input {
      padding: 0.375rem 0.75rem; border: 1px solid var(--border); border-radius: 0.375rem;
      font-size: 0.8125rem; outline: none; width: 200px; transition: border-color 0.15s ease;
    }
    .tasks-list__search-input:focus { border-color: #3b82f6; }
    .tasks-list__add {
      padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: none;
      background: #10b981; color: #ffffff; font-size: 0.75rem; font-weight: 600; cursor: pointer;
    }
    .tasks-list__add:hover { background: #059669; }
    .tasks-list__filters { display: flex; gap: 0.25rem; margin-bottom: 1rem; }
    .tasks-list__filter {
      padding: 0.375rem 0.625rem; border-radius: 0.375rem; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-muted); font-size: 0.75rem; font-weight: 500; cursor: pointer;
    }
    .tasks-list__filter:hover { border-color: #3b82f6; color: #3b82f6; }
    .tasks-list__filter--active { background: #3b82f6; color: #ffffff; border-color: #3b82f6; }
    .tasks-list__body { display: flex; flex-direction: column; gap: 0.375rem; }
    .form { display: flex; flex-direction: column; gap: 0.875rem; }
    .form__label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
    .form__input { padding: 0.5rem 0.625rem; border: 1px solid var(--border); border-radius: 0.375rem; font-size: 0.8125rem; outline: none; }
    .form__input:focus { border-color: #3b82f6; }
    .form__textarea { min-height: 60px; resize: vertical; }
    .form__row { display: flex; gap: 0.75rem; }
    .form__row > .form__label { flex: 1; }
    .form__actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .form__btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
    .form__btn--secondary { background: var(--border-soft); color: var(--text-secondary); }
    .form__btn--primary { background: #3b82f6; color: #ffffff; }
    .form__btn--primary:hover { background: #2563eb; }
  `],
})
export class TasksList {
  protected readonly taskService = inject(TaskService);
  protected readonly projectService = inject(ProjectService);
  protected readonly teamService = inject(TeamService);
  protected readonly statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
  protected readonly priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
  protected readonly selectedStatus = signal<TaskStatus | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected form = { title: '', description: '', status: 'todo' as TaskStatus, priority: 'medium' as TaskPriority, projectId: '', assigneeId: '', dueDate: '' };

  readonly filteredTasks = computed(() => {
    const filter = this.selectedStatus();
    const query = this.searchQuery().toLowerCase();
    let tasks = this.taskService.tasks();
    if (filter) tasks = tasks.filter(t => t.status === filter);
    if (query) tasks = tasks.filter(t => t.title.toLowerCase().includes(query));
    return tasks;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openAdd(): void {
    this.editingId.set(null);
    const projects = this.projectService.projects();
    const members = this.teamService.members();
    this.form = {
      title: '', description: '', status: 'todo', priority: 'medium',
      projectId: projects[0]?.id ?? '', assigneeId: members[0]?.id ?? '', dueDate: '',
    };
    this.modalOpen.set(true);
  }

  openEdit(task: Task): void {
    this.editingId.set(task.id);
    this.form = {
      title: task.title, description: task.description, status: task.status,
      priority: task.priority, projectId: task.projectId, assigneeId: task.assigneeId, dueDate: task.dueDate,
    };
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  save(): void {
    if (!this.form.title.trim()) return;
    const id = this.editingId();
    if (id) {
      this.taskService.update(id, this.form);
    } else {
      this.taskService.add(this.form);
    }
    this.closeModal();
  }

  removeTask(id: string): void {
    if (confirm('Delete this task?')) this.taskService.remove(id);
  }
}
