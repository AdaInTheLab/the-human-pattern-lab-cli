// src/sync/summary.ts
import type { SyncResult, SyncSummary } from "./types.js";

export function buildSyncSummary(
    results: SyncResult[],
    dryRunMode: boolean
): SyncSummary {
    let synced = 0;
    let dryRun = 0;
    let failed = 0;

    for (const r of results) {
        if (r.status === "failed") {
            failed++;
            continue;
        }

        if (dryRunMode) dryRun++;
        else synced++;
    }

    const total = results.length;

    // Invariant: dry-run must never report synced writes
    if (dryRunMode && synced > 0) {
        throw new Error(
            "Invariant violation: dry-run mode cannot produce synced > 0"
        );
    }

    // Invariant: accounting must balance
    if (synced + dryRun + failed !== total) {
        throw new Error(
            "SyncSummary invariant failed: counts do not add up to total"
        );
    }

    return { synced, dryRun, failed, total };
}

