import { describe, expect, it, beforeEach } from 'vitest';
import { SKULK_BASE_URL, SKULK_TOKEN } from '../lib/config.js';

describe('env config', () => {
  beforeEach(() => {
    delete process.env.SKULK_BASE_URL;
    delete process.env.SKULK_TOKEN;
    delete process.env.HPL_API_BASE_URL;
    delete process.env.HPL_TOKEN;
  });

  it('uses SKULK_TOKEN when set', () => {
    process.env.SKULK_TOKEN = 'abc123';
    expect(SKULK_TOKEN()).toBe('abc123');
  });

  it('uses SKULK_BASE_URL when set', () => {
    process.env.SKULK_BASE_URL = 'https://example.com/api';
    expect(SKULK_BASE_URL()).toBe('https://example.com/api');
  });

  it('override beats SKULK_BASE_URL', () => {
    process.env.SKULK_BASE_URL = 'https://example.com/api';
    expect(SKULK_BASE_URL('https://override.com/api')).toBe(
      'https://override.com/api',
    );
  });
});
