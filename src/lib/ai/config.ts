import { AIConfig } from './types';
import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'config', 'ai.config.json');

let cachedConfig: AIConfig | null = null;
let configPath: string = process.env.AI_CONFIG_PATH || DEFAULT_CONFIG_PATH;
let lastLoadedAt: number = 0;
const CACHE_TTL_MS = 30000;

function loadConfigFromFile(): AIConfig {
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as AIConfig;
}

export function getAIConfig(forceReload = false): AIConfig {
  const now = Date.now();
  if (!cachedConfig || forceReload || (now - lastLoadedAt > CACHE_TTL_MS)) {
    cachedConfig = loadConfigFromFile();
    lastLoadedAt = now;
  }
  return cachedConfig;
}

export function setConfigPath(newPath: string): void {
  configPath = newPath;
  cachedConfig = null;
}
