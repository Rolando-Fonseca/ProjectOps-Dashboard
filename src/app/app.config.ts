import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: los parámetros de ruta llegan como input() al componente
    provideRouter(routes, withComponentInputBinding()),
    // En producción (sin backend) el mockApiInterceptor responde /api/* desde datos embebidos
    provideHttpClient(withInterceptors(environment.useMockApi ? [mockApiInterceptor] : [])),
    provideCharts(withDefaultRegisterables()),
  ],
};
