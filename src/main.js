import './styles/main.css';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS } from './core/config.js';
import { storage } from './modules/storage.js';
import { habits } from './modules/habits.js';

const gardenEl = document.getElementById('garden-container');
const trophyEl = document.getElementById('trophy-container');
const countEl = document.getElementById('habit-count');
const trophyCountEl = document.getElementById('trophy-count');
const addModal = document.getElementById('add-modal');
const statsModal = document.getElementById('stats-modal');
const settingsModal = document.getElementById('settings-modal');
const themeToggle = document.getElementById('theme-toggle');
const habitForm = document.getElementById('habit-form');
const trackSelect = document.getElementById('h-track');
const targetFields = document.getElementById('target-fields');
const loadingScreen = document.getElementById('loading-screen');

let currentStatsId = null;

/* === THEME === */

const themes = ['auto', 'light', 'dark'];
let themeIdx = themes.indexOf(localStorage.getItem('cultiva-theme') || 'auto');
if (themeIdx === -1) themeIdx = 0;

const getThemeIcon = (t) => t === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? '🌙' : '☀️') : (t === 'light' ? '☀️' : '🌙');

const applyTheme = () => {
    const t = themes[themeIdx];
    localStorage.setItem('cultiva-theme', t);
    document.body.classList.remove('theme-light', 'theme-dark');
    if (t === 'light') document.body.classList.add('theme-light');
    else if (t === 'dark') document.body.classList.add('theme-dark');
    if (themeToggle) {
        themeToggle.textContent = getThemeIcon(t);
        themeToggle.title = `Theme: ${t}`;
    }
};

themeToggle?.addEventListener('click', () => {
    themeIdx = (themeIdx + 1) % themes.length;
    applyTheme();
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themes[themeIdx] === 'auto') applyTheme();
});

applyTheme();

/* === NOTIFICATIONS === */

function showNotification(icon, text) {
    const existing = document.querySelector('.dynamic-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'dynamic-notification';
    notification.innerHTML = `<span class="dynamic-notification-icon">${icon}</span><span class="dynamic-notification-text">${text}</span>`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('visible'), 100);
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* === RENDER === */

function createHabitCard(habit, isTrophy = false) {
    const stage = isTrophy ? GROWTH_STAGES.LEGACY : habits.getStage(habit.progress);
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.trackType === 'binary' ? habit.lastCompleted === today : (habit.dailyProgress?.[today] || 0) >= habit.target;
    
    let progressBar = '';
    if (habit.trackType === 'quantity') {
        const cur = habit.dailyProgress?.[today] || 0;
        const pct = Math.min(100, (cur / habit.target) * 100);
        progressBar = `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
    }
    
    const cats = { health: '🏃 Health', learning: '📚 Learning', work: '💼 Work', mindfulness: '🧘 Mindfulness', creative: '🎨 Creative', other: '⭐ Other' };
    
    const card = document.createElement('article');
    card.className = 'habit-card';
    card.dataset.id = habit.id;
    card.dataset.category = habit.category || 'other';
    card.innerHTML = `
        <div class="card-header">
            <div class="plant-visual">${stage.emoji}</div>
            <div class="card-info">
                <div class="card-title">${habit.treeName || habit.name}</div>
                ${habit.description ? `<div class="card-description">${habit.description}</div>` : ''}
                <div class="card-subtitle">${stage.name} • ${habit.progress}d</div>
                <span class="category-badge">${cats[habit.category] || '⭐ Other'}</span>
            </div>
        </div>
        ${progressBar}
        <div class="card-actions">
            <button class="btn-card btn-card-primary${isCompleted ? ' completed' : ''}">${isCompleted ? '✓ Done' : (habit.trackType === 'quantity' ? 'Log' : 'Complete')}</button>
            <button class="btn-card btn-card-danger">✕</button>
        </div>
    `;
    return card;
}

function renderGarden() {
    const all = habits.getAll();
    const active = all.filter(h => h.progress < LEGACY_THRESHOLD);
    const trophies = all.filter(h => h.progress >= LEGACY_THRESHOLD);
    
    if (gardenEl) {
        gardenEl.innerHTML = active.length ? '' : `<div class="empty-state"><p style="font-size:40px">🌱</p><p>Your garden is empty</p><button class="btn-primary" id="add-first" style="width:auto;padding:10px 20px;margin-top:16px">Plant first habit</button></div>`;
        active.forEach(h => gardenEl.appendChild(createHabitCard(h)));
        document.getElementById('add-first')?.addEventListener('click', () => openModal(addModal));
    }
    
    if (trophyEl) {
        trophyEl.innerHTML = '';
        if (trophies.length > 0) {
            trophies.forEach(h => trophyEl.appendChild(createHabitCard(h, true)));
            document.getElementById('trophy-section')?.classList.remove('hidden');
        } else {
            document.getElementById('trophy-section')?.classList.add('hidden');
        }
    }
    
    if (countEl) countEl.textContent = `${active.length}/9`;
    if (trophyCountEl) trophyCountEl.textContent = trophies.length;
}

/* === MODALS === */

function openModal(m) { if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; } }
function closeModal(m) { if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } }

function openStats(id) {
    currentStatsId = id;
    const s = habits.getStats(id);
    if (!s) return;
    document.getElementById('stats-title').textContent = s.name;
    document.getElementById('stats-grid').innerHTML = `
        <div class="stat-card"><div class="stat-label">Current Streak</div><div class="stat-value">${s.currentStreak}</div><div class="stat-subvalue">days</div></div>
        <div class="stat-card"><div class="stat-label">Best Streak</div><div class="stat-value">${s.bestStreak}</div><div class="stat-subvalue">days</div></div>
        <div class="stat-card"><div class="stat-label">Completion</div><div class="stat-value">${s.completionRate}%</div><div class="stat-subvalue">${s.totalDays} of ${Math.max(1, Math.floor((Date.now() - new Date(habits.getAll().find(x=>x.id===id)?.startDate || Date.now()))/(1000*60*60*24)))} days</div></div>
        <div class="stat-card"><div class="stat-label">Stage</div><div class="stat-value">${s.stage.name}</div><div class="stat-subvalue">${habits.getAll().find(x=>x.id===id)?.progress} ${s.trackType==='quantity'?'completions':'days'}</div></div>
    `;
    const cal = document.getElementById('contribution-calendar');
    if (cal) {
        cal.innerHTML = '';
        habits.getCalendarData(id).forEach(d => {
            const el = document.createElement('div');
            el.className = `calendar-day`;
            el.style.background = `var(--calendar-${d.level})`;
            el.title = d.date;
            cal.appendChild(el);
        });
    }
    openModal(statsModal);
}

/* === EXPORT/IMPORT === */

function exportData() {
    const data = { habits: habits.getAll(), exportedAt: new Date().toISOString(), version: '0.1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cultiva-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📤', 'Exported!');
}

function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.habits && Array.isArray(data.habits)) {
                    storage.saveHabits(data.habits);
                    resolve(true);
                } else reject(new Error('Invalid format'));
            } catch (err) { reject(err); }
        };
        reader.readAsText(file);
    });
}

/* === EVENTS === */

function initEvents() {
    document.getElementById('open-add-modal')?.addEventListener('click', () => openModal(addModal));
    document.getElementById('open-settings')?.addEventListener('click', () => openModal(settingsModal));
    
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target === btn || btn.classList.contains('modal-close')) {
                closeModal(addModal); closeModal(statsModal); closeModal(settingsModal);
            }
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeModal(addModal); closeModal(statsModal); closeModal(settingsModal); }
    });
    
    trackSelect?.addEventListener('change', (e) => {
        if (targetFields) targetFields.classList.toggle('visible', e.target.value === 'quantity');
    });
    
    habitForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('h-name')?.value.trim();
        if (!name) return;
        const track = document.getElementById('h-track')?.value || 'binary';
        try {
            habits.add({
                name,
                category: document.getElementById('h-cat')?.value || 'other',
                trackType: track,
                target: track === 'quantity' ? parseInt(document.getElementById('h-target')?.value) || 1 : 1,
                unit: track === 'quantity' ? document.getElementById('h-unit')?.value.trim() || '' : ''
            });
            habitForm.reset();
            if (targetFields) targetFields.classList.remove('visible');
            closeModal(addModal);
            renderGarden();
            showNotification('🌱', 'Habit planted!');
        } catch (err) { alert(err.message); }
    });
    
    const handleCard = (e) => {
        const card = e.target.closest('.habit-card');
        if (!card) return;
        const id = card.dataset.id;
        if (e.target.closest('.btn-card-primary')) {
            e.stopPropagation();
            const h = habits.getAll().find(x => x.id === id);
            if (!h) return;
            if (h.trackType === 'quantity') {
                const today = new Date().toISOString().split('T')[0];
                const cur = h.dailyProgress?.[today] || 0;
                const amt = prompt(`Enter ${h.unit}:`, cur);
                if (amt === null) return;
                habits.toggle(id, parseFloat(amt) || 0);
            } else habits.toggle(id);
            renderGarden();
            card.querySelector('.plant-visual')?.classList.add('growing');
            setTimeout(() => card.querySelector('.plant-visual')?.classList.remove('growing'), 250);
            showNotification('💧', 'Progress saved!');
        } else if (e.target.closest('.btn-card-danger')) {
            e.stopPropagation();
            if (confirm('Remove?')) { habits.remove(id); renderGarden(); showNotification('🗑️', 'Removed'); }
        } else {
            openStats(id);
        }
    };
    gardenEl?.addEventListener('click', handleCard);
    trophyEl?.addEventListener('click', handleCard);
    
    document.getElementById('close-stats')?.addEventListener('click', () => closeModal(statsModal));
    
    document.getElementById('settings-export')?.addEventListener('click', () => { exportData(); });
    
    document.getElementById('settings-import')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                try { await importData(file); renderGarden(); showNotification('📥', 'Imported!'); }
                catch (err) { alert('Error: ' + err.message); }
            }
        };
        input.click();
    });
    
    document.getElementById('settings-reset')?.addEventListener('click', () => {
        if (confirm('Delete all habits?') && confirm('Sure?')) {
            storage.saveHabits([]); renderGarden(); showNotification('🗑️', 'Reset!');
        }
    });
}

/* === INIT === */

function init() {
    renderGarden();
    initEvents();
    setTimeout(() => { loadingScreen?.classList.add('hidden'); }, 800);
}

init();