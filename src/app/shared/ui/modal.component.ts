import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="cancel.emit()"></div>
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">{{ title() }}</h3>
          <button class="modal__close" (click)="cancel.emit()" type="button">&times;</button>
        </div>
        <div class="modal__body">
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      z-index: 100;
    }
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border-radius: 0.75rem;
      min-width: 420px;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 101;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal__title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }
    .modal__close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .modal__close:hover { color: #475569; }
    .modal__body {
      padding: 1.25rem;
    }
  `],
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly cancel = output();
}
