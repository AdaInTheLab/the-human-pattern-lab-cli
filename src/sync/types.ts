// src/sync/types.ts

export type SyncAction = "created" | "updated" | "unchanged";

export type SyncResult = {
    file: string;
    slug?: string;
    status: "ok" | "failed";
    action?: SyncAction;
    error?: string;
    written?: boolean;
};

export type SyncSummary = {
    synced: number;   // actually written (non–dry-run)
    dryRun: number;   // processed in dry-run mode
    failed: number;
    total: number;
};

export type SyncReport = {
    ok: boolean;
    summary: SyncSummary;
    results: SyncResult[];

    // Optional convenience, depends on your current output
    dryRun?: boolean;
    locale?: string;
    baseUrl?: string;
};
