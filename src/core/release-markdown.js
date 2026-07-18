function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeGithubBody(body) {
  let src = String(body || '').trim();
  if (!src) {
    return '';
  }

  src = src.replace(/<img\b([^>]*?)\/?>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) {
      return '';
    }
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : 'image';
    return `\n\n![${alt}](${srcMatch[1]})\n\n`;
  });

  src = src.replace(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi, (_, summary, content) => {
    const inner = String(content).replace(/<[^>]+>/g, '').trim();
    return `\n\n### ${String(summary).replace(/<[^>]+>/g, '').trim()}\n\n${inner}\n\n`;
  });

  src = src.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
    const text = String(label).replace(/<[^>]+>/g, '').trim();
    return `[${text || href}](${href})`;
  });

  src = src.replace(/<br\s*\/?>/gi, '\n');
  src = src.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  src = src.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
    const hashes = '#'.repeat(Math.min(6, Number(level) || 3));
    return `\n\n${hashes} ${String(text).replace(/<[^>]+>/g, '').trim()}\n\n`;
  });

  src = src.replace(/<[^>]+>/g, '');
  return src.trim();
}

function inlineMarkdown(text) {
  const placeholders = [];
  let work = String(text ?? '');

  const stash = (html) => {
    const token = `@@PH${placeholders.length}@@`;
    placeholders.push(html);
    return token;
  };

  work = work.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    stash(`<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">`));
  work = work.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) =>
    stash(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`));
  work = work.replace(/\*\*([^*]+)\*\*/g, (_, bold) => stash(`<strong>${escapeHtml(bold)}</strong>`));
  work = work.replace(/__([^_]+)__/g, (_, bold) => stash(`<strong>${escapeHtml(bold)}</strong>`));
  work = work.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, (_, pre, ital) => `${pre}${stash(`<em>${escapeHtml(ital)}</em>`)}`);
  work = work.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, (_, pre, ital) => `${pre}${stash(`<em>${escapeHtml(ital)}</em>`)}`);
  work = work.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));

  work = escapeHtml(work);
  placeholders.forEach((html, i) => {
    work = work.replace(`@@PH${i}@@`, html);
  });
  return work;
}

function isTableDivider(line) {
  return /^\|?[\s:-]+\|[\s|:-]+$/.test(line.trim());
}

function parseTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function renderTableBlock(lines) {
  if (lines.length < 2) {
    return `<p>${inlineMarkdown(lines.join(' '))}</p>`;
  }
  const header = parseTableRow(lines[0]);
  const bodyLines = isTableDivider(lines[1]) ? lines.slice(2) : lines.slice(1);
  const rows = bodyLines.map(parseTableRow).filter((row) => row.some(Boolean));
  const thead = `<thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row) =>
    `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<table class="release-md-table">${thead}${tbody}</table>`;
}

export function renderReleaseMarkdown(body) {
  const normalized = normalizeGithubBody(body);
  if (!normalized) {
    return '<p>No release notes.</p>';
  }

  const blocks = [];
  const lines = normalized.split('\n');
  let inCode = false;
  let codeBuf = [];
  let listBuf = [];
  let tableBuf = [];

  const flushList = () => {
    if (!listBuf.length) {
      return;
    }
    const ordered = listBuf[0]?.ordered;
    const tag = ordered ? 'ol' : 'ul';
    blocks.push(`<${tag}>${listBuf.map((item) => `<li>${inlineMarkdown(item.text)}</li>`).join('')}</${tag}>`);
    listBuf = [];
  };

  const flushTable = () => {
    if (!tableBuf.length) {
      return;
    }
    blocks.push(renderTableBlock(tableBuf));
    tableBuf = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      flushList();
      flushTable();
      if (inCode) {
        blocks.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushList();
      flushTable();
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      flushList();
      flushTable();
      blocks.push('<hr class="release-md-hr">');
      continue;
    }

    if (line.trim().startsWith('|')) {
      flushList();
      tableBuf.push(line.trim());
      continue;
    }

    if (tableBuf.length) {
      flushTable();
    }

    if (/^#{1,6}\s+/.test(line)) {
      flushList();
      const level = Math.min(6, line.match(/^#+/)[0].length);
      const text = line.replace(/^#{1,6}\s+/, '');
      const tag = Math.min(4, level);
      blocks.push(`<h${tag}>${inlineMarkdown(text)}</h${tag}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (listBuf.length && listBuf[0].ordered) {
        flushList();
      }
      listBuf.push({ ordered: false, text: line.replace(/^[-*]\s+/, '') });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (listBuf.length && !listBuf[0].ordered) {
        flushList();
      }
      listBuf.push({ ordered: true, text: line.replace(/^\d+\.\s+/, '') });
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }

    flushList();
    blocks.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  flushList();
  flushTable();
  if (inCode && codeBuf.length) {
    blocks.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }

  return blocks.join('\n');
}
