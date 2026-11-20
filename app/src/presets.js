/* Vice Dusk Cover Studio — preset data.
   Layouts, sunset grades and export sizes. Plain data only; the painter
   in painter.js turns these into pixels. */
(function (global) {
  'use strict';

  // Panel rectangles are fractions of the canvas (x, y, w, h).
  // Each panel names the photo slot that fills it ("A", "B" or "C").
  var LAYOUTS = {
    marquee: {
      label: 'Marquee',
      panels: [
        { slot: 'A', x: 0, y: 0, w: 1, h: 0.62 },
        { slot: 'B', x: 0, y: 0.62, w: 0.5, h: 0.38 },
        { slot: 'C', x: 0.5, y: 0.62, w: 0.5, h: 0.38 }
      ]
    },
    columns: {
      label: 'Columns',
      panels: [
        { slot: 'A', x: 0, y: 0, w: 0.34, h: 1 },
        { slot: 'B', x: 0.34, y: 0, w: 0.33, h: 1 },
        { slot: 'C', x: 0.67, y: 0, w: 0.33, h: 1 }
      ]
    },
    duo: {
      label: 'Duo',
      panels: [
        { slot: 'A', x: 0, y: 0, w: 0.5, h: 0.78 },
        { slot: 'B', x: 0.5, y: 0, w: 0.5, h: 0.78 }
      ]
    },
    solo: {
      label: 'Solo',
      panels: [
        { slot: 'A', x: 0, y: 0, w: 1, h: 1 }
      ]
    }
  };

  // A grade is a list of colour stops painted as a vertical wash over the
  // whole cover, plus a warm tint colour drawn with a soft-light feel.
  // "noir" desaturates the photo itself (handled in painter.js).
  var GRADES = {
    dusk: {
      label: 'Vice Dusk',
      stops: [
        [0.0, 'rgba(255, 46, 136, 0.00)'],
        [0.45, 'rgba(255, 46, 136, 0.10)'],
        [0.75, 'rgba(255, 120, 40, 0.22)'],
        [1.0, 'rgba(255, 154, 61, 0.34)']
      ],
      tint: 'rgba(255, 90, 60, 0.10)',
      grey: false
    },
    neon: {
      label: 'Neon Palms',
      stops: [
        [0.0, 'rgba(0, 229, 199, 0.20)'],
        [0.5, 'rgba(0, 229, 199, 0.05)'],
        [0.8, 'rgba(255, 46, 136, 0.18)'],
        [1.0, 'rgba(255, 46, 136, 0.32)']
      ],
      tint: 'rgba(0, 229, 199, 0.08)',
      grey: false
    },
    gold: {
      label: 'Gold Hour',
      stops: [
        [0.0, 'rgba(255, 210, 61, 0.05)'],
        [0.5, 'rgba(255, 179, 71, 0.14)'],
        [1.0, 'rgba(255, 140, 40, 0.30)']
      ],
      tint: 'rgba(255, 190, 80, 0.12)',
      grey: false
    },
    noir: {
      label: 'Mono Noir',
      stops: [
        [0.0, 'rgba(20, 20, 30, 0.10)'],
        [1.0, 'rgba(20, 20, 30, 0.28)']
      ],
      tint: 'rgba(160, 180, 200, 0.06)',
      grey: true
    }
  };

  var SIZES = {
    '1080x1080': { w: 1080, h: 1080, label: 'Square' },
    '1080x1350': { w: 1080, h: 1350, label: 'Portrait' },
    '1920x1080': { w: 1920, h: 1080, label: 'Wide' }
  };

  // The two sample photos shipped under app/samples/. They were made for
  // make.fun and are free to use; the app loads them only when asked.
  var SAMPLES = {
    boulevard: { file: 'samples/boulevard.jpg', label: 'Boulevard' },
    pier: { file: 'samples/pier.jpg', label: 'Pier' }
  };

  global.ViceDuskPresets = { LAYOUTS: LAYOUTS, GRADES: GRADES, SIZES: SIZES, SAMPLES: SAMPLES };
})(window);
