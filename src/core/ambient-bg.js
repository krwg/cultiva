import { mountRowanCluster, stopRowanCluster, pauseRowanCluster, resumeRowanCluster } from './rowan-cluster-bg.js';
import { loadAmbientCss } from './theme-css-loader.js';
import { AMBIENT_BG_LAYER_IDS, LS_CUSTOM_BG_DATA, getWithBgClassList } from './theme-config.js';
import {
  getPluginBackgroundBodyClasses,
  getPluginBackgrounds,
  isPluginBackgroundId,
  mountPluginBackgroundHtml
} from './plugin-contributions.js';

const MAX_CUSTOM_BYTES = 1_400_000;
const _particleHtmlCache = new Map();

function isLowPower() {
  return typeof document !== 'undefined'
    && document.documentElement?.dataset?.lowPower === '1';
}

function particleCount(base) {
  return isLowPower() ? Math.max(4, Math.floor(base * 0.4)) : base;
}

function mountParticleLayer(container, cacheKey, build) {
  const cached = _particleHtmlCache.get(cacheKey);
  if (cached) {
    container.innerHTML = cached;
    return;
  }
  build(container);
  _particleHtmlCache.set(cacheKey, container.innerHTML);
}

function stripAmbientClasses(body) {
  body.classList.remove('with-ambient-bg', ...getWithBgClassList(), ...getPluginBackgroundBodyClasses());
}

function hideAllLayers(doc) {
  [...AMBIENT_BG_LAYER_IDS, 'custom'].forEach((id) => {
    const el = doc.getElementById(`bg-${id}`);
    if (el) {
      if (id === 'rowan-cluster') {
        stopRowanCluster(el);
      }
      el.style.display = 'none';
      if (id === 'custom') {
        el.style.backgroundImage = 'none';
      }
    }
  });
  getPluginBackgrounds().forEach((bg) => {
    const el = doc.getElementById(`bg-${bg.id}`);
    if (el) {
      el.style.display = 'none';
    }
  });
}

export function readCustomBackgroundDataUrl() {
  try {
    return localStorage.getItem(LS_CUSTOM_BG_DATA) || '';
  } catch {
    return '';
  }
}

export function pauseAmbientRuntime(doc = document) {
  doc.body.classList.add('ambient-paused');
  const rowan = doc.getElementById('bg-rowan-cluster');
  if (rowan) {
    pauseRowanCluster(rowan);
  }
}

export function resumeAmbientRuntime(doc = document) {
  doc.body.classList.remove('ambient-paused');
  const rowan = doc.getElementById('bg-rowan-cluster');
  if (rowan && rowan.style.display !== 'none') {
    resumeRowanCluster(rowan);
  }
}

export function applyAmbientBackground(doc, body, bg) {
  stripAmbientClasses(body);
  hideAllLayers(doc);

  if (!bg || bg === 'none') {
    return;
  }

  if (bg === 'custom') {
    const url = readCustomBackgroundDataUrl();
    if (!url) {
      return;
    }
    const el = doc.getElementById('bg-custom');
    if (!el) { return; }
    el.style.backgroundImage = `url(${JSON.stringify(url)})`;
    el.style.display = 'block';
    body.classList.add('with-bg-custom', 'with-ambient-bg');
    return;
  }

  if (isPluginBackgroundId(bg)) {
    void loadAmbientCss(bg);
    const row = getPluginBackgrounds().find((item) => item.id === bg);
    if (row) {
      body.classList.add(row.bodyClass, 'with-ambient-bg');
      mountPluginBackgroundHtml(bg);
    }
    return;
  }

  const container = doc.getElementById(`bg-${bg}`);
  if (!container) { return; }

  void loadAmbientCss(bg);
  container.style.display = 'block';
  body.classList.add(`with-bg-${bg}`, 'with-ambient-bg');

  if (bg === 'rainfall') { generateRaindrops(container); }
  if (bg === 'starlight') { generateStars(container); }
  if (bg === 'snowfall') { generateSnowflakes(container); }
  if (bg === 'fireflies') { generateFireflies(container); }
  if (bg === 'petal') { generatePetals(container); }
  if (bg === 'ember') { generateEmbers(container); }
  if (bg === 'breeze') { generateBreeze(container); }
  if (bg === 'cypress-drift') { generateCypressNeedles(container); }
  if (bg === 'dew') { generateDew(container); }
  if (bg === 'sunbeam') { generateSunbeams(container); }
  if (bg === 'linden-bloom') { generateLindenLeaves(container); }
  if (bg === 'rowan-cluster') {
    // display:none → block can leave 0×0 layout for one frame on macOS Electron;
    // wait two frames so mountRowanCluster measures a real size.
    const mount = () => {
      mountRowanCluster(container);
      if (body.classList.contains('ambient-paused')) {
        pauseRowanCluster(container);
      } else {
        resumeRowanCluster(container);
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(mount);
    });
  }
}

export function saveCustomBackgroundFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result.length > MAX_CUSTOM_BYTES) {
        reject(new Error('Image too large'));
        return;
      }
      try {
        localStorage.setItem(LS_CUSTOM_BG_DATA, result);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export function clearCustomBackground() {
  try {
    localStorage.removeItem(LS_CUSTOM_BG_DATA);
  } catch {
    void 0;
  }
}

function generateRaindrops(container) {
  const key = `rainfall:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(50); i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.animationDuration = `${1 + Math.random() * 1}s`;
      el.appendChild(drop);
    }
  });
}

function generateStars(container) {
  const key = `starlight:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(100); i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      el.appendChild(star);
    }
  });
}

function generateSnowflakes(container) {
  const key = `snowfall:${isLowPower() ? 'low' : 'full'}`;
  const snowflakes = ['❄️', '❅', '❆', '✻', '✼', '❉'];
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(40); i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.fontSize = `${0.8 + Math.random() * 1.5}em`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.animationDuration = `${5 + Math.random() * 7}s`;
      el.appendChild(flake);
    }
  });
}

function generateFireflies(container) {
  const key = `fireflies:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(25); i++) {
      const fly = document.createElement('div');
      fly.className = 'firefly';
      fly.style.left = `${Math.random() * 100}%`;
      fly.style.top = `${20 + Math.random() * 60}%`;
      fly.style.animationDelay = `${Math.random() * 8}s`;
      fly.style.animationDuration = `${6 + Math.random() * 10}s`;
      el.appendChild(fly);
    }
  });
}

function generatePetals(container) {
  const key = `petal:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(36); i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 12}s`;
      p.style.animationDuration = `${14 + Math.random() * 12}s`;
      p.style.setProperty('--drift', `${(Math.random() - 0.5) * 80}px`);
      el.appendChild(p);
    }
  });
}

function generateEmbers(container) {
  const key = `ember:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(40); i++) {
      const em = document.createElement('div');
      em.className = 'ember';
      em.style.left = `${Math.random() * 100}%`;
      em.style.animationDelay = `${Math.random() * 6}s`;
      em.style.animationDuration = `${4 + Math.random() * 8}s`;
      el.appendChild(em);
    }
  });
}

function generateBreeze(container) {
  const key = `breeze:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(28); i++) {
      const b = document.createElement('div');
      b.className = 'breeze-line';
      b.style.left = `${Math.random() * 100}%`;
      b.style.top = `${Math.random() * 100}%`;
      b.style.animationDelay = `${Math.random() * 8}s`;
      b.style.animationDuration = `${10 + Math.random() * 14}s`;
      b.style.transform = `rotate(${-15 + Math.random() * 30}deg)`;
      el.appendChild(b);
    }
  });
}

function generateCypressNeedles(container) {
  const key = `cypress:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(48); i++) {
      const n = document.createElement('div');
      n.className = 'cypress-needle';
      n.style.left = `${Math.random() * 100}%`;
      n.style.animationDelay = `${Math.random() * 14}s`;
      n.style.animationDuration = `${12 + Math.random() * 16}s`;
      n.style.setProperty('--sway', `${(Math.random() - 0.5) * 60}px`);
      el.appendChild(n);
    }
  });
}

function generateDew(container) {
  const key = `dew:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(55); i++) {
      const d = document.createElement('div');
      d.className = 'dew-drop';
      d.style.left = `${Math.random() * 100}%`;
      d.style.top = `${Math.random() * 100}%`;
      d.style.animationDelay = `${Math.random() * 6}s`;
      d.style.animationDuration = `${3 + Math.random() * 5}s`;
      el.appendChild(d);
    }
  });
}

function generateSunbeams(container) {
  mountParticleLayer(container, 'sunbeam', (el) => {
    el.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const beam = document.createElement('div');
      beam.className = 'sunbeam-ray';
      beam.style.left = `${10 + i * 14}%`;
      beam.style.animationDelay = `${i * 1.2}s`;
      el.appendChild(beam);
    }
  });
}

function generateLindenLeaves(container) {
  const key = `linden:${isLowPower() ? 'low' : 'full'}`;
  mountParticleLayer(container, key, (el) => {
    el.innerHTML = '';
    for (let i = 0; i < particleCount(42); i++) {
      const leaf = document.createElement('div');
      leaf.className = 'linden-leaf';
      leaf.style.left = `${Math.random() * 100}%`;
      leaf.style.animationDelay = `${Math.random() * 14}s`;
      leaf.style.animationDuration = `${16 + Math.random() * 14}s`;
      leaf.style.setProperty('--drift', `${(Math.random() - 0.5) * 90}px`);
      leaf.style.setProperty('--spin', `${120 + Math.random() * 220}deg`);
      el.appendChild(leaf);
    }
  });
}
