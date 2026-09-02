import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-container" [class.spinner-container--overlay]="overlay()">
      <div class="spinner"></div>
      @if (message()) {
        <span class="spinner-message">{{ message() }}</span>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      gap: 0.75rem;
    }
    .spinner-container--overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.7);
      z-index: 10;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--border);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    .spinner-message {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingSpinner {
  readonly message = input('');
  readonly overlay = input(false);
}
