const GRAPHITE = '#0b0b0b';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function zigzagLine(x0, y0, x1, y1, segments, jitter) {
  const pts = [{ x: x0, y: y0 }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const x = x0 + (x1 - x0) * t + (Math.random() - 0.5) * jitter;
    const y = y0 + (y1 - y0) * t + (Math.random() - 0.5) * jitter * 0.4;
    pts.push({ x, y });
  }
  pts.push({ x: x1, y: y1 });
  return pts;
}

function buildTree(w, h) {
  const baseX = w * 0.5;
  const baseY = h * 0.92;
  const trunkTop = { x: baseX + (Math.random() - 0.5) * 12, y: h * 0.38 };
  const trunk = zigzagLine(baseX, baseY, trunkTop.x, trunkTop.y, 8, 18);

  const branches = [];
  const leafGroups = [];
  const berries = [];
  const tips = [
    { ax: trunkTop.x, ay: trunkTop.y, angle: -0.9, len: h * 0.22 },
    { ax: trunkTop.x, ay: trunkTop.y, angle: -0.35, len: h * 0.26 },
    { ax: trunkTop.x, ay: trunkTop.y, angle: 0.35, len: h * 0.24 },
    { ax: trunkTop.x, ay: trunkTop.y, angle: 0.85, len: h * 0.2 },
    { ax: trunkTop.x, ay: trunkTop.y - h * 0.06, angle: -1.2, len: h * 0.18 },
    { ax: trunkTop.x, ay: trunkTop.y - h * 0.04, angle: 1.15, len: h * 0.17 }
  ];

  tips.forEach((tip, bi) => {
    const ex = tip.ax + Math.cos(tip.angle) * tip.len;
    const ey = tip.ay + Math.sin(tip.angle) * tip.len;
    const pts = zigzagLine(tip.ax, tip.ay, ex, ey, 6, 22);
    branches.push({
      id: bi,
      pts,
      thick: bi < 2 ? 2.2 : 1.2,
      opacity: bi < 2 ? 0.28 : 0.22,
      tremorFreq: 0.0012 + bi * 0.0003,
      tremorAmp: 1.2 + bi * 0.4
    });

    const subCount = 2 + (bi % 3);
    for (let s = 0; s < subCount; s++) {
      const t = (s + 1) / (subCount + 1);
      const idx = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
      const from = pts[idx];
      const subAngle = tip.angle + (s - subCount / 2) * 0.45;
      const subLen = tip.len * (0.35 + Math.random() * 0.2);
      const sx = from.x + Math.cos(subAngle) * subLen;
      const sy = from.y + Math.sin(subAngle) * subLen;
      const subPts = zigzagLine(from.x, from.y, sx, sy, 4, 14);
      branches.push({
        id: 100 + bi * 10 + s,
        pts: subPts,
        thick: 1,
        opacity: 1,
        tremorFreq: 0.002 + s * 0.0004,
        tremorAmp: 2.5
      });

      const leaflets = 5 + (s % 4);
      for (let l = 0; l < leaflets; l++) {
        const lx = subPts[subPts.length - 1].x + (l - leaflets / 2) * 5;
        const ly = subPts[subPts.length - 1].y - 4 - l * 2;
        leafGroups.push({
          id: leafGroups.length,
          x: lx,
          y: ly,
          w: 8 + (l % 3) * 2,
          phase: (bi + s + l) * 0.37,
          flipMs: 280 + (l % 5) * 90
        });
      }

      berries.push({
        x: subPts[subPts.length - 1].x,
        y: subPts[subPts.length - 1].y,
        phase: bi * 1.1 + s * 0.6,
        pulseMs: 2200 + bi * 340,
        rings: [],
        drops: []
      });
    }
  });

  return { trunk, branches, leafGroups, berries, baseX, baseY };
}

function tremorPoint(p, t, branch) {
  const wobble = Math.sin(t * branch.tremorFreq + branch.id) * branch.tremorAmp;
  const wobble2 = Math.cos(t * branch.tremorFreq * 1.7 + branch.id * 0.5) * branch.tremorAmp * 0.6;
  return { x: p.x + wobble, y: p.y + wobble2 };
}

function drawBranch(ctx, branch, t) {
  const pts = branch.pts.map((p) => tremorPoint(p, t, branch));
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = `rgba(255, 255, 255, ${branch.opacity})`;
  ctx.lineWidth = branch.thick;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawLeafGroup(ctx, leaf, t) {
  const cycle = Math.floor(t / leaf.flipMs + leaf.phase) % 2;
  if (cycle === 0) {
    return;
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const ox = (i - 1.5) * 3;
    ctx.beginPath();
    ctx.moveTo(leaf.x + ox, leaf.y);
    ctx.lineTo(leaf.x + ox + leaf.w * 0.3, leaf.y - leaf.w * 0.55);
    ctx.stroke();
  }
}

function drawBerry(ctx, berry, t, h) {
  const pulse = (Math.sin((t + berry.phase * 1000) / berry.pulseMs * Math.PI * 2) + 1) * 0.5;
  const scale = 0.35 + pulse * 0.65;
  const r = 4 + scale * 5;

  if (pulse > 0.92 && Math.random() < 0.02) {
    berry.drops.push({
      x: berry.x,
      y: berry.y,
      vy: 0.4 + Math.random() * 0.6,
      trail: []
    });
  }

  const grad = ctx.createRadialGradient(berry.x, berry.y, 0, berry.x, berry.y, r * 2.2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(berry.x, berry.y, r, 0, Math.PI * 2);
  ctx.fill();

  berry.rings = berry.rings.filter((ring) => ring.life < 1);
  if (pulse > 0.85 && berry.rings.length < 3) {
    berry.rings.push({ r: r, life: 0, speed: 0.35 + Math.random() * 0.2 });
  }
  berry.rings.forEach((ring) => {
    ring.r += ring.speed;
    ring.life += 0.012;
    const alpha = Math.max(0, 0.55 * (1 - ring.life));
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(berry.x, berry.y, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  berry.drops = berry.drops.filter((d) => d.y < h + 20);
  berry.drops.forEach((d) => {
    d.trail.push({ x: d.x, y: d.y });
    if (d.trail.length > 8) {
      d.trail.shift();
    }
    d.y += d.vy;
    d.x += Math.sin(d.y * 0.05) * 0.15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    d.trail.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

export function mountRowanCluster(container) {
  if (container._rowanStop) {
    container._rowanStop();
  }
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.className = 'rowan-cluster-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let tree = null;
  let raf = 0;
  let staticDrawn = false;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = container.clientWidth || window.innerWidth;
    h = container.clientHeight || window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tree = buildTree(w, h);
    staticDrawn = false;
  };

  const drawFrame = (t) => {
    if (!tree || w <= 0 || h <= 0) {
      return;
    }
    ctx.fillStyle = GRAPHITE;
    ctx.fillRect(0, 0, w, h);

    drawBranch(ctx, {
      id: 0,
      thick: 3.5,
      opacity: 0.3,
      tremorFreq: 0.0008,
      tremorAmp: 1.5,
      pts: tree.trunk
    }, t);
    tree.branches.forEach((b) => drawBranch(ctx, b, t));
    tree.leafGroups.forEach((leaf) => drawLeafGroup(ctx, leaf, t));
    tree.berries.forEach((berry) => drawBerry(ctx, berry, t, h));
  };

  const loop = (t) => {
    drawFrame(t);
    raf = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (prefersReducedMotion()) {
      if (!staticDrawn) {
        drawFrame(0);
        staticDrawn = true;
      }
      return;
    }
    if (!raf) {
      raf = requestAnimationFrame(loop);
    }
  };

  const onLayout = () => {
    resize();
    if (w > 0 && h > 0) {
      startLoop();
    }
  };

  onLayout();
  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => onLayout())
    : null;
  ro?.observe(container);
  window.addEventListener('resize', onLayout);

  if (w <= 0 || h <= 0) {
    requestAnimationFrame(() => {
      onLayout();
      if (w <= 0 || h <= 0) {
        requestAnimationFrame(onLayout);
      }
    });
  }

  container._rowanPause = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  container._rowanResume = () => {
    onLayout();
  };

  container._rowanStop = () => {
    container._rowanPause();
    ro?.disconnect();
    window.removeEventListener('resize', onLayout);
    container.innerHTML = '';
    container._rowanStop = null;
    container._rowanPause = null;
    container._rowanResume = null;
  };

  return container._rowanStop;
}

export function pauseRowanCluster(container) {
  container?._rowanPause?.();
}

export function resumeRowanCluster(container) {
  container?._rowanResume?.();
}

export function stopRowanCluster(container) {
  if (container?._rowanStop) {
    container._rowanStop();
  }
}
