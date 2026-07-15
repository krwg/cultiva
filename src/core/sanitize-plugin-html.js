const BANNED_TAGS = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE']);

/**
 * Defense-in-depth for registry plugins (already trusted): strip high-risk tags/attrs
 * before mounting plugin-contributed HTML into the privileged renderer.
 */
export function sanitizePluginHtml(html) {
  if (typeof DOMParser === 'undefined') {
    return String(html || '')
      .replace(/<\/?(?:script|iframe|object|embed|link|meta|base)\b[^>]*>/gi, '')
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\s(?:href|src|action|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi, '');
  }

  const doc = new DOMParser().parseFromString(`<div id="cv-root">${String(html || '')}</div>`, 'text/html');
  const root = doc.getElementById('cv-root') || doc.body;

  const walk = (node) => {
    const children = Array.from(node.children || []);
    for (const el of children) {
      if (BANNED_TAGS.has(el.tagName)) {
        el.remove();
        continue;
      }
      for (const attr of Array.from(el.attributes || [])) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (
          (name === 'href' || name === 'src' || name === 'action' || name === 'xlink:href')
          && /^\s*javascript:/i.test(attr.value || '')
        ) {
          el.removeAttribute(attr.name);
        }
      }
      walk(el);
    }
  };

  walk(root);
  return root.innerHTML;
}
