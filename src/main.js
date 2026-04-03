import './styles/main.css';
import { GROWTH_STAGES, LEGACY_THRESHOLD } from './core/config.js';
import { storage } from './modules/storage.js';

console.log('✅ Cultiva loaded');
console.log('📦 Storage test:', storage.getHabits());

const habits = storage.getHabits();
if (habits.length === 0) {
  const demoHabit = {
    id: 'demo-1',
    name: '☕ Drink water',
    progress: 5,
    createdAt: new Date().toISOString()
  };
  storage.saveHabits([demoHabit]);
  console.log('🌱 Demo habit added');
}

console.log(`📊 Active habits: ${storage.getHabits().length}`);