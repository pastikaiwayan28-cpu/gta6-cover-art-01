// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor shows the
// page with photos loaded. Query params pick the layout, grade, size, photos and caption.
// window.__shotReady is set once painted, after the Anton font is ready.
import { defaultPanels } from './cover.js';

const SAMPLES = { boulevard: 'boulevard', pier: 'pier' };

// Per-panel framing for the shots: each panel gets its own zoom and pan so repeated
// photos still read as different shots, and faces stay in frame. Landscape panels get
// a downward shift (dy > 0) that pulls the top of a portrait photo — the face — into view.
const FRAMINGS = {
  hero: [
    { zoom: 1.15, dx: 0, dy: 0 },
    { zoom: 1.3, dx: 0.08, dy: 0.25 },
    { zoom: 1.55, dx: -0.12, dy: 0.15 },
  ],
  grid: [
    { zoom: 1.15, dx: 0, dy: 0 },
    { zoom: 1.3, dx: 0, dy: 0 },
    { zoom: 1.55, dx: -0.1, dy: 0.05 },
    { zoom: 1.25, dx: 0, dy: 0.05 },
  ],
  strip: [
    { zoom: 1.15, dx: 0, dy: 0.2 },
    { zoom: 1.3, dx: 0.05, dy: 0 },
    { zoom: 1.55, dx: -0.1, dy: 0 },
    { zoom: 1.25, dx: 0, dy: 0 },
  ],
};

export async function runShot(shot, query, apply, loadImage) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  const layout = query.get('layout') || 'hero';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || '1920x1080';
  const photoA = query.get('photoA') || 'pier';
  const photoB = query.get('photoB') || 'boulevard';
  const photoC = query.get('photoC') || 'boulevard';
  const title = query.get('title') || 'VICE NIGHTS';
  const subtitle = query.get('subtitle') || 'A SUNSET HEIST IN VICE CITY';
  const panels = defaultPanels(layout);
  const assign = { A: photoA, B: photoB, C: photoC };
  const photos = {
    A: await loadImage(`samples/${SAMPLES[assign.A] || 'pier'}.jpg`),
    B: await loadImage(`samples/${SAMPLES[assign.B] || 'boulevard'}.jpg`),
    C: await loadImage(`samples/${SAMPLES[assign.C] || 'boulevard'}.jpg`),
  };
  const framings = FRAMINGS[layout] || FRAMINGS.hero;
  panels.forEach((p, i) => { p.zoom = framings[i].zoom; p.dx = framings[i].dx; p.dy = framings[i].dy; });
  await document.fonts.load('100px Anton');
  await document.fonts.ready;
  // A cover shot shows the exported cover, not the editor: no selection outline.
  apply({ layout, grade, size, title, subtitle, photos, panels, selected: shot === 'cover' ? null : 0, onePhoto: false });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
