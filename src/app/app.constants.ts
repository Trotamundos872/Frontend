import { InjectionToken } from '@angular/core';

export interface AppConfig {
  protocol: string;
  frontendHost: string;
  frontendPort: number;
  backendHost: string;
  backendPort: number;
  frontendUrl: string;
  backendUrl: string;
  apiUrl: string;
  authUrl: string;
  mediaUrl: string;
  uploadUrl: string;
  mailUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const API_URL = new InjectionToken<string>('API_URL');

//Pillado del .env
export const environment: AppConfig = {
  protocol: "http",
  frontendHost: "localhost",
  frontendPort: 4000,
  backendHost: "localhost",
  backendPort: 8080,
  frontendUrl: "http://localhost:4000",
  backendUrl: "http://localhost:8080",
  apiUrl: "http://localhost:8080",
  authUrl: "http://localhost:8080/auth",
  mediaUrl: "https://www.trmc-addons.com/tfg-media",
  uploadUrl: "https://www.trmc-addons.com/tfg-media/subir.php",
  mailUrl: "https://www.trmc-addons.com/tfg-media/mail.php"
};
