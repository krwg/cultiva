export const GROWTH_STAGES = {
  SEED:    { min: 0,   max: 6,   emoji: '🌱', name: 'Seed' },
  SPROUT:  { min: 7,   max: 20,  emoji: '🌿', name: 'Sprout' },
  PLANT:   { min: 21,  max: 49,  emoji: '🪴', name: 'Plant' },
  TREE:    { min: 50,  max: 364, emoji: '🌳', name: 'Tree' },
  LEGACY:  { min: 365, max: Infinity, emoji: '🏆', name: 'Legacy' }
};

export const STORAGE_KEYS = {
  HABITS: 'cultiva-habits',
  SETTINGS: 'cultiva-settings'
};

export const MAX_ACTIVE_HABITS = 12;
export const MAX_HABITS_PER_BED = 3;
export const GARDEN_FULL_ERROR = 'Garden is full';
export const BED_FULL_ERROR = 'Bed is full';
export const LEGACY_THRESHOLD = 365;
export const STREAK_GRACE_DAYS_PER_MONTH = 1;
