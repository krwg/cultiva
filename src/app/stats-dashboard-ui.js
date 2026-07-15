import { habits } from '../modules/habits.js';
import { TRANSLATIONS } from '../core/i18n.js';
import { getWeeklySummary, getMonthlySummary, getPerHabitMonthlyRates } from '../core/habit-analytics.js';
import { escapeHtml } from '../core/escape-html.js';

export function renderStatsDashboard(lang) {
  const host = document.getElementById('stats-dashboard-body');
  if (!host) {
    return;
  }
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const all = habits.getAll().filter((h) => h.progress < 365);
  const week = getWeeklySummary(all);
  const month = getMonthlySummary(all);
  const rows = getPerHabitMonthlyRates(all).slice(0, 6);

  const habitRows = rows.length
    ? rows.map((r) => `
        <div class="stats-dashboard-row">
          <span class="stats-dashboard-habit">${escapeHtml(r.name)}</span>
          <span class="stats-dashboard-bar-wrap"><span class="stats-dashboard-bar" style="width:${Number(r.rate) || 0}%"></span></span>
          <span class="stats-dashboard-pct">${Number(r.rate) || 0}%</span>
        </div>`).join('')
    : `<p class="onboarding-muted">${t.statsDashboardEmpty || 'Plant a habit to see trends.'}</p>`;

  host.innerHTML = `
    <div class="stats-dashboard-cards">
      <div class="stat-card">
        <div class="stat-label">${t.statsDashboardWeek || 'This week'}</div>
        <div class="stat-value">${week.completions}/${week.possible}</div>
        <div class="stat-subvalue">${week.rate}% · ${week.labelStart} — ${week.labelEnd}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">${t.statsDashboardMonth || 'This month'}</div>
        <div class="stat-value">${month.completions}/${month.possible}</div>
        <div class="stat-subvalue">${month.rate}% · ${month.labelMonth}</div>
      </div>
    </div>
    <h3 class="stats-dashboard-heading">${t.statsDashboardHabits || 'Habits this month'}</h3>
    <div class="stats-dashboard-list">${habitRows}</div>`;
}
