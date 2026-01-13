import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execa } from "execa";

export type ResolveContentRepoArgs = {
    repo: string; // owner/name OR url
    ref?: string; // branch/tag/sha (default: main)
    cacheDir?: string; // default: ~/.hpl/cache/content
    quietStdout?: boolean; // if true: pipe all git output to stderr
};

function normalizeRepoUrl(repo: string) {
    const raw = repo.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("git@")) return raw;
    return `https://github.com/${raw}.git`;
}

function safeRepoKey(repo: string) {
    // stable-ish folder name for owner/name or URL
    return repo.trim().replace(/[^a-z0-9._-]+/gi, "_").toLowerCase();
}

function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

async function runGit(
    args: string[],
    opts: { cwd?: string; quietStdout?: boolean } = {}
) {
    const p = execa("git", args, {
        cwd: opts.cwd,
        // Avoid stdout pollution when in --json mode (or any strict mode).
        stdio: opts.quietStdout ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    if (opts.quietStdout) {
        p.stdout?.on("data", (d) => process.stderr.write(d));
        p.stderr?.on("data", (d) => process.stderr.write(d));
    }

    return await p;
}

export async function resolveContentRepo({
                                             repo,
                                             ref = "main",
                                             cacheDir,
                                             quietStdout = false,
                                         }: ResolveContentRepoArgs): Promise<{ dir: string; repoUrl: string; ref: string }> {
    const repoUrl = normalizeRepoUrl(repo);
    const base = cacheDir ?? path.join(os.homedir(), ".hpl", "cache", "content");
    const dir = path.join(base, safeRepoKey(repo));

    ensureDir(base);

    const gitDir = path.join(dir, ".git");
    const exists = fs.existsSync(gitDir);

    if (!exists) {
        ensureDir(dir);
        // Clone shallow if branch-like ref; if ref is a sha, shallow clone won’t help much.
        await runGit(["clone", "--depth", "1", "--branch", ref, repoUrl, dir], { quietStdout });
    } else {
        // Keep it predictable: fetch + checkout + ff-only pull.
        await runGit(["-C", dir, "fetch", "--all", "--tags", "--prune"], { quietStdout });
        await runGit(["-C", dir, "checkout", ref], { quietStdout });
        await runGit(["-C", dir, "pull", "--ff-only"], { quietStdout });
    }

    return { dir, repoUrl, ref };
}
