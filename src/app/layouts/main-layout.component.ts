import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../shared/ui/sidebar.component';
import { Topbar } from '../shared/ui/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="layout__main">
        <app-topbar />
        <main class="layout__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }
    .layout__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .layout__content {
      flex: 1;
      padding: 1.5rem;
      background: var(--bg);
      overflow-y: auto;
    }
  `],
})
export class MainLayout {}
