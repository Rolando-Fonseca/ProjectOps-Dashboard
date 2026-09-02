import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { ProjectCard } from './project-card.component';
import { Modal } from '../../shared/ui/modal.component';
import { LoadingSpinner } from '../../shared/ui/loading-spinner.component';
import { EmptyState } from '../../shared/ui/empty-state.component';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { PercentValuePipe } from '../../shared/pipes/percent.pipe';
import { Project, ProjectStatus } from '../../core/models';

@Component({
  selector: 'app-projects-board',
  standalone: true,
  imports: [ProjectCard, Modal, FormsModule, LoadingSpinner, EmptyState, StatusLabelPipe, PercentValuePipe],
  template: `
    <div class="projects-board">
      <div class="projects-board__header">
        <div>
          <h1>Projects</h1>
          <span class="projects-board__count">{{ projectService.projectCount() }} total &middot; {{ projectService.activeProjects().length }} active</span>
        </div>
        <div class="projects-board__actions">
          <div class="projects-board__filters">
            @for (status of statusFilters; track status) {
              <button class="projects-board__filter"
                [class.projects-board__filter--active]="selectedFilter() === status"
                (click)="selectedFilter.set(status)">
                {{ status | statusLabel }}
              </button>
            }
            <button class="projects-board__filter"
              [class.projects-board__filter--active]="selectedFilter() === null"
              (click)="selectedFilter.set(null)">All</button>
          </div>
          <button class="projects-board__add" (click)="openAdd()">+ Add Project</button>
        </div>
      </div>

      <div class="projects-board__summary">
        <div class="summary-stat">
          <span class="summary-stat__value">{{ projectService.avgProgress() | percentValue }}</span>
          <span class="summary-stat__label">Avg Progress</span>
        </div>
        <div class="summary-stat">
          <span class="summary-stat__value">{{ projectService.byStatus().completed.length }}</span>
          <span class="summary-stat__label">Completed</span>
        </div>
        <div class="summary-stat">
          <span class="summary-stat__value">{{ projectService.byStatus()['on-hold'].length }}</span>
          <span class="summary-stat__label">On Hold</span>
        </div>
      </div>

      @if (projectService.loading()) {
        <app-loading-spinner message="Loading projects..." />
      } @else if (projectService.error()) {
        <app-empty-state [message]="'Error: ' + projectService.error()!" />
      } @else if (filteredProjects().length === 0) {
        <app-empty-state [message]="'No projects match this filter'" />
      } @else {
        <div class="projects-board__grid">
          @for (project of filteredProjects(); track project.id) {
            <app-project-card [project]="project" (edit)="openEdit(project)" (delete)="removeProject(project.id)" />
          }
        </div>
      }
    </div>

    <app-modal [open]="modalOpen()" [title]="editingId() ? 'Edit Project' : 'New Project'" (cancel)="closeModal()">
      <form class="form" (ngSubmit)="save()">
        <label class="form__label">Name
          <input class="form__input" [(ngModel)]="form.name" name="name" required />
        </label>
        <label class="form__label">Description
          <textarea class="form__input form__textarea" [(ngModel)]="form.description" name="description"></textarea>
        </label>
        <label class="form__label">Status
          <select class="form__input" [(ngModel)]="form.status" name="status">
            @for (s of statusFilters; track s) {
              <option [value]="s">{{ s | statusLabel }}</option>
            }
          </select>
        </label>
        <label class="form__label">Progress ({{ form.progress }}%)
          <input class="form__range" type="range" min="0" max="100" [(ngModel)]="form.progress" name="progress" />
        </label>
        <label class="form__label">Start Date
          <input class="form__input" type="date" [(ngModel)]="form.startDate" name="startDate" />
        </label>
        <label class="form__label">End Date
          <input class="form__input" type="date" [(ngModel)]="form.endDate" name="endDate" />
        </label>
        <div class="form__actions">
          <button class="form__btn form__btn--secondary" type="button" (click)="closeModal()">Cancel</button>
          <button class="form__btn form__btn--primary" type="submit">{{ editingId() ? 'Update' : 'Create' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .projects-board__header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
    }
    .projects-board__header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .projects-board__count { font-size: 0.8125rem; color: var(--text-muted); }
    .projects-board__actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .projects-board__filters { display: flex; gap: 0.25rem; }
    .projects-board__filter {
      padding: 0.375rem 0.625rem; border-radius: 0.375rem; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-muted); font-size: 0.75rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s ease;
    }
    .projects-board__filter:hover { border-color: #3b82f6; color: #3b82f6; }
    .projects-board__filter--active { background: #3b82f6; color: #ffffff; border-color: #3b82f6; }
    .projects-board__add {
      padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: none;
      background: #10b981; color: #ffffff; font-size: 0.75rem; font-weight: 600;
      cursor: pointer; transition: background 0.15s ease;
    }
    .projects-board__add:hover { background: #059669; }
    .projects-board__summary {
      display: flex; gap: 2rem; margin-bottom: 1.5rem; padding: 1rem 1.25rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;
    }
    .summary-stat { display: flex; flex-direction: column; }
    .summary-stat__value { font-size: 1.25rem; font-weight: 700; color: var(--text); }
    .summary-stat__label { font-size: 0.6875rem; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.5px; }
    .projects-board__grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;
    }
    .form { display: flex; flex-direction: column; gap: 0.875rem; }
    .form__label {
      display: flex; flex-direction: column; gap: 0.25rem;
      font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary);
    }
    .form__input {
      padding: 0.5rem 0.625rem; border: 1px solid var(--border); border-radius: 0.375rem;
      font-size: 0.8125rem; outline: none; transition: border-color 0.15s ease;
    }
    .form__input:focus { border-color: #3b82f6; }
    .form__textarea { min-height: 60px; resize: vertical; }
    .form__range { width: 100%; accent-color: #3b82f6; }
    .form__actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
    .form__btn {
      padding: 0.5rem 1rem; border-radius: 0.375rem; border: none;
      font-size: 0.8125rem; font-weight: 600; cursor: pointer;
    }
    .form__btn--secondary { background: var(--border-soft); color: var(--text-secondary); }
    .form__btn--secondary:hover { background: var(--border); }
    .form__btn--primary { background: #3b82f6; color: #ffffff; }
    .form__btn--primary:hover { background: #2563eb; }
  `],
})
export class ProjectsBoard {
  protected readonly projectService = inject(ProjectService);
  protected readonly statusFilters: ProjectStatus[] = ['active', 'on-hold', 'completed', 'archived'];
  protected readonly selectedFilter = signal<ProjectStatus | null>(null);
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected form = { name: '', description: '', status: 'active' as ProjectStatus, progress: 0, startDate: '', endDate: '' };

  readonly filteredProjects = computed(() => {
    const filter = this.selectedFilter();
    const projects = this.projectService.projects();
    return filter ? projects.filter(p => p.status === filter) : projects;
  });

  openAdd(): void {
    this.editingId.set(null);
    this.form = { name: '', description: '', status: 'active', progress: 0, startDate: '', endDate: '' };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const id = this.editingId();
    if (id) {
      this.projectService.update(id, this.form);
    } else {
      this.projectService.add({ ...this.form, teamMemberIds: [], taskIds: [] });
    }
    this.closeModal();
  }

  openEdit(project: Project): void {
    this.editingId.set(project.id);
    this.form = {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
    };
    this.modalOpen.set(true);
  }

  removeProject(id: string): void {
    if (confirm('Delete this project?')) {
      this.projectService.remove(id);
    }
  }
}
