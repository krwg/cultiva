import { TRANSLATIONS } from '../../core/i18n.js';
import { storage } from '../../modules/storage.js';
import { habits } from '../../modules/habits.js';
import { BRANDING } from '../../core/branding.js';
import { getHolidaysForRegion, getHolidayForDate } from '../../core/holidays.js';
import { getCultivaTimezone } from '../../core/timezone.js';
import { getThemeBodyClassList, resolveThemeBodyId, LS_CUSTOM_BG_DATA } from '../../core/theme-config.js';
import { applyAmbientBackground, readCustomBackgroundDataUrl } from '../../core/ambient-bg.js';
import { showAlertDialog, showConfirmDialog } from '../../app/dialogs.js';

document.documentElement.dataset.page = 'calendar';

const DEBUG = true;
const STORAGE_KEY = 'cultiva_calendar_events';

const EVENT_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#00C7BE', '#64D2FF', '#FF9F0A', '#BF5AF2'
];

const CATEGORY_COLORS = {
  health: '#FF6B6B', learning: '#4ECDC4', work: '#45B7D1',
  mindfulness: '#96CEB4', creative: '#FFEAA7', fitness: '#FF9F43',
  social: '#A29BFE', finance: '#F1C40F', hobby: '#FD79A8',
  family: '#E17055', career: '#0984E3', spiritual: '#6C5CE7',
  environment: '#00CEC9', other: '#B2BEC3'
};

let currentDate = new Date();
let selectedDate = new Date();
let currentView = 'month';
let events = {};
let editingEventId = null;
let editingEventDate = null;
let currentHolidays = {};
let holidayRegion = 'us';

let currentLang = 'en';
let currentT = TRANSLATIONS.en;

function log(...args) { if (DEBUG) { console.log('[Calendar]', ...args); } }
function error(...args) { console.error('[Calendar]', ...args); }

function loadHolidays() {
  const region = localStorage.getItem('cultiva-holiday-region') || 'us';
  holidayRegion = region;
  currentHolidays = getHolidaysForRegion(region);
  log('Holidays loaded for region:', region, 'count:', Object.keys(currentHolidays).length);
}

function syncTheme() {
  const theme = localStorage.getItem('cultiva-theme') || 'auto';
  document.body.classList.remove(...getThemeBodyClassList());
  const appliedTheme = resolveThemeBodyId(theme);
  document.body.classList.add(`theme-${appliedTheme}`);
  log('Theme synced:', appliedTheme);
}

function syncBackground() {
  let bg = localStorage.getItem('cultiva-background') || 'none';
  if (bg === 'custom' && !readCustomBackgroundDataUrl()) {
    bg = 'none';
  }
  applyAmbientBackground(document, document.body, bg);
  log('Background synced:', bg);
}

function getTodayInTZ() {
  const now = new Date();
  const tz = getCultivaTimezone();
  if (!tz) { return new Date(now.getFullYear(), now.getMonth(), now.getDate()); }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(now);
    return new Date(
      parseInt(parts.find(p => p.type === 'year').value),
      parseInt(parts.find(p => p.type === 'month').value) - 1,
      parseInt(parts.find(p => p.type === 'day').value)
    );
  } catch (e) {
    error('getTodayInTZ failed:', e);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

function getTodayStr() {
  const tz = getCultivaTimezone();
  const opts = tz ? { timeZone: tz } : {};
  return new Date().toLocaleDateString('en-CA', opts);
}

function formatDateKey(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) { return ''; }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) { return ''; }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatMonth(date) {
  if (!date || isNaN(date)) { return ''; }
  return date.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' });
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function loadEvents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      events = JSON.parse(stored);
      log('Events loaded:', Object.keys(events).length, 'days');
    }
  } catch (e) { error('Failed to load events:', e); }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  log('Events saved');
}

function addEvent(date, event) {
  const key = formatDateKey(date);
  if (!key) { return null; }
  if (!events[key]) { events[key] = []; }
  event.id = crypto.randomUUID?.() || Date.now().toString() + Math.random();
  events[key].push(event);
  events[key].sort((a, b) => a.start.localeCompare(b.start));
  saveEvents();
  log('Event added:', key, event.title);
  return event;
}

function updateEvent(date, eventId, updates) {
  const key = formatDateKey(date);
  if (!key || !events[key]) { return false; }
  const event = events[key].find(e => e.id === eventId);
  if (!event) { return false; }
  Object.assign(event, updates);
  events[key].sort((a, b) => a.start.localeCompare(b.start));
  saveEvents();
  log('Event updated:', key, updates.title);
  return true;
}

function deleteEvent(date, eventId) {
  const key = formatDateKey(date);
  if (!key || !events[key]) { return false; }
  events[key] = events[key].filter(e => e.id !== eventId);
  if (events[key].length === 0) { delete events[key]; }
  saveEvents();
  log('Event deleted:', key);
  return true;
}

function getHabitsForDate(date) {
  try {
    const allHabits = habits.getAll();
    const dateStr = formatDateKey(date);

    log('getHabitsForDate:', dateStr, 'total habits:', allHabits.length);

    return allHabits.filter(h => {
      if (h.trackType === 'binary') {
        const completed = h.lastCompleted === dateStr;
        if (completed) { log('Binary habit completed:', h.name, dateStr); }
        return completed;
      }
      const progress = habits.quantityDayProgress(h, dateStr);
      const completed = progress >= habits.quantityTarget(h);
      if (completed) { log('Quantity habit completed:', h.name, progress, '/', h.target); }
      return completed;
    }).map(h => {
      let stageEmoji = '🌱';
      const progress = h.progress || 0;

      if (progress >= 365) { stageEmoji = '🌟'; }
      else if (progress >= 50) { stageEmoji = '🌳'; }
      else if (progress >= 21) { stageEmoji = '🪴'; }
      else if (progress >= 7) { stageEmoji = '🌿'; }

      const color = CATEGORY_COLORS[h.category] || '#34C759';

      return {
        id: `habit-${h.id}`,
        title: `${stageEmoji} ${h.name}`,
        color: color,
        isHabit: true,
        habit: h
      };
    });
  } catch (e) {
    error('getHabitsForDate failed:', e);
    return [];
  }
}

function renderMonthView() {
  log('renderMonthView');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const titleEl = document.getElementById('calendar-title');
  if (titleEl) { titleEl.textContent = formatMonth(currentDate); }

  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const container = document.getElementById('month-days');
  if (!container) { error('month-days container not found'); return; }
  container.innerHTML = '';

  const todayStr = getTodayStr();
  const selectedStr = formatDateKey(selectedDate);

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    container.appendChild(createMonthDayElement(day, true, date));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateKey(date);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;
    const cell = createMonthDayElement(day, false, date);

    if (isToday) { cell.classList.add('today'); }
    if (isSelected) { cell.classList.add('selected'); }

    const holiday = getHolidayForDate(dateStr, holidayRegion);
    if (holiday) {
      cell.classList.add('has-holiday');
      cell.title = holiday.name;
    }

    const dayEvents = events[dateStr] || [];
    const habitEvents = getHabitsForDate(date);
    const allEvents = [...dayEvents, ...habitEvents];

    if (allEvents.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'month-events';
      const uniqueColors = [...new Set(allEvents.map(e => e.color))].slice(0, 3);
      uniqueColors.forEach(color => {
        const dot = document.createElement('div');
        dot.className = 'month-event-dot';
        dot.style.backgroundColor = color;
        eventsContainer.appendChild(dot);
      });
      cell.appendChild(eventsContainer);
    }
    container.appendChild(cell);
  }

  const totalCells = startOffset + daysInMonth;
  const remaining = 42 - totalCells;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    container.appendChild(createMonthDayElement(day, true, date));
  }
}

function createMonthDayElement(day, isOther, date) {
  const cell = document.createElement('div');
  cell.className = `month-day ${isOther ? 'other-month' : ''}`;
  cell.textContent = day;
  cell.addEventListener('click', () => {
    selectedDate = new Date(date);
    if (currentView === 'month') { switchView('day'); }
    else { renderCurrentView(); }
  });
  return cell;
}

function renderWeekView() {
  log('renderWeekView');
  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const titleEl = document.getElementById('calendar-title');
  if (titleEl) {
    titleEl.textContent = `${startOfWeek.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  renderWeekHeader(startOfWeek);
  renderWeekTimeline(startOfWeek);
}

function renderWeekHeader(startOfWeek) {
  const header = document.getElementById('week-header');
  if (!header) { return; }
  header.innerHTML = '';
  const todayStr = getTodayStr();

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDateKey(day);
    const isToday = dateStr === todayStr;

    const dayEl = document.createElement('div');
    dayEl.className = `week-day ${isToday ? 'today' : ''}`;
    dayEl.innerHTML = `
      <div class="week-day-name">${day.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' })}</div>
      <div class="week-day-date">${day.getDate()}</div>
    `;
    dayEl.addEventListener('click', () => { selectedDate = new Date(day); switchView('day'); });
    header.appendChild(dayEl);
  }
}

function renderWeekTimeline(startOfWeek) {
  const timeline = document.getElementById('week-timeline');
  if (!timeline) { return; }
  timeline.innerHTML = '';

  const weekEvents = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDateKey(day);
    if (events[dateStr]) { events[dateStr].forEach(event => weekEvents.push({ ...event, date: day, dateStr })); }
    getHabitsForDate(day).forEach(habit => weekEvents.push({ ...habit, date: day, dateStr }));
  }

  for (let hour = 0; hour < 24; hour++) {
    const hourEl = document.createElement('div');
    hourEl.className = 'timeline-hour';
    const timeLabel = document.createElement('div');
    timeLabel.className = 'timeline-time';
    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
    hourEl.appendChild(timeLabel);

    const slots = document.createElement('div');
    slots.className = 'timeline-slots';
    slots.style.position = 'relative';

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const slot = document.createElement('div');
      slot.className = 'timeline-slot';
      slot.dataset.date = formatDateKey(day);
      slot.dataset.hour = hour;
      slot.addEventListener('click', () => {
        const clickDate = new Date(day);
        clickDate.setHours(hour, 0, 0);
        openEventPanel(clickDate);
      });
      slots.appendChild(slot);
    }
    hourEl.appendChild(slots);
    timeline.appendChild(hourEl);
  }

  weekEvents.forEach(event => event.isHabit ? renderWeekHabitEvent(event, startOfWeek) : renderWeekEvent(event, startOfWeek));
}

function renderWeekEvent(event, startOfWeek) {
  const eventDate = new Date(event.date);
  const dayIndex = Math.floor((eventDate - startOfWeek) / (1000 * 60 * 60 * 24));
  if (dayIndex < 0 || dayIndex > 6) { return; }

  const [startHour, startMin] = event.start.split(':').map(Number);
  const [endHour, endMin] = event.end.split(':').map(Number);
  const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
  const height = Math.max(24, durationHours * 60);

  const timeline = document.getElementById('week-timeline');
  const hourElements = timeline.querySelectorAll('.timeline-hour');
  const startHourEl = hourElements[startHour];
  if (!startHourEl) { return; }

  const slots = startHourEl.querySelector('.timeline-slots');
  const slot = slots.children[dayIndex];
  if (!slot) { return; }

  const eventEl = document.createElement('div');
  eventEl.className = 'week-event';
  eventEl.style.backgroundColor = event.color || EVENT_COLORS[0];
  eventEl.style.top = `${startMin}px`;
  eventEl.style.height = `${height}px`;
  eventEl.style.zIndex = 10 + dayIndex;
  eventEl.innerHTML = `<div class="week-event-title">${event.title}</div><div class="week-event-time">${event.start} – ${event.end}</div>`;
  eventEl.addEventListener('click', (e) => { e.stopPropagation(); openEventPanel(eventDate, event); });
  slot.style.position = 'relative';
  slot.appendChild(eventEl);
}

function renderWeekHabitEvent(habit, startOfWeek) {
  const habitDate = new Date(habit.date);
  const dayIndex = Math.floor((habitDate - startOfWeek) / (1000 * 60 * 60 * 24));
  if (dayIndex < 0 || dayIndex > 6) { return; }

  const timeline = document.getElementById('week-timeline');
  const hourElements = timeline.querySelectorAll('.timeline-hour');
  const hourEl = hourElements[0];
  if (!hourEl) { return; }

  const slots = hourEl.querySelector('.timeline-slots');
  const slot = slots.children[dayIndex];
  if (!slot) { return; }

  const habitEl = document.createElement('div');
  habitEl.className = 'week-event habit-event';
  habitEl.style.backgroundColor = habit.color;
  habitEl.style.top = '2px';
  habitEl.style.height = '20px';
  habitEl.style.zIndex = 5;
  habitEl.innerHTML = `<div class="week-event-title">${habit.title}</div>`;
  slot.style.position = 'relative';
  slot.appendChild(habitEl);
}

function renderDayView() {
  log('renderDayView');
  const titleEl = document.getElementById('calendar-title');
  if (titleEl) { titleEl.textContent = formatMonth(currentDate); }

  const dateEl = document.getElementById('day-view-date');
  if (dateEl) { dateEl.textContent = selectedDate.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  const weekdayEl = document.getElementById('day-view-weekday');
  if (weekdayEl) { weekdayEl.textContent = selectedDate.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' }); }

  const dateStr = formatDateKey(selectedDate);
  const holiday = getHolidayForDate(dateStr, holidayRegion);
  const holidayBanner = document.getElementById('holiday-banner');
  if (holidayBanner) {
    if (holiday) {
      holidayBanner.textContent = `🎌 ${holiday.name}`;
      holidayBanner.style.display = 'inline-block';
    } else {
      holidayBanner.style.display = 'none';
    }
  }

  const timeline = document.getElementById('day-timeline');
  if (!timeline) { return; }
  timeline.innerHTML = '';

  const dayEvents = events[dateStr] || [];
  const habitEvents = getHabitsForDate(selectedDate);

  log('Day view - date:', dateStr, 'events:', dayEvents.length, 'habits:', habitEvents.length);

  if (habitEvents.length > 0) {
    const allDaySection = document.createElement('div');
    allDaySection.className = 'all-day-section';
    habitEvents.forEach(habit => {
      const habitEl = document.createElement('div');
      habitEl.className = 'all-day-event';
      habitEl.style.backgroundColor = habit.color;
      habitEl.textContent = habit.title;
      allDaySection.appendChild(habitEl);
    });
    timeline.appendChild(allDaySection);
  }

  for (let hour = 0; hour < 24; hour++) {
    const hourEl = document.createElement('div');
    hourEl.className = 'day-hour';
    const timeLabel = document.createElement('div');
    timeLabel.className = 'day-time';
    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
    hourEl.appendChild(timeLabel);
    const slot = document.createElement('div');
    slot.className = 'day-slot';
    slot.dataset.hour = hour;
    slot.addEventListener('click', () => {
      const clickDate = new Date(selectedDate);
      clickDate.setHours(hour, 0, 0);
      openEventPanel(clickDate);
    });
    hourEl.appendChild(slot);
    timeline.appendChild(hourEl);
  }

  dayEvents.forEach(event => renderDayEvent(event));
}

function renderDayEvent(event) {
  const [startHour, startMin] = event.start.split(':').map(Number);
  const [endHour, endMin] = event.end.split(':').map(Number);
  const durationHours = (endHour + endMin / 60) - (startHour + startMin / 60);
  const height = Math.max(40, durationHours * 60);

  const timeline = document.getElementById('day-timeline');
  const hourElements = timeline.querySelectorAll('.day-hour');
  const startHourEl = hourElements[startHour];
  if (!startHourEl) { return; }
  const slot = startHourEl.querySelector('.day-slot');
  if (!slot) { return; }

  const eventEl = document.createElement('div');
  eventEl.className = 'day-event';
  eventEl.style.backgroundColor = event.color || EVENT_COLORS[0];
  eventEl.style.height = `${height}px`;
  eventEl.style.top = `${startMin}px`;
  eventEl.style.position = 'relative';
  eventEl.style.zIndex = '5';
  eventEl.innerHTML = `<div class="day-event-title">${event.title}</div><div class="day-event-time">${event.start} – ${event.end}</div>${event.notes ? `<div class="day-event-notes">${event.notes}</div>` : ''}`;
  eventEl.addEventListener('click', (e) => { e.stopPropagation(); openEventPanel(selectedDate, event); });
  slot.appendChild(eventEl);
}

function initColorSelector() {
  const selector = document.getElementById('event-color-selector');
  if (!selector) { return; }
  selector.innerHTML = '';
  EVENT_COLORS.forEach(color => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.style.background = color;
    option.dataset.color = color;
    option.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
    selector.appendChild(option);
  });
  selector.children[0]?.classList.add('selected');
}

function openEventPanel(date, existingEvent = null) {
  log('openEventPanel', formatDateKey(date), existingEvent?.title);
  editingEventDate = date;
  editingEventId = existingEvent?.id || null;

  const title = document.getElementById('event-panel-title');
  const titleInput = document.getElementById('event-title');
  const startInput = document.getElementById('event-start');
  const endInput = document.getElementById('event-end');
  const notesInput = document.getElementById('event-notes');
  const deleteBtn = document.getElementById('event-delete');

  const startDateTime = new Date(date);
  const endDateTime = new Date(date);
  endDateTime.setHours(endDateTime.getHours() + 1);

  if (title) { title.textContent = existingEvent ? (currentT.editEvent || 'Edit Event') : (currentT.newEvent || 'New Event'); }

  if (existingEvent) {
    if (titleInput) { titleInput.value = existingEvent.title || ''; }
    if (startInput) { startInput.value = formatDateTime(parseDateTime(formatDateKey(date), existingEvent.start)); }
    if (endInput) { endInput.value = formatDateTime(parseDateTime(formatDateKey(date), existingEvent.end)); }
    if (notesInput) { notesInput.value = existingEvent.notes || ''; }
    if (deleteBtn) { deleteBtn.style.display = 'block'; }
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.color === existingEvent.color));
  } else {
    if (titleInput) { titleInput.value = ''; }
    if (startInput) { startInput.value = formatDateTime(startDateTime); }
    if (endInput) { endInput.value = formatDateTime(endDateTime); }
    if (notesInput) { notesInput.value = ''; }
    if (deleteBtn) { deleteBtn.style.display = 'none'; }
    document.querySelectorAll('.color-option').forEach((opt, i) => opt.classList.toggle('selected', i === 0));
  }

  const panel = document.getElementById('event-panel');
  if (panel) { panel.classList.add('active'); }
  if (titleInput) { titleInput.focus(); }
}

function closeEventPanel() {
  const panel = document.getElementById('event-panel');
  if (panel) { panel.classList.remove('active'); }
  editingEventId = null;
  editingEventDate = null;
}

async function saveEvent() {
  const titleInput = document.getElementById('event-title');
  const title = titleInput?.value.trim();
  if (!title) {
    await showAlertDialog(currentT.enterTitle || 'Please enter a title', {
      title: currentT.newEvent || 'New Event'
    });
    return;
  }

  const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || EVENT_COLORS[0];
  const startInput = document.getElementById('event-start');
  const endInput = document.getElementById('event-end');
  const notesInput = document.getElementById('event-notes');

  const startDateTime = startInput ? new Date(startInput.value) : new Date();
  const endDateTime = endInput ? new Date(endInput.value) : new Date();

  const eventData = {
    title,
    start: startDateTime.toTimeString().slice(0, 5),
    end: endDateTime.toTimeString().slice(0, 5),
    notes: notesInput?.value.trim() || '',
    color: selectedColor
  };

  if (editingEventId) { updateEvent(editingEventDate, editingEventId, eventData); }
  else { addEvent(editingEventDate, eventData); }

  closeEventPanel();
  renderCurrentView();
}

function switchView(view) {
  log('switchView:', view);
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  document.getElementById('month-view')?.classList.toggle('active', view === 'month');
  document.getElementById('week-view')?.classList.toggle('active', view === 'week');
  document.getElementById('day-view')?.classList.toggle('active', view === 'day');
  renderCurrentView();
}

function renderCurrentView() {
  log('renderCurrentView:', currentView);
  if (currentView === 'month') { renderMonthView(); }
  else if (currentView === 'week') { renderWeekView(); }
  else if (currentView === 'day') { renderDayView(); }
}

function goToToday() {
  log('goToToday');
  currentDate = getTodayInTZ();
  selectedDate = getTodayInTZ();
  renderCurrentView();
}

function goPrevious() {
  log('goPrevious');
  if (currentView === 'month') { currentDate.setMonth(currentDate.getMonth() - 1); }
  else if (currentView === 'week') { currentDate.setDate(currentDate.getDate() - 7); }
  else { currentDate.setDate(currentDate.getDate() - 1); selectedDate = new Date(currentDate); }
  renderCurrentView();
}

function goNext() {
  log('goNext');
  if (currentView === 'month') { currentDate.setMonth(currentDate.getMonth() + 1); }
  else if (currentView === 'week') { currentDate.setDate(currentDate.getDate() + 7); }
  else { currentDate.setDate(currentDate.getDate() + 1); selectedDate = new Date(currentDate); }
  renderCurrentView();
}

function updateTranslations() {
  currentLang = localStorage.getItem('cultiva-lang') || 'en';
  currentT = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  log('Translations updated:', currentLang);
}

function applyI18n() {
  updateTranslations();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (currentT[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.placeholder = currentT[key]; }
      else { el.textContent = currentT[key]; }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (currentT[key]) { el.placeholder = currentT[key]; }
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    if (currentT[key]) {
      el.setAttribute('aria-label', currentT[key]);
    }
  });

  const weekdayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  document.querySelectorAll('.weekday[data-i18n]').forEach((el, index) => {
    const key = weekdayOrder[index];
    if (currentT[key]) { el.textContent = currentT[key]; }
  });

  const panelTitle = document.getElementById('event-panel-title');
  if (panelTitle) { panelTitle.textContent = editingEventId !== null ? (currentT.editEvent || 'Edit Event') : (currentT.newEvent || 'New Event'); }
}

let renderTimeout;
window.addEventListener('storage', (e) => {
  const relevantKeys = ['cultiva_calendar_events', 'cultiva-lang', 'cultiva-theme', 'cultiva-background', LS_CUSTOM_BG_DATA, 'cultiva-timezone', 'cultiva-holiday-region'];
  if (!relevantKeys.includes(e.key)) { return; }

  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    if (e.key === 'cultiva-lang') { applyI18n(); }
    if (e.key === 'cultiva-theme') { syncTheme(); }
    if (e.key === 'cultiva-background' || e.key === LS_CUSTOM_BG_DATA) { syncBackground(); }
    if (e.key === 'cultiva_calendar_events') { loadEvents(); }
    if (e.key === 'cultiva-timezone') { goToToday(); }
    if (e.key === 'cultiva-holiday-region') { loadHolidays(); }
    renderCurrentView();
  }, 150);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);

async function init() {
  log('Calendar initializing...');

  if (window.electron?.platform) {
    document.documentElement.classList.add(`platform-${window.electron.platform}`);
  }

  try {
    await storage.init();
    log('Storage initialized, habits count:', habits.getAll().length);
  } catch (e) {
    error('Storage init failed:', e);
  }

  document.title = `${BRANDING.APP_TITLE} | Calendar`;
  document.querySelectorAll('.footer-version').forEach(el => { el.textContent = BRANDING.FOOTER_TEXT; });

  updateTranslations();
  loadHolidays();
  loadEvents();
  initColorSelector();
  syncTheme();
  syncBackground();

  const todayDate = getTodayInTZ();
  currentDate = todayDate;
  selectedDate = todayDate;

  document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  document.getElementById('prev-period')?.addEventListener('click', goPrevious);
  document.getElementById('next-period')?.addEventListener('click', goNext);
  document.getElementById('today-btn')?.addEventListener('click', goToToday);

  document.getElementById('event-panel-close')?.addEventListener('click', closeEventPanel);
  document.getElementById('event-cancel')?.addEventListener('click', closeEventPanel);
  document.getElementById('event-save')?.addEventListener('click', () => { void saveEvent(); });
  document.getElementById('event-delete')?.addEventListener('click', async () => {
    if (editingEventId && editingEventDate && await showConfirmDialog(currentT.confirmDelete || 'Delete this event?', {
      title: currentT.delete || 'Delete',
      confirmText: currentT.delete || 'Delete',
      cancelText: currentT.cancel || 'Cancel',
      tone: 'danger'
    })) {
      deleteEvent(editingEventDate, editingEventId);
      closeEventPanel();
      renderCurrentView();
    }
  });

  const holidaySelect = document.getElementById('holiday-select');
  if (holidaySelect) {
    holidaySelect.addEventListener('change', () => {
      const newRegion = holidaySelect.value;
      localStorage.setItem('cultiva-holiday-region', newRegion);
      loadHolidays();
      renderCurrentView();
      log('Holiday region changed to:', newRegion);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('event-panel')?.classList.contains('active')) { closeEventPanel(); }
    const tag = e.target && e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;
    if (typing) {
      return;
    }
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
      return;
    }
    if (mod && e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrevious();
      return;
    }
    if (mod && e.key.toLowerCase() === 't') {
      e.preventDefault();
      goToToday();
      return;
    }
    if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openEventPanel(selectedDate);
    }
  });
  document.getElementById('event-panel')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('event-panel')) { closeEventPanel(); }
  });
  document.getElementById('event-title')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) { void saveEvent(); }
  });

  renderMonthView();
  applyI18n();
  log('Calendar initialized with', habits.getAll().length, 'habits');
}

init();
