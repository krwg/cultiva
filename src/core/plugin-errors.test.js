import { describe, expect, it } from 'vitest';
import { formatPluginInstallError } from './plugin-errors.js';

describe('formatPluginInstallError', () => {
  it('formats version mismatch for users', () => {
    const msg = formatPluginInstallError('app 1.7.0 < required 2.0.0', {
      pluginRequiresVersion: 'Needs Cultiva {required}+. You have {current}. Update.'
    });
    expect(msg).toBe('Needs Cultiva 2.0.0+. You have 1.7.0. Update.');
  });

  it('falls back when detail is empty', () => {
    expect(formatPluginInstallError('', { pluginInstallStartFailed: 'Could not start.' })).toBe('Could not start.');
  });
});
