/**
 * Search quality/speed profiles for glyph-s.
 * Data lives in profiles.json; this module re-exports for ESM and CJS bundling.
 * @module profiles
 */

/** @type {Record<string, import('./types.js').SearchProfileConfig>} */
export const PROFILE_SETTINGS = {
  legacy: { fuzzyCutoff: 0.4, scoreScale: 1, maxCandidates: 8000 },
  balanced: { fuzzyCutoff: 0.48, scoreScale: 1.08, maxCandidates: 4000 },
  'max-quality': { fuzzyCutoff: 0.35, scoreScale: 1.16, maxCandidates: 9000 },
};

/**
 * Resolve a profile name to its config (falls back to `legacy`).
 * @param {string} [profile]
 * @returns {import('./types.js').SearchProfileConfig}
 */
export function getProfileConfig(profile) {
  const key = String(profile || 'legacy').toLowerCase();
  return PROFILE_SETTINGS[key] || PROFILE_SETTINGS.legacy;
}

/** Stable list of known profile ids. */
export const PROFILE_IDS = Object.freeze(['legacy', 'balanced', 'max-quality']);
