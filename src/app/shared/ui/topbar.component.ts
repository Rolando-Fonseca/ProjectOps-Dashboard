import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <span class="topbar__page-title">{{ pageTitle() }}</span>
      </div>
      <div class="topbar__right">
        <button class="topbar__theme-toggle" type="button" (click)="themeService.toggle()"
          [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'">
          @if (themeService.theme() === 'dark') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          }
        </button>
        <div class="topbar__avatar" [attr.title]="'Admin'">A</div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 52px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
    }
    .topbar__page-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text);
    }
    .topbar__right {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .topbar__theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .topbar__theme-toggle:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }
    .topbar__avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 600;
      cursor: default;
    }
  `],
})
export class Topbar {
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  private readonly routeTitles: Record<string, string> = {
    '/projects': 'Projects',
    '/tasks': 'Tasks',
    '/team': 'Team',
    '/metrics': 'Metrics',
  };

  // En zoneless nada re-renderiza "solo": router.url no es reactivo, así que
  // convertimos las navegaciones en un signal para que el computed se actualice.
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly pageTitle = computed(() => {
    const url = this.url();
    if (url.includes('/projects/') && !url.endsWith('/projects')) return 'Project Detail';
    const base = '/' + url.split('/').slice(1, 2).join('');
    return this.routeTitles[base] ?? 'Dashboard';
  });
}
