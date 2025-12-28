import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';

/**
 * Skulk CLI configuration schema
 * Stored in ~/.humanpatternlab/skulk.json
 */
const ConfigSchema = z.object({
  apiBaseUrl: z.string().url().default('https://thehumanpatternlab.com/api'),

  token: z.string().optional(),
});

export type SkulkConfig = z.infer<typeof ConfigSchema>;

function getConfigPath() {
  return path.join(os.homedir(), '.humanpatternlab', 'skulk.json');
}

export function loadConfig(): SkulkConfig {
  const p = getConfigPath();

  if (!fs.existsSync(p)) {
    return ConfigSchema.parse({});
  }

  const raw = fs.readFileSync(p, 'utf-8');
  return ConfigSchema.parse(JSON.parse(raw));
}

export function saveConfig(partial: Partial<SkulkConfig>) {
  const p = getConfigPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });

  const current = loadConfig();
  const next = ConfigSchema.parse({ ...current, ...partial });

  fs.writeFileSync(p, JSON.stringify(next, null, 2), 'utf-8');
}

export function SKULK_BASE_URL(override?: string) {
  if (override?.trim()) return override.trim();

  // NEW official env var
  const env = process.env.SKULK_BASE_URL?.trim();
  if (env) return env;

  // optional legacy support (remove later if you want)
  const legacy = process.env.HPL_API_BASE_URL?.trim();
  if (legacy) return legacy;

  return loadConfig().apiBaseUrl;
}

export function SKULK_TOKEN() {
  const env = process.env.SKULK_TOKEN?.trim();
  if (env) return env;

  const legacy = process.env.HPL_TOKEN?.trim();
  if (legacy) return legacy;

  return loadConfig().token;
}
