import './styles/main.css';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS } from './core/config.js';
import { storage } from './modules/storage.js';
import { habits } from './modules/habits.js';

// === DOM ELEMENTS ===
const gardenEl = document.getElementById('garden-container');
const trophyEl = document.getElementById('trophy-container');
const countEl = document.getElementById('habit-count');
const trophyCountEl = document.getElementById('trophy-count');
const addModal = document.getElementById('add-modal');
const statsModal = document.getElementById('stats-modal');
const settingsModal = document.getElementById('settings-modal');
const habitForm = document.getElementById('habit-form');
const targetContainer = document.getElementById('target-container');
const loadingScreen = document.getElementById('loading-screen');
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const langSelect = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const trophyToggle = document.getElementById('toggle-trophies');
const focusToggle = document.getElementById('toggle-focus');

// === STATE ===
let settings = { lang: 'en', theme: 'auto', showTrophies: false, focusMode: false };

// === TRANSLATIONS (FIXED: added 'data:' key) ===
const TRANSLATIONS = {
    en: {
        whatsNew: "What's New", guest: 'Guest', guestUser: 'Guest User', localStorage: 'Local Storage',
        settings: 'Settings', activeGarden: 'Active Garden', trophyGarden: 'Trophy Garden',
        trophyDesc: 'Trees that reached 365+ days', addHabit: 'Plant New Habit',
        habitName: 'Name', description: 'Description (optional)', tracking: 'Tracking',
        yesNo: 'Yes / No', quantity: 'Quantity', goal: 'Goal', unit: 'Unit', plantSeed: 'Plant Seed',
        appearance: 'Appearance & Language', language: 'Language', languageDesc: 'Interface language',
        theme: 'Theme', themeDesc: 'Choose your preferred look',
        showTrophy: 'Show Trophy Garden', showTrophyDesc: 'Display completed trees (365+ days)',
        focusMode: 'Focus Mode', focusModeDesc: 'Minimal UI for distraction-free tracking',
        data: 'Data', export: 'Export', exportDesc: 'Download backup as JSON', exportBtn: 'Export',
        import: 'Import', importDesc: 'Restore from file', importBtn: 'Import',
        reset: 'Reset', resetDesc: 'Delete all data', resetBtn: 'Reset',
        done: 'Done', activity: 'Activity', less: 'Less', more: 'More',
        currentStreak: 'Current Streak', bestStreak: 'Best Streak', completion: 'Completion',
        stage: 'Stage', days: 'days', completions: 'completions',
        emptyGarden: 'Your garden is empty', plantFirst: 'Plant first habit',
        habitPlanted: 'Habit planted!', progressSaved: 'Progress saved!', removed: 'Removed',
        exported: 'Exported!', imported: 'Imported!', resetDone: 'Data cleared!'
    },
    ru: {
        whatsNew: 'Что нового', guest: 'Гость', guestUser: 'Гостевой пользователь', localStorage: 'Локальное хранилище',
        settings: 'Настройки', activeGarden: 'Активный сад', trophyGarden: 'Сад трофеев',
        trophyDesc: 'Деревья, достигшие 365+ дней', addHabit: 'Посадить привычку',
        habitName: 'Название', description: 'Описание (необязательно)', tracking: 'Отслеживание',
        yesNo: 'Да / Нет', quantity: 'Количество', goal: 'Цель', unit: 'Единица', plantSeed: 'Посадить',
        appearance: 'Внешний вид и язык', language: 'Язык', languageDesc: 'Язык интерфейса',
        theme: 'Тема', themeDesc: 'Выберите оформление',
        showTrophy: 'Показывать сад трофеев', showTrophyDesc: 'Отображать завершённые деревья (365+ дней)',
        focusMode: 'Режим фокуса', focusModeDesc: 'Минимальный интерфейс без отвлечений',
        data: 'Данные', export: 'Экспорт', exportDesc: 'Скачать резервную копию', exportBtn: 'Экспорт',
        import: 'Импорт', importDesc: 'Восстановить из файла', importBtn: 'Импорт',
        reset: 'Сброс', resetDesc: 'Удалить все данные', resetBtn: 'Сброс',
        done: 'Готово', activity: 'Активность', less: 'Меньше', more: 'Больше',
        currentStreak: 'Текущая серия', bestStreak: 'Лучшая серия', completion: 'Выполнение',
        stage: 'Стадия', days: 'дн.', completions: 'вып.',
        emptyGarden: 'Ваш сад пуст', plantFirst: 'Посадить первую привычку',
        habitPlanted: 'Привычка посажена!', progressSaved: 'Прогресс сохранён!', removed: 'Удалено',
        exported: 'Экспортировано!', imported: 'Импортировано!', resetDone: 'Данные очищены!'
    }
};

// === SETTINGS LOGIC ===
function loadSettings() {
    const saved = storage.get('cultiva-settings');
    if (saved) {
        settings = { ...settings, ...saved };
    }
}

function applySettings() {
    // Language
    if (langSelect) langSelect.value = settings.lang;
    applyTranslations(settings.lang);
    
    // Theme
    document.body.classList.remove('theme-light', 'theme-dark');
    if (settings.theme === 'light') document.body.classList.add('theme-light');
    else if (settings.theme === 'dark') document.body.classList.add('theme-dark');
    if (themeSelect) themeSelect.value = settings.theme;
    
    // Trophy Garden
    const trophySection = document.getElementById('trophy-section');
    if (trophySection) {
        trophySection.classList.toggle('hidden', !settings.showTrophies);
    }
    if (trophyToggle) trophyToggle.checked = settings.showTrophies;
    
    // Focus Mode
    document.body.classList.toggle('focus-mode', settings.focusMode);
    if (focusToggle) focusToggle.checked = settings.focusMode;
}

function saveSettings() {
    storage.set('cultiva-settings', settings);
    applySettings();
    renderGarden();
}

// === i18n ===
function applyTranslations(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
}

// === SETTINGS EVENTS ===
langSelect?.addEventListener('change', (e) => {
    settings.lang = e.target.value;
    saveSettings();
});

themeSelect?.addEventListener('change', (e) => {
    settings.theme = e.target.value;
    saveSettings();
});

trophyToggle?.addEventListener('change', (e) => {
    settings.showTrophies = e.target.checked;
    saveSettings();
});

focusToggle?.addEventListener('change', (e) => {
    settings.focusMode = e.target.checked;
    saveSettings();
});

// === USER MENU ===
function toggleUserMenu() {
    const isActive = userDropdown.classList.toggle('active');
    userMenuBtn.setAttribute('aria-expanded', isActive);
}

function closeUserMenu() {
    userDropdown.classList.remove('active');
    userMenuBtn.setAttribute('aria-expanded', 'false');
}

userMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleUserMenu();
});

document.addEventListener('click', (e) => {
    if (userDropdown && !userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
        closeUserMenu();
    }
});

document.getElementById('open-settings')?.addEventListener('click', () => {
    openModal(settingsModal);
    closeUserMenu();
});

// === NOTIFICATIONS (ENHANCED) ===
function showNotification(icon, text, subText = '', actionText = '', actionCallback = null) {
    const existing = document.querySelector('.dynamic-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'dynamic-notification';
    
    let actionBtnHTML = '';
    if (actionText && actionCallback) {
        actionBtnHTML = `<button class="dynamic-notification-btn">${actionText}</button>`;
    }
    let subTextHTML = subText ? `<span class="dynamic-notification-sub">${subText}</span>` : '';
    
    notification.innerHTML = `
        <span class="dynamic-notification-icon">${icon}</span>
        <div class="dynamic-notification-content">
            <span class="dynamic-notification-text">${text}</span>
            ${subTextHTML}
        </div>
        ${actionBtnHTML}
    `;
    document.body.appendChild(notification);
    
    if (actionCallback && actionText) {
        notification.querySelector('.dynamic-notification-btn').addEventListener('click', actionCallback);
    }
    
    setTimeout(() => notification.classList.add('visible'), 100);
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
// === RENDER ===
function createHabitCard(habit, isTrophy = false) {
    const stage = isTrophy ? GROWTH_STAGES.LEGACY : habits.getStage(habit.progress);
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.trackType === 'binary' 
        ? habit.lastCompleted === today 
        : (habit.dailyProgress?.[today] || 0) >= habit.target;
    
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
            <button class="btn-card btn-card-primary${isCompleted ? ' completed' : ''}">
                ${isCompleted ? '✓ Done' : (habit.trackType === 'quantity' ? 'Log' : 'Complete')}
            </button>
            <button class="btn-card btn-card-danger">✕</button>
        </div>
    `;
    
    return card;
}

function renderGarden() {
    const all = habits.getAll();
    const active = all.filter(h => h.progress < LEGACY_THRESHOLD);
    const trophies = all.filter(h => h.progress >= LEGACY_THRESHOLD);
    
    // Active Garden
    if (gardenEl) {
        gardenEl.innerHTML = '';
        if (active.length === 0) {
            gardenEl.innerHTML = `
                <div class="empty-state">
                    <p style="font-size:40px">🌱</p>
                    <p data-i18n="emptyGarden">${TRANSLATIONS[settings.lang].emptyGarden}</p>
                    <button class="btn-primary" id="add-first" style="width:auto;padding:10px 20px;margin-top:16px" data-i18n="plantFirst">${TRANSLATIONS[settings.lang].plantFirst}</button>
                </div>
            `;
            document.getElementById('add-first')?.addEventListener('click', () => openModal(addModal));
        } else {
            active.forEach(h => gardenEl.appendChild(createHabitCard(h)));
        }
    }
    
    // Trophy Garden
    if (trophyEl) {
        trophyEl.innerHTML = '';
        trophies.forEach(h => trophyEl.appendChild(createHabitCard(h, true)));
    }
    
    // Counters
    if (countEl) countEl.textContent = `${active.length}/9`;
    if (trophyCountEl) trophyCountEl.textContent = trophies.length;
    
    // Re-apply translations for dynamic content
    applyTranslations(settings.lang);
}

// === MODALS ===
function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openStats(id) {
    const s = habits.getStats(id);
    if (!s) return;
    
    document.getElementById('stats-title').textContent = s.name;
    const t = TRANSLATIONS[settings.lang];
    
    document.getElementById('stats-content').innerHTML = `
        <div class="stat-card"><div class="stat-label">${t.currentStreak}</div><div class="stat-value">${s.currentStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.bestStreak}</div><div class="stat-value">${s.bestStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.completion}</div><div class="stat-value">${s.completionRate}%</div><div class="stat-subvalue">${s.totalDays} ${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.stage}</div><div class="stat-value">${s.stage.name}</div><div class="stat-subvalue">${habits.getAll().find(x => x.id === id)?.progress} ${s.trackType === 'quantity' ? t.completions : t.days}</div></div>
    `;
    
    const cal = document.getElementById('contribution-calendar');
    if (cal) {
        cal.innerHTML = '';
        habits.getCalendarData(id).forEach(d => {
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.style.background = `var(--calendar-${d.level})`;
            el.title = d.date;
            cal.appendChild(el);
        });
    }
    
    openModal(statsModal);
}

// === EXPORT / IMPORT ===
function exportData() {
    const t = TRANSLATIONS[settings.lang];
    const data = { habits: habits.getAll(), exportedAt: new Date().toISOString(), version: '0.1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cultiva-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📤', t.exported);
}

function importData(file) {
    const t = TRANSLATIONS[settings.lang];
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.habits && Array.isArray(data.habits)) {
                    storage.saveHabits(data.habits);
                    resolve(true);
                } else {
                    reject(new Error('Invalid format'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    })
    .then(() => {
        renderGarden();
        showNotification('📥', t.imported);
    })
    .catch(err => {
        alert(err.message);
    });
}

// === FOCUS MODE LOGIC ===
function toggleFocusMode(enabled) {
    settings.focusMode = enabled;
    document.body.classList.toggle('focus-mode', enabled);
    if (focusToggle) focusToggle.checked = enabled;
    storage.set('cultiva-settings', settings);
    renderGarden();
}


// === EVENTS INIT ===
function initEvents() {
    // Open Modals
    document.getElementById('open-add-modal')?.addEventListener('click', () => openModal(addModal));
    
    // Close Modals (buttons & overlay)
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target === btn || btn.classList.contains('modal-close')) {
                closeModal(addModal);
                closeModal(statsModal);
                closeModal(settingsModal);
            }
        });
    });
    
   // Focus Mode Toggle
    focusToggle?.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        toggleFocusMode(enabled);
        if (enabled) {
            showNotification('🎯', 'Focus Mode Enabled', 'Press Esc to exit', 'Exit', () => toggleFocusMode(false));
        } else {
            showNotification('✅', 'Focus Mode Disabled');
        }
    });

    // Escape Key (Exit Focus Mode + Close Modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (settings.focusMode) {
                toggleFocusMode(false);
                showNotification('✅', 'Focus Mode Disabled');
            }
            closeModal(addModal);
            closeModal(statsModal);
            closeModal(settingsModal);
        }
    });
    // Form: Toggle Target Fields
    document.querySelectorAll('input[name="track-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (targetContainer) {
                targetContainer.classList.toggle('visible', e.target.value === 'quantity');
            }
        });
    });
    
    // Form: Submit Habit
    habitForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('habit-name')?.value.trim();
        if (!name) return;
        
        const trackType = document.querySelector('input[name="track-type"]:checked')?.value || 'binary';
        
        try {
            habits.add({
                name,
                description: document.getElementById('habit-desc')?.value.trim() || '',
                category: 'health',
                trackType,
                target: trackType === 'quantity' ? parseInt(document.getElementById('habit-target')?.value) || 1 : 1,
                unit: trackType === 'quantity' ? document.getElementById('habit-unit')?.value.trim() || '' : ''
            });
            
            habitForm.reset();
            if (targetContainer) targetContainer.classList.remove('visible');
            document.querySelector('input[name="track-type"][value="binary"]').checked = true;
            
            closeModal(addModal);
            renderGarden();
            showNotification('🌱', TRANSLATIONS[settings.lang].habitPlanted);
        } catch (err) {
            alert(err.message);
        }
    });
    
    // Garden Card Delegation
    const handleCardClick = (e) => {
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
            } else {
                habits.toggle(id);
            }
            
            renderGarden();
            card.querySelector('.plant-visual')?.classList.add('growing');
            setTimeout(() => card.querySelector('.plant-visual')?.classList.remove('growing'), 250);
            showNotification('💧', TRANSLATIONS[settings.lang].progressSaved);
            
        } else if (e.target.closest('.btn-card-danger')) {
            e.stopPropagation();
            if (confirm('Remove habit?')) {
                habits.remove(id);
                renderGarden();
                showNotification('🗑️', TRANSLATIONS[settings.lang].removed);
            }
        } else {
            openStats(id);
        }
    };
    
    gardenEl?.addEventListener('click', handleCardClick);
    trophyEl?.addEventListener('click', handleCardClick);
    
// Settings Buttons
    document.getElementById('close-settings')?.addEventListener('click', () => {
        closeModal(settingsModal);
    });
    
    document.getElementById('close-stats')?.addEventListener('click', () => closeModal(statsModal));
    
    document.getElementById('settings-export')?.addEventListener('click', () => {
        exportData();
    });
    
    document.getElementById('settings-import')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files?.[0]) importData(e.target.files[0]);
        };
        input.click();
    });
    
    document.getElementById('settings-reset')?.addEventListener('click', () => {
        const t = TRANSLATIONS[settings.lang];
        if (confirm(t.reset + '?') && confirm('Are you absolutely sure?')) {
            storage.saveHabits([]);
            renderGarden();
            showNotification('🗑️', t.resetDone);
        }
    });
}

// === INITIALIZATION & LOADING FIX ===
const hideLoading = () => {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
        }, 600);
    }
};


if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(hideLoading, 100);
} else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(hideLoading, 100));
}

function init() {
    try {
        loadSettings();
        applySettings();
        renderGarden();
        initEvents();
        console.log('✅ Cultiva v2 initialized successfully');
    } catch (err) {
        console.error('🚨 Init failed:', err);
    }

    setTimeout(hideLoading, 800);
}

init();