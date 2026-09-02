import { Injectable, effect, linkedSignal, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'projectops-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly systemPrefersDark = signal(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // linkedSignal: el tema sigue la preferencia del sistema como valor por
  // defecto, pero un set() del usuario la pisa hasta el siguiente cambio
  // del sistema. Es el caso de uso canónico de linkedSignal.
  readonly theme = linkedSignal<boolean, Theme>({
    source: this.systemPrefersDark,
    computation: prefersDark => (prefersDark ? 'dark' : 'light'),
  });

  constructor() {
    const stored = this.readStored();
    if (stored) {
      this.theme.set(stored);
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => this.systemPrefersDark.set(e.matches));

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // almacenamiento no disponible (modo privado, etc.): el toggle sigue funcionando en sesión
    }
  }

  private readStored(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
