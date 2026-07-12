import { getPluginSounds } from './plugin-contributions.js';

let activeAudio = null;
let activeSoundId = null;

async function resolveSoundUrl(pluginId, src) {
  if (!src || !window.electron?.getPluginResourcePath) {
    return null;
  }
  const abs = await window.electron.getPluginResourcePath(pluginId, src);
  if (!abs) {
    return null;
  }
  return `file://${abs.replace(/\\/g, '/')}`;
}

export async function playPluginAmbientSound(soundId) {
  if (!soundId || soundId === 'none') {
    stopPluginAmbientSound();
    return;
  }
  const sound = getPluginSounds().find((row) => row.id === soundId);
  if (!sound) {
    stopPluginAmbientSound();
    return;
  }
  if (activeSoundId === soundId && activeAudio && !activeAudio.paused) {
    return;
  }
  stopPluginAmbientSound();
  const url = await resolveSoundUrl(sound.pluginId, sound.src);
  if (!url) {
    return;
  }
  const audio = new Audio(url);
  audio.loop = sound.loop;
  audio.volume = sound.volume;
  try {
    await audio.play();
    activeAudio = audio;
    activeSoundId = soundId;
  } catch {
    activeAudio = null;
    activeSoundId = null;
  }
}

export function stopPluginAmbientSound() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  activeSoundId = null;
}

export function getActivePluginSoundId() {
  return activeSoundId;
}
