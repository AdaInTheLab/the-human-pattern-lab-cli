import { describe, expect, it } from 'vitest';
import { buildSyncReport } from '../cli/outputContract.js';

describe('buildSyncReport (JSON contract)', () => {
  it('counts synced in live mode (dryRun=false)', () => {
    const report = buildSyncReport({
      dryRun: false,
      locale: 'en',
      baseUrl: 'https://example.com/api',
      results: [
        { file: 'a.md', slug: 'a', status: 'ok', action: 'updated' },
        { file: 'b.md', slug: 'b', status: 'ok', action: 'created' },
      ],
    });

    expect(report.ok).toBe(true);
    expect(report.summary).toEqual({
      synced: 2,
      dryRun: 0,
      failed: 0,
      total: 2,
    });
    expect(report.results.every((r) => r.written === true)).toBe(true);
  });

  it('counts dryRun in dry-run mode (dryRun=true)', () => {
    const report = buildSyncReport({
      dryRun: true,
      results: [
        { file: 'a.md', slug: 'a', status: 'dry-run' },
        { file: 'b.md', slug: 'b', status: 'dry-run' },
      ],
    });

    expect(report.ok).toBe(true);
    expect(report.dryRun).toBe(true);
    expect(report.summary).toEqual({
      synced: 0,
      dryRun: 2,
      failed: 0,
      total: 2,
    });
    expect(report.results.every((r) => r.written === false)).toBe(true);
  });

  it('normalizes legacy fail -> failed and keeps totals balanced', () => {
    const report = buildSyncReport({
      dryRun: false,
      results: [
        { file: 'a.md', slug: 'a', status: 'ok' },
        { file: 'b.md', status: 'fail', error: 'boom' },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.summary).toEqual({
      synced: 1,
      dryRun: 0,
      failed: 1,
      total: 2,
    });
    expect(report.results[1].status).toBe('failed');
  });
});
