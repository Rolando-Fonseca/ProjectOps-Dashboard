import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p class="empty-state__message">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem 1rem;
      gap: 0.75rem;
    }
    .empty-state__icon {
      width: 40px;
      height: 40px;
      color: #cbd5e1;
    }
    .empty-state__message {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
    }
  `],
})
export class EmptyState {
  readonly message = input('No data available');
}
