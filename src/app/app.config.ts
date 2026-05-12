import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { API_URL, APP_CONFIG, environment } from './app.constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(withFetch()),
    { provide: APP_CONFIG, useValue: environment },
    { provide: API_URL, useValue: environment.apiUrl }
  ]
};
