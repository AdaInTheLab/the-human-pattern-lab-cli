import { describe, expect, it, beforeEach } from 'vitest';
import { HPL_BASE_URL, HPL_TOKEN } from '../lib/config.js';

describe('env config', () => {
  beforeEach(() => {
    delete process.env.HPL_BASE_URL;
    delete process.env.HPL_TOKEN;
    delete process.env.HPL_API_BASE_URL;
    delete process.env.HPL_TOKEN;
  });

  it('uses HPL_TOKEN when set', () => {
    process.env.HPL_TOKEN = 'abc123';
    expect(HPL_TOKEN()).toBe('abc123');
  });

  it('uses HPL_BASE_URL when set', () => {
    process.env.HPL_BASE_URL = 'https://example.com';
    expect(HPL_BASE_URL()).toBe('https://example.com');
  });

  it('override beats HPL_BASE_URL', () => {
    process.env.HPL_BASE_URL = 'https://example.com';
    expect(HPL_BASE_URL('https://override.com')).toBe(
      'https://override.com',
    );
  });
});
