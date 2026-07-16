import { describe, it, expect } from 'vitest';
import { sanitizePluginHtml } from './sanitize-plugin-html.js';
import { escapeHtml } from './escape-html.js';

describe('sanitizePluginHtml', () => {
  it('strips script and event handlers', () => {
    const out = sanitizePluginHtml(
      '<div onclick="alert(1)"><script>evil()</script><a href="javascript:alert(2)">x</a><p>ok</p></div>'
    );
    expect(out).not.toMatch(/script/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).toMatch(/ok/);
  });
});

describe('escapeHtml', () => {
  it('escapes angle brackets and quotes', () => {
    expect(escapeHtml('<img src="x" onerror=\'y\'>')).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;'
    );
  });
});
