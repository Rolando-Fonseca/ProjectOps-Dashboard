import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <span class="topbar__page-title">{{ pageTitle() }}</span>
      </div>
      <div class="topbar__right">
        <div class="topbar__avatar" [attr.title]="'Admin'">A</div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 52px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
    }
    .topbar__page-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1e293b;
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
