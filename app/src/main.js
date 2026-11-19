// Wires the page: pick photos, choose a layout, grade and size, edit the caption, click a
// panel to select it and drag it to reposition the photo, then export the cover as a PNG.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, panelRects, defaultPanels, SIZES, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const panelLabel = document.getElementById('panelLabel');
const zoomInput = document.getElementById('zoom');

const state = {
  layout: 'hero',
  grade: 'sunset',
  size: '1080x1080',
  title: 'VICE NIGHTS',
  subtitle: 'A SUNSET HEIST IN VICE CITY',
  onePhoto: false,
  photos: { A: null, B: null, C: null },
  panels: defaultPanels('hero'),
  selected: 0,
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function previewSize() {
  return SIZES[state.size];
}

function redraw() {
  const [w, h] = previewSize();
  canvas.width = w;
  canvas.height = h;
  drawCover(ctx, state, w, h, true);
  const panel = state.panels[state.selected];
  panelLabel.textContent = panel
    ? `Panel ${state.selected + 1} of ${state.panels.length} — photo ${state.onePhoto ? 'A (one photo for all)' : panel.photo}, zoom ${panel.zoom.toFixed(2)}x. Drag it to move the photo.`
    : 'No panel selected.';
  zoomInput.value = panel ? String(panel.zoom) : '1';
}

/** Maps a pointer event on the canvas to cover coordinates. */
function eventPoint(e) {
  const r = canvas.getBoundingClientRect();
  const [w, h] = previewSize();
  return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
}

/** Which panel (index) holds point p, or -1. */
function hitPanel(p) {
  const [w, h] = previewSize();
  return panelRects(state.layout, w, h).findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = eventPoint(e);
  const i = hitPanel(p);
  if (i === -1) return;
  state.selected = i;
  const [w, h] = previewSize();
  const rect = panelRects(state.layout, w, h)[i];
  drag = { x: p.x, y: p.y, rect, panel: state.panels[i] };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = eventPoint(e);
  drag.panel.dx += (p.x - drag.x) / drag.rect.w;
  drag.panel.dy += (p.y - drag.y) / drag.rect.h;
  drag.panel.dx = Math.max(-0.6, Math.min(0.6, drag.panel.dx));
  drag.panel.dy = Math.max(-0.6, Math.min(0.6, drag.panel.dy));
  drag.x = p.x;
  drag.y = p.y;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

function bindPhoto(inputId, key) {
  document.getElementById(inputId).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.photos[key] = await loadImage(URL.createObjectURL(file));
    status.textContent = `Photo ${key} loaded.`;
    redraw();
  });
}
bindPhoto('photoA', 'A');
bindPhoto('photoB', 'B');
bindPhoto('photoC', 'C');

async function useSample(key, sample) {
  state.photos[key] = await loadImage(`samples/${sample}.jpg`);
  status.textContent = `Photo ${key}: sample ${sample}.`;
  redraw();
}
document.getElementById('sampleA').addEventListener('click', () => useSample('A', 'boulevard'));
document.getElementById('sampleB').addEventListener('click', () => useSample('B', 'pier'));
document.getElementById('sampleC').addEventListener('click', () => useSample('C', 'boulevard'));

document.getElementById('onePhoto').addEventListener('change', (e) => {
  state.onePhoto = e.target.checked;
  redraw();
});

function bindGroup(id, attr, apply) {
  document.getElementById(id).addEventListener('click', (e) => {
    const btn = e.target.closest(`[data-${attr}]`);
    if (!btn) return;
    for (const b of e.currentTarget.querySelectorAll('button')) b.classList.remove('on');
    btn.classList.add('on');
    apply(btn.dataset[attr]);
    redraw();
  });
}
bindGroup('layouts', 'layout', (v) => {
  state.layout = v;
  state.panels = defaultPanels(v);
  state.selected = 0;
});
bindGroup('grades', 'grade', (v) => { state.grade = v; });
bindGroup('sizes', 'size', (v) => { state.size = v; });

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
zoomInput.addEventListener('input', () => {
  const panel = state.panels[state.selected];
  if (panel) { panel.zoom = Number(zoomInput.value); redraw(); }
});
document.getElementById('resetPanel').addEventListener('click', () => {
  const panel = state.panels[state.selected];
  if (panel) { panel.zoom = 1; panel.dx = 0; panel.dy = 0; redraw(); }
});

document.getElementById('export').addEventListener('click', () => {
  const [w, h] = previewSize();
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off.getContext('2d'), state, w, h, false);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-nights-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-nights-${w}x${h}.png`;
  }, 'image/png');
});

/** Lets a shot scene set the whole state at once. */
export function applyShot(scene) {
  Object.assign(state, scene);
  state.panels = scene.panels || defaultPanels(state.layout);
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  if (title) title.value = state.title;
  if (subtitle) subtitle.value = state.subtitle;
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('on', b.dataset.layout === state.layout));
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('on', b.dataset.grade === state.grade));
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b.dataset.size === state.size));
  document.getElementById('onePhoto').checked = state.onePhoto;
  redraw();
}

export function getState() { return state; }

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  document.fonts.ready.then(() => runShot(shot, new URLSearchParams(location.search), applyShot, loadImage));
} else {
  document.fonts.ready.then(redraw);
  redraw();
}
