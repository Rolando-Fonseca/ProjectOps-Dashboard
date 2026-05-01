import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout.component').then(m => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'projects',
        pathMatch: 'full',
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects-board.component').then(m => m.ProjectsBoard),
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail.component').then(m => m.ProjectDetail),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/tasks-list.component').then(m => m.TasksList),
      },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team-overview.component').then(m => m.TeamOverview),
      },
      {
        path: 'metrics',
        loadComponent: () => import('./features/metrics/metrics-dashboard.component').then(m => m.MetricsDashboard),
      },
    ],
  },
];
