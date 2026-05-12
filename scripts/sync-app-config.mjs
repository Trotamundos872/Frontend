import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(currentDir, '..', '..');
const envPath = join(projectRoot, '.env');
const outputPath = join(projectRoot, 'Frontend', 'src', 'app', 'app.constants.ts');

function parseEnvFile(fileContents) {
  const values = {};

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function requireValue(values, key, fallback) {
  return values[key] || fallback;
}

const env = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, 'utf8')) : {};

function resolveConfigValue(key, fallback) {
  return process.env[key] || env[key] || fallback;
}

const protocol = resolveConfigValue('APP_PROTOCOL', 'http');
const frontendHost = resolveConfigValue('FRONTEND_HOST', 'localhost');
const frontendPort = Number.parseInt(resolveConfigValue('FRONTEND_PORT', '4000'), 10);
const backendHost = resolveConfigValue('BACKEND_HOST', 'localhost');
const backendPort = Number.parseInt(resolveConfigValue('BACKEND_PORT', '8080'), 10);
const mediaBaseUrl = resolveConfigValue('MEDIA_BASE_URL', 'https://www.trmc-addons.com/tfg-media');

const frontendUrl = `${protocol}://${frontendHost}:${frontendPort}`;
const backendUrl = `${protocol}://${backendHost}:${backendPort}`;
const authUrl = `${backendUrl}/auth`;
const apiUrl = backendUrl;
const uploadUrl = `${mediaBaseUrl}/subir.php`;
const mailUrl = `${mediaBaseUrl}/mail.php`;

const generatedFile = `import { InjectionToken } from '@angular/core';

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

// Auto-generated from the repository root .env file.
export const environment: AppConfig = {
  protocol: ${JSON.stringify(protocol)},
  frontendHost: ${JSON.stringify(frontendHost)},
  frontendPort: ${frontendPort},
  backendHost: ${JSON.stringify(backendHost)},
  backendPort: ${backendPort},
  frontendUrl: ${JSON.stringify(frontendUrl)},
  backendUrl: ${JSON.stringify(backendUrl)},
  apiUrl: ${JSON.stringify(apiUrl)},
  authUrl: ${JSON.stringify(authUrl)},
  mediaUrl: ${JSON.stringify(mediaBaseUrl)},
  uploadUrl: ${JSON.stringify(uploadUrl)},
  mailUrl: ${JSON.stringify(mailUrl)}
};
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, generatedFile, 'utf8');
console.log(`Configuracion generada en ${outputPath}`);
