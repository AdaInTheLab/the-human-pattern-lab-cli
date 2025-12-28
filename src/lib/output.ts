// Output is a contract. If it breaks, it should break loudly.

import type { Command } from "commander";
export type OutputMode = "json" | "human";

function getRootCommand(cmd: Command): Command {
    let cur: Command = cmd;
    while (cur.parent) cur = cur.parent;
    return cur;
}

export function getOutputMode(cmd: Command): OutputMode {
    const root = getRootCommand(cmd);
    const opts = root.opts?.() ?? {};
    return opts.json ? "json" : "human";
}

export function printJson(data: unknown) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function printError(message: string) {
    process.stderr.write(message + "\n");
}

export function printJsonError(message: string, extra?: unknown) {
    process.stderr.write(
        JSON.stringify(
            { ok: false, error: { message, extra } },
            null,
            2
        ) + "\n"
    );
}
