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

/** Defaults — mutated only via session overrides in Developer Mode. */
export let MAX_ACTIVE_HABITS = 12;
export let MAX_HABITS_PER_BED = 3;
export const GARDEN_FULL_ERROR = 'Garden is full';
export const BED_FULL_ERROR = 'Bed is full';
export let LEGACY_THRESHOLD = 365;
export const STREAK_GRACE_DAYS_PER_MONTH = 1;

const CONFIG_DEFAULTS = Object.freeze({
  MAX_ACTIVE_HABITS: 12,
  MAX_HABITS_PER_BED: 3,
  LEGACY_THRESHOLD: 365
});

export function getRuntimeConfig() {
  return {
    MAX_ACTIVE_HABITS,
    MAX_HABITS_PER_BED,
    LEGACY_THRESHOLD
  };
}

/** Session-only overrides (not persisted). Live bindings update importers. */
export function applySessionOverrides(partial = {}) {
  if (partial.MAX_ACTIVE_HABITS != null && Number(partial.MAX_ACTIVE_HABITS) > 0) {
    MAX_ACTIVE_HABITS = Math.floor(Number(partial.MAX_ACTIVE_HABITS));
  }
  if (partial.MAX_HABITS_PER_BED != null && Number(partial.MAX_HABITS_PER_BED) > 0) {
    MAX_HABITS_PER_BED = Math.floor(Number(partial.MAX_HABITS_PER_BED));
  }
  if (partial.LEGACY_THRESHOLD != null && Number(partial.LEGACY_THRESHOLD) > 0) {
    LEGACY_THRESHOLD = Math.floor(Number(partial.LEGACY_THRESHOLD));
    GROWTH_STAGES.TREE.max = LEGACY_THRESHOLD - 1;
    GROWTH_STAGES.LEGACY.min = LEGACY_THRESHOLD;
  }
  return getRuntimeConfig();
}

export function clearSessionOverrides() {
  MAX_ACTIVE_HABITS = CONFIG_DEFAULTS.MAX_ACTIVE_HABITS;
  MAX_HABITS_PER_BED = CONFIG_DEFAULTS.MAX_HABITS_PER_BED;
  LEGACY_THRESHOLD = CONFIG_DEFAULTS.LEGACY_THRESHOLD;
  GROWTH_STAGES.TREE.max = LEGACY_THRESHOLD - 1;
  GROWTH_STAGES.LEGACY.min = LEGACY_THRESHOLD;
  return getRuntimeConfig();
}
