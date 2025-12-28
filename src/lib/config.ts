import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { z } from "zod";

/**
 * Skulk CLI configuration schema
 * Stored in ~/.humanpatternlab/skulk.json
 */
const ConfigSchema = z.object({
    apiBaseUrl: z
        .string()
        .url()
        .default("https://thehumanpatternlab.com/api"),

    token: z.string().optional()
});

export type SkulkConfig = z.infer<typeof ConfigSchema>;

function getConfigPath() {
    return path.join(os.homedir(), ".humanpatternlab", "skulk.json");
}

export function loadConfig(): SkulkConfig {
    const p = getConfigPath();

    if (!fs.existsSync(p)) {
        return ConfigSchema.parse({});
    }

    const raw = fs.readFileSync(p, "utf-8");
    return ConfigSchema.parse(JSON.parse(raw));
}

export function saveConfig(partial: Partial<SkulkConfig>) {
    const p = getConfigPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });

    const current = loadConfig();
    const next = ConfigSchema.parse({ ...current, ...partial });

    fs.writeFileSync(p, JSON.stringify(next, null, 2), "utf-8");
}

export function resolveApiBaseUrl(override?: string) {
    if (override) return override;

    if (process.env.HPL_API_BASE_URL) {
        return process.env.HPL_API_BASE_URL;
    }

    return loadConfig().apiBaseUrl;
}

export function resolveToken() {
    return process.env.HPL_TOKEN ?? loadConfig().token;
}
