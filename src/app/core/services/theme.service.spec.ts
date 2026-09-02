import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { ThemeService } from './theme.service';

type MediaListener = (e: { matches: boolean }) => void;

describe('ThemeService (linkedSignal)', () => {
  let systemListener: MediaListener | undefined;
  let systemMatches: boolean;

  beforeEach(() => {
    systemMatches = false;
    systemListener = undefined;
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      get matches() { return systemMatches; },
      addEventListener: (_: string, cb: MediaListener) => { systemListener = cb; },
    })));
  });

  afterEach(() => vi.unstubAllGlobals());

  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('arranca siguiendo la preferencia del sistema', () => {
    systemMatches = true;
    expect(createService().theme()).toBe('dark');
  });

  it('toggle pisa la preferencia y la persiste', () => {
    const service = createService();
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('projectops-theme')).toBe('dark');
  });

  it('restaura el tema guardado en localStorage', () => {
    localStorage.setItem('projectops-theme', 'dark');
    expect(createService().theme()).toBe('dark');
  });

  it('linkedSignal: un cambio del sistema recupera el control tras un toggle', () => {
    const service = createService();
    service.toggle(); // usuario fuerza dark
    expect(service.theme()).toBe('dark');

    systemMatches = true;
    systemListener?.({ matches: true }); // el sistema pasa a dark
    systemMatches = false;
    systemListener?.({ matches: false }); // y vuelve a light
    expect(service.theme()).toBe('light'); // la fuente manda de nuevo
  });

  it('estampa data-theme en el documento al estabilizarse los efectos', async () => {
    const service = createService();
    TestBed.inject(ApplicationRef).tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe(service.theme());
  });
});
