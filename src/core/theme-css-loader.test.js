import { describe, expect, it } from 'vitest';
import { resolveStylesRootHref } from './theme-css-loader.js';

function mockDoc({ pathname = '/index.html', page = '', stylesRoot = '', stylesheetHref = '' } = {}) {
  const html = {
    dataset: {
      page,
      stylesRoot
    }
  };
  const links = stylesheetHref
    ? [{ getAttribute: (name) => (name === 'href' ? stylesheetHref : null) }]
    : [];
  return {
    documentElement: html,
    location: { href: `https://app.test${pathname}` },
    querySelector: (sel) => {
      if (sel.includes('stylesheet') && links.length) {
        return links[0];
      }
      return null;
    },
    createElement: () => ({ id: '', rel: '', setAttribute() {}, getAttribute: () => null }),
    head: { appendChild() {} },
    getElementById: () => null
  };
}

describe('resolveStylesRootHref', () => {
  it('uses data-styles-root when present', () => {
    const doc = mockDoc({ stylesRoot: '../../styles/' });
    expect(resolveStylesRootHref(doc)).toBe('../../styles/');
  });

  it('uses ../../styles/ for calendar page dataset', () => {
    const doc = mockDoc({ page: 'calendar' });
    expect(resolveStylesRootHref(doc)).toBe('../../styles/');
  });

  it('uses ../../styles/ for bundled calendar assets stylesheet', () => {
    const doc = mockDoc({
      pathname: '/pages/calendar/index.html',
      stylesheetHref: '../../assets/electron-nav-abc.css'
    });
    expect(resolveStylesRootHref(doc)).toBe('../../styles/');
  });

  it('uses ./styles/ on app root', () => {
    const doc = mockDoc({ pathname: '/index.html' });
    expect(resolveStylesRootHref(doc)).toBe('./styles/');
  });

  it('walks up from nested calendar pathname', () => {
    const doc = mockDoc({ pathname: '/pages/calendar/index.html' });
    expect(resolveStylesRootHref(doc)).toBe('../../styles/');
  });
});
