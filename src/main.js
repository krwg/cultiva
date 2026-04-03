import './styles/main.css';
import { LEGACY_THRESHOLD } from './core/config.js';
import { storage } from './modules/storage.js';
import { habits } from './modules/habits.js';

console.log('✅ Cultiva loaded');

// === DOM Elements === //
const gardenContainer = document.getElementById('garden-container');
const habitCountEl = document.getElementById('habit-count');
const addModal = document.getElementById('add-modal');
const openModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = addModal?.querySelector('.modal-close');
const modalOverlay = addModal?.querySelector('.modal-overlay');
const habitForm = document.getElementById('habit-form');

// === Render Functions === //
function createHabitCard(habit) {
  const stage = habits.getStage(habit.progress);
  const isCompleted = habit.lastCompleted === new Date().toISOString().split('T')[0];
  
  const card = document.createElement('article');
  card.className = 'habit-card';
  card.dataset.id = habit.id;
  
  card.innerHTML = `
    <div class="card-header">
      <div class="plant-visual">${stage.emoji}</div>
      <div class="card-info">
        <div class="card-title">${habit.name}</div>
        <div class="card-subtitle">${stage.name} • ${habit.progress} days</div>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn-card primary${isCompleted ? ' completed' : ''}">
        ${isCompleted ? '✓ Done' : 'Complete'}
      </button>
      <button class="btn-card danger" title="Delete">✕</button>
    </div>
  `;
  
  return card;
}

function renderGarden() {
  const allHabits = habits.getAll();
  const activeHabits = allHabits.filter(h => h.progress < LEGACY_THRESHOLD);
  
  gardenContainer.innerHTML = '';
  
  if (activeHabits.length === 0) {
    gardenContainer.innerHTML = `
      <div class="empty-state">
        <p style="font-size: 40px;">🌱</p>
        <p>Your garden is empty</p>
        <button class="btn-card primary" id="add-first-habit" style="width: auto; padding: 10px 20px;">
          Plant your first habit
        </button>
      </div>
    `;
    document.getElementById('add-first-habit')?.addEventListener('click', () => {
      openModal(addModal);
    });
  } else {
    activeHabits.forEach(habit => {
      gardenContainer.appendChild(createHabitCard(habit));
    });
  }
  
  // Update counter //
  if (habitCountEl) {
    habitCountEl.textContent = `${activeHabits.length}/9`;
  }
}

// === Modal Functions === //
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// === Event Listeners === //
function initEvents() {
  // Open modal //
  openModalBtn?.addEventListener('click', () => openModal(addModal));
  
  // Close modal //
  closeModalBtn?.addEventListener('click', () => closeModal(addModal));
  modalOverlay?.addEventListener('click', () => closeModal(addModal));
  
  // Close on Escape //
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(addModal);
    }
  });
  
  // Add habit form //
  habitForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('habit-name')?.value.trim();
    if (!name) return;
    
    try {
      habits.add({
        name,
        description: document.getElementById('habit-desc')?.value.trim(),
        category: document.getElementById('habit-category')?.value,
        trackType: 'binary'
      });
      
      // Reset form //
      habitForm.reset();
      closeModal(addModal);
      renderGarden();
      
      console.log('🌱 Habit added');
    } catch (err) {
      alert(err.message);
    }
  });
  
  // Garden click delegation //
  gardenContainer?.addEventListener('click', (e) => {
    const card = e.target.closest('.habit-card');
    if (!card) return;
    
    const id = card.dataset.id;
    
    // Complete buton //
    if (e.target.closest('.btn-card.primary')) {
      e.stopPropagation();
      habits.toggle(id);
      renderGarden();
      
      // Animation
      const visual = card.querySelector('.plant-visual');
      visual?.classList.add('growing');
      setTimeout(() => visual?.classList.remove('growing'), 250);
      return;
    }
    
    // Delete button //
    if (e.target.closest('.btn-card.danger')) {
      e.stopPropagation();
      if (confirm('Remove this habit?')) {
        habits.remove(id);
        renderGarden();
        console.log('Habit removed');
      }
      return;
    }
     
    // Card click -> open stats (placeholder) //
    console.log('Open stats for:', id);
  });
}

// === Init === //
function init() {
  renderGarden();
  initEvents();
  console.log('Garden rendered');
}

// Run //
init();