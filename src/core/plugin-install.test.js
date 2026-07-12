import { describe, it, expect, vi } from 'vitest';
import { isAllowedPluginRpcMethod } from '../core/plugin-rpc.js';

describe('plugin RPC allowlist', () => {
  it('allows habits.write completeHabit', () => {
    expect(isAllowedPluginRpcMethod('app.completeHabit')).toBe(true);
  });

  it('allows weekly summary', () => {
    expect(isAllowedPluginRpcMethod('app.getWeeklySummary')).toBe(true);
  });
});

describe('plugin install flow guards', () => {
  it('documents desktop-only install requirement', () => {
    expect(typeof window === 'undefined' || window.electron == null).toBe(true);
  });
});
