import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <svg class="sidebar__logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
        </svg>
        <span class="sidebar__brand-text">ProjectOps</span>
      </div>
      <nav class="sidebar__nav">
        @for (item of navItems(); track item.path) {
          <a class="sidebar__link"
             [routerLink]="item.path"
             routerLinkActive="sidebar__link--active"
             [routerLinkActiveOptions]="{ exact: item.exact }">
            <svg class="sidebar__icon" [attr.viewBox]="item.iconViewBox" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (item.icon === 'projects') {
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              } @else if (item.icon === 'tasks') {
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              } @else if (item.icon === 'team') {
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              } @else if (item.icon === 'metrics') {
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              }
            </svg>
            <span class="sidebar__label">{{ item.label }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1.25rem 1.125rem;
      border-bottom: 1px solid #1e293b;
    }
    .sidebar__logo {
      width: 24px;
      height: 24px;
      color: #3b82f6;
      flex-shrink: 0;
    }
    .sidebar__brand-text {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .sidebar__nav {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .sidebar__link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .sidebar__link:hover {
      background: #1e293b;
      color: #e2e8f0;
    }
    .sidebar__link--active {
      background: #3b82f6;
      color: #ffffff;
    }
    .sidebar__link--active:hover {
      background: #2563eb;
      color: #ffffff;
    }
    .sidebar__icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  `],
})
export class Sidebar {
  protected readonly navItems = signal([
    { path: '/projects', label: 'Projects', icon: 'projects', iconViewBox: '0 0 24 24', exact: false },
    { path: '/tasks', label: 'Tasks', icon: 'tasks', iconViewBox: '0 0 24 24', exact: true },
    { path: '/team', label: 'Team', icon: 'team', iconViewBox: '0 0 24 24', exact: true },
    { path: '/metrics', label: 'Metrics', icon: 'metrics', iconViewBox: '0 0 24 24', exact: true },
  ]);
}
