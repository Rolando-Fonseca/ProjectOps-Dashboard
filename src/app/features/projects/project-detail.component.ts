import { Component, inject, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { TeamService } from '../../core/services/team.service';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { ElapsedTimePipe } from '../../shared/pipes/elapsed-time.pipe';
import { PercentValuePipe } from '../../shared/pipes/percent.pipe';
import { LoadingSpinner } from '../../shared/ui/loading-spinner.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, StatusLabelPipe, ElapsedTimePipe, PercentValuePipe, LoadingSpinner],
  template: `
    <div class="project-detail">
      @if (project(); as p) {
        <a class="project-detail__back" routerLink="/projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5m0 0l7 7m-7-7l7-7"/></svg>
          Projects
        </a>

        <div class="project-detail__header">
          <h1>{{ p.name }}</h1>
          <span class="project-detail__status" [attr.data-status]="p.status">
            {{ p.status | statusLabel }}
          </span>
        </div>

        <p class="project-detail__desc">{{ p.description }}</p>

        <div class="project-detail__stats">
          <div class="stat-block">
            <span class="stat-block__value">{{ p.progress | percentValue }}</span>
            <span class="stat-block__label">Progress</span>
          </div>
          <div class="stat-block">
            <span class="stat-block__value">{{ projectTasks().length }}</span>
            <span class="stat-block__label">Tasks</span>
          </div>
          <div class="stat-block">
            <span class="stat-block__value">{{ projectMembers().length }}</span>
            <span class="stat-block__label">Members</span>
          </div>
          <div class="stat-block">
            <span class="stat-block__value">{{ p.startDate | elapsedTime }}</span>
            <span class="stat-block__label">Started</span>
          </div>
        </div>

        <div class="project-detail__progress">
          <div class="project-detail__progress-bar">
            <div class="project-detail__progress-fill" [style.width.%]="p.progress"></div>
          </div>
        </div>

        <section class="project-detail__section">
          <h2>Tasks</h2>
          @if (projectTasks().length === 0) {
            <p class="project-detail__empty">No tasks assigned to this project</p>
          } @else {
            <div class="project-detail__tasks">
              @for (task of projectTasks(); track task.id) {
                <div class="task-item">
                  <span class="task-item__status" [attr.data-status]="task.status">
                    {{ task.status | statusLabel }}
                  </span>
                  <span class="task-item__title">{{ task.title }}</span>
                  <span class="task-item__priority" [attr.data-priority]="task.priority">
                    {{ task.priority | statusLabel }}
                  </span>
                </div>
              }
            </div>
          }
        </section>

        <section class="project-detail__section">
          <h2>Team</h2>
          @if (projectMembers().length === 0) {
            <p class="project-detail__empty">No team members assigned</p>
          } @else {
            <div class="project-detail__team">
              @for (member of projectMembers(); track member.id) {
                <div class="member-chip">
                  <div class="member-chip__avatar">{{ member.avatar }}</div>
                  <div>
                    <div class="member-chip__name">{{ member.name }}</div>
                    <div class="member-chip__role">{{ member.role }}</div>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      } @else if (!projectService.loading()) {
        <p class="project-detail__not-found">Project not found</p>
        <a class="project-detail__back" routerLink="/projects">Back to Projects</a>
      } @else {
        <app-loading-spinner message="Loading project..." />
      }
    </div>
  `,
  styles: [`
    .project-detail__back {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 1rem;
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .project-detail__back:hover { text-decoration: underline; }
    .project-detail__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .project-detail__header h1 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text);
    }
    .project-detail__status {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-weight: 500;
    }
    .project-detail__status[data-status="active"] { background: var(--chip-info-bg); color: var(--chip-info-text); }
    .project-detail__status[data-status="on-hold"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .project-detail__status[data-status="completed"] { background: var(--chip-success-bg); color: var(--chip-success-text); }
    .project-detail__desc {
      color: var(--text-muted);
      margin: 0 0 1.25rem;
      line-height: 1.6;
      font-size: 0.875rem;
    }
    .project-detail__stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      padding: 1rem 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
    }
    .stat-block {
      display: flex;
      flex-direction: column;
    }
    .stat-block__value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text);
    }
    .stat-block__label {
      font-size: 0.6875rem;
      color: var(--text-subtle);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .project-detail__progress {
      margin-bottom: 2rem;
    }
    .project-detail__progress-bar {
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    .project-detail__progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .project-detail__section {
      margin-bottom: 2rem;
    }
    .project-detail__section h2 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 0.75rem;
    }
    .project-detail__empty {
      font-size: 0.8125rem;
      color: var(--text-subtle);
      margin: 0;
    }
    .task-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-soft);
    }
    .task-item__status {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      font-weight: 500;
      white-space: nowrap;
    }
    .task-item__status[data-status="todo"] { background: var(--border-soft); color: var(--text-secondary); }
    .task-item__status[data-status="in-progress"] { background: var(--chip-info-bg); color: var(--chip-info-text); }
    .task-item__status[data-status="review"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .task-item__status[data-status="done"] { background: var(--chip-success-bg); color: var(--chip-success-text); }
    .task-item__title { flex: 1; font-size: 0.8125rem; color: var(--text-secondary); }
    .task-item__priority {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .task-item__priority[data-priority="critical"] { background: var(--chip-danger-bg); color: var(--chip-danger-text); }
    .task-item__priority[data-priority="high"] { background: var(--chip-orange-bg); color: var(--chip-orange-text); }
    .task-item__priority[data-priority="medium"] { background: var(--chip-warn-bg); color: var(--chip-warn-text); }
    .task-item__priority[data-priority="low"] { background: var(--border-soft); color: var(--text-muted); }
    .project-detail__team {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .member-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.375rem 0.625rem;
    }
    .member-chip__avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 600;
    }
    .member-chip__name { font-size: 0.8125rem; font-weight: 500; color: var(--text); }
    .member-chip__role { font-size: 0.6875rem; color: var(--text-subtle); }
    .project-detail__not-found {
      font-size: 0.9375rem;
      color: var(--text-subtle);
      margin: 2rem 0 1rem;
    }
  `],
})
export class ProjectDetail {
  protected readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly teamService = inject(TeamService);

  // withComponentInputBinding: el parámetro :id de la ruta llega como signal input
  readonly id = input.required<string>();

  readonly project = computed(() => this.projectService.projectById(this.id())());
  readonly projectTasks = computed(() => this.taskService.tasksByProject(this.id())());
  readonly projectMembers = computed(() => this.teamService.membersByProject(this.id())());
}
