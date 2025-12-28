// src/cli/outputContract.ts
import { buildSyncSummary } from "../sync/summary.js";
import type { SyncReport, SyncResult, SyncAction } from "../sync/types.js";

type LegacySyncResult = {
    file: string;
    slug?: string;
    status: "ok" | "fail" | "dry-run";
    action?: SyncAction;
    error?: string;
};

type BuildSyncReportArgs = {
    results: LegacySyncResult[];
    dryRun: boolean;
    locale?: string;
    baseUrl?: string;
};

function normalizeResult(r: LegacySyncResult, dryRunFlag: boolean): SyncResult {
    const status: SyncResult["status"] =
        r.status === "fail" ? "failed" : "ok"; // "dry-run" is not a failure

    // If any result claims "dry-run", treat it as dry-run even if flag is off (safety)
    const effectiveDryRun = dryRunFlag || r.status === "dry-run";

    return {
        file: r.file,
        slug: r.slug,
        status,
        action: r.action,
        error: r.error,

        // written only when not dry-run and ok
        written: !effectiveDryRun && status === "ok",
    };
}

export function buildSyncReport(args: BuildSyncReportArgs): SyncReport {
    const { results, dryRun, locale, baseUrl } = args;

    const normalized: SyncResult[] = results.map((r) => normalizeResult(r, dryRun));

    // IMPORTANT: pass the effective dryRun mode you used for written calc
    // If you want to be ultra strict, you could compute effectiveDryRun = dryRun || any(r.status==="dry-run")
    const effectiveDryRun = dryRun || results.some((r) => r.status === "dry-run");

    const summary = buildSyncSummary(normalized, effectiveDryRun);

    return {
        ok: summary.failed === 0,
        summary,
        results: normalized,
        dryRun: effectiveDryRun,
        locale,
        baseUrl,
    };
}
