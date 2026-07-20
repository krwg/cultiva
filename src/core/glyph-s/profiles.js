export const PROFILE_SETTINGS = {
  legacy: { fuzzyCutoff: 0.4, scoreScale: 1, maxCandidates: 8000 },
  balanced: { fuzzyCutoff: 0.48, scoreScale: 1.08, maxCandidates: 4000 },
  'max-quality': { fuzzyCutoff: 0.35, scoreScale: 1.16, maxCandidates: 9000 },
};

export function getProfileConfig(profile) {
  const key = String(profile || 'legacy').toLowerCase();
  return PROFILE_SETTINGS[key] || PROFILE_SETTINGS.legacy;
}

export const PROFILE_IDS = Object.freeze(['legacy', 'balanced', 'max-quality']);
