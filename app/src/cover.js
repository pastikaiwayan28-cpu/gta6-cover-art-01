// Renders the multi-panel GTA-style cover: white-framed photo panels, a sunset or neon
// colour grade washed over them, and the bold caption band along the foot. One function
// draws at any size, so the live preview and the exported PNG are the same picture.
// Original design: no Rockstar logo, artwork or font anywhere. The type is Anton (OFL).

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

export const LAYOUTS = {
  hero: { panels: 3, label: 'Hero' },
  grid: { panels: 4, label: 'Grid' },
  strip: { panels: 4, label: 'Strip' },
};

export const GRADES = {
  sunset: {
    accent: '#ffd166',
    band: ['#2a1230', '#120a18'],
    wash: [[0, 'rgba(255,120,60,0)'], [1, 'rgba(220,40,110,0.38)']],
  },
  neon: {
    accent: '#00e5ff',
    band: ['#160a2e', '#0a0616'],
    wash: [[0, 'rgba(0,229,255,0.10)'], [0.5, 'rgba(255,0,180,0.12)'], [1, 'rgba(255,0,180,0.30)']],
  },
  vice: {
    accent: '#ff7ad9',
    band: ['#1d1030', '#0d0817'],
    wash: [[0, 'rgba(0,200,180,0.08)'], [1, 'rgba(120,40,200,0.32)']],
  },
};

/** The photo area: everything above the caption band, with its margin and gutter. */
function photoArea(W, H) {
  const bandTop = H * 0.8;
  const margin = Math.round(Math.min(W, H) * 0.02);
  const gap = Math.round(Math.min(W, H) * 0.012);
  return { x: margin, y: margin, w: W - 2 * margin, h: bandTop - 2 * margin, gap, bandTop };
}

/** Panel rectangles for a layout, in pixels. */
export function panelRects(layout, W, H) {
  const a = photoArea(W, H);
  const g = a.gap;
  if (layout === 'grid') {
    const w = (a.w - g) / 2;
    const h = (a.h - g) / 2;
    return [
      { x: a.x, y: a.y, w, h },
      { x: a.x + w + g, y: a.y, w, h },
      { x: a.x, y: a.y + h + g, w, h },
      { x: a.x + w + g, y: a.y + h + g, w, h },
    ];
  }
  if (layout === 'strip') {
    const topH = a.h * 0.55 - g / 2;
    const botH = a.h * 0.45 - g / 2;
    const w = (a.w - 2 * g) / 3;
    const y2 = a.y + topH + g;
    return [
      { x: a.x, y: a.y, w: a.w, h: topH },
      { x: a.x, y: y2, w, h: botH },
      { x: a.x + w + g, y: y2, w, h: botH },
      { x: a.x + 2 * (w + g), y: y2, w, h: botH },
    ];
  }
  // hero: one tall panel on the left, two stacked on the right.
  const bigW = a.w * 0.62 - g / 2;
  const sideW = a.w * 0.38 - g / 2;
  const sideH = (a.h - g) / 2;
  return [
    { x: a.x, y: a.y, w: bigW, h: a.h },
    { x: a.x + bigW + g, y: a.y, w: sideW, h: sideH },
    { x: a.x + bigW + g, y: a.y + sideH + g, w: sideW, h: sideH },
  ];
}

/** Default panel state for a layout: photos cycle A, B, C, A. */
export function defaultPanels(layout) {
  const n = LAYOUTS[layout].panels;
  const cycle = ['A', 'B', 'C', 'A'];
  return Array.from({ length: n }, (_, i) => ({ photo: cycle[i], zoom: 1, dx: 0, dy: 0 }));
}

/** Draws one photo cover-fit into a panel, honouring its zoom and pan. */
function drawPanelPhoto(ctx, img, rect, panel) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!img) {
    // Empty panel: a small procedural sunset so the cover never looks broken.
    const sky = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    sky.addColorStop(0, '#ff9a5a');
    sky.addColorStop(0.6, '#e5488f');
    sky.addColorStop(1, '#2b1838');
    ctx.fillStyle = sky;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    const r = Math.min(rect.w, rect.h) * 0.16;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + rect.h * 0.42, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.max(14, rect.w * 0.045)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h * 0.72);
  } else {
    const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * panel.zoom;
    const pw = img.naturalWidth * scale;
    const ph = img.naturalHeight * scale;
    const cx = rect.x + rect.w / 2 + panel.dx * rect.w;
    const cy = rect.y + rect.h / 2 + panel.dy * rect.h;
    ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  }
  ctx.restore();
}

/** Shrinks a one-line Anton title until it fits maxWidth. Returns the size used. */
function fitTitle(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/**
 * Draws the whole cover onto ctx at W x H.
 * state: { layout, grade, title, subtitle, onePhoto, photos: {A,B,C}, panels, selected }
 * showSelection draws the selected panel's dashed outline (preview only, never in exports).
 */
export function drawCover(ctx, state, W, H, showSelection = false) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const { bandTop } = photoArea(W, H);
  ctx.fillStyle = '#140d1c';
  ctx.fillRect(0, 0, W, H);
  const rects = panelRects(state.layout, W, H);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || { photo: 'A', zoom: 1, dx: 0, dy: 0 };
    const key = state.onePhoto ? 'A' : panel.photo;
    drawPanelPhoto(ctx, state.photos[key] || null, rect, panel);
  });
  // Colour grade washed over the panels.
  const wash = ctx.createLinearGradient(0, 0, 0, bandTop);
  for (const [stop, color] of grade.wash) wash.addColorStop(stop, color);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, bandTop);
  // White frames around the panels.
  const frame = Math.max(2, Math.round(Math.min(W, H) * 0.005));
  ctx.lineWidth = frame;
  ctx.strokeStyle = '#ffffff';
  rects.forEach((rect) => ctx.strokeRect(rect.x, rect.y, rect.w, rect.h));
  if (showSelection && state.selected != null && rects[state.selected]) {
    const r = rects[state.selected];
    ctx.save();
    ctx.setLineDash([Math.max(8, W * 0.01), Math.max(6, W * 0.008)]);
    ctx.lineWidth = frame + 2;
    ctx.strokeStyle = grade.accent;
    ctx.strokeRect(r.x - frame, r.y - frame, r.w + 2 * frame, r.h + 2 * frame);
    ctx.restore();
  }
  // Vignette.
  const vig = ctx.createRadialGradient(W / 2, H * 0.4, Math.min(W, H) * 0.35, W / 2, H * 0.45, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  // Caption band.
  const band = ctx.createLinearGradient(0, bandTop, 0, H);
  band.addColorStop(0, grade.band[0]);
  band.addColorStop(1, grade.band[1]);
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, W, H - bandTop);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, bandTop, W, Math.max(3, H * 0.006));
  // Title in Anton.
  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    const size = fitTitle(ctx, title, W * 0.92, H * 0.088);
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillText(title, W / 2, bandTop + (H - bandTop) * 0.42);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  // Subtitle, letter-spaced by hand.
  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    const spaced = sub.split('').join('\u2009');
    let size = H * 0.021;
    ctx.font = `bold ${size}px sans-serif`;
    while (ctx.measureText(spaced).width > W * 0.9 && size > 8) {
      size -= 1;
      ctx.font = `bold ${size}px sans-serif`;
    }
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(spaced, W / 2, bandTop + (H - bandTop) * 0.8);
  }
  ctx.textBaseline = 'alphabetic';
}
