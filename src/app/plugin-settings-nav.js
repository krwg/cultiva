import { getPluginSettingsNavItems } from '../core/plugin-contributions.js';
import { sanitizePluginHtml } from '../core/sanitize-plugin-html.js';
import { escapeHtml } from '../core/escape-html.js';

const CORE_SECTION_ORDER = [
  'profile',
  'appearance',
  'notifications',
  'search',
  'shortcuts',
  'garden',
  'statistics',
  'calendar',
  'discord',
  'data',
  'updates',
  'plugins',
  'about'
];

function parsePosition(position) {
  const match = String(position || '').match(/^(before|after):([a-z-]+)$/);
  if (!match) {
    return { mode: 'before', anchor: 'about' };
  }
  return { mode: match[1], anchor: match[2] };
}

function ensurePluginSection(item) {
  const sectionDomId = `section-${item.sectionId}`;
  let section = document.getElementById(sectionDomId);
  if (section) {
    return section;
  }
  const host = document.querySelector('.settings-content');
  if (!host) {
    return null;
  }
  section = document.createElement('div');
  section.className = 'settings-section-content';
  section.id = sectionDomId;
  section.dataset.pluginSection = item.pluginId;
  section.innerHTML = `
    <div class="settings-section-hero">
      <div class="settings-section-hero-title">${escapeHtml(item.label)}</div>
      ${item.description ? `<p class="settings-section-hero-desc">${escapeHtml(item.description)}</p>` : ''}
    </div>
    <div class="settings-group-card plugin-settings-section-body"></div>
  `;
  const body = section.querySelector('.plugin-settings-section-body');
  if (body && item.html) {
    body.innerHTML = sanitizePluginHtml(item.html);
  }
  host.appendChild(section);
  return section;
}

function createSidebarItem(item) {
  const el = document.createElement('div');
  el.className = 'settings-sidebar-item settings-sidebar-item--plugin';
  el.dataset.section = item.sectionId;
  el.dataset.pluginNavId = item.navId;
  el.innerHTML = `<span class="settings-sidebar-label">${escapeHtml(item.label)}</span>`;
  return el;
}

function insertRelativeToCore(sidebar, node, position) {
  const { mode, anchor } = parsePosition(position);
  const anchorItem = sidebar.querySelector(`.settings-sidebar-item[data-section="${anchor}"]`);
  if (!anchorItem) {
    sidebar.appendChild(node);
    return;
  }
  if (mode === 'after') {
    anchorItem.insertAdjacentElement('afterend', node);
  } else {
    anchorItem.insertAdjacentElement('beforebegin', node);
  }
}

export function refreshPluginSettingsNav(onSectionClick) {
  const sidebar = document.querySelector('.settings-sidebar');
  if (!sidebar) {
    return;
  }

  sidebar.querySelectorAll('.settings-sidebar-item--plugin').forEach((el) => el.remove());
  document.querySelectorAll('.settings-section-content[data-plugin-section]').forEach((el) => el.remove());

  const items = getPluginSettingsNavItems().slice().sort((a, b) => {
    const ai = CORE_SECTION_ORDER.indexOf(parsePosition(a.position).anchor);
    const bi = CORE_SECTION_ORDER.indexOf(parsePosition(b.position).anchor);
    if (ai !== bi) {
      return ai - bi;
    }
    return a.label.localeCompare(b.label);
  });

  for (const item of items) {
    ensurePluginSection(item);
    const navItem = createSidebarItem(item);
    insertRelativeToCore(sidebar, navItem, item.position);
    if (typeof onSectionClick === 'function') {
      navItem.addEventListener('click', () => onSectionClick(navItem));
    }
  }
}
