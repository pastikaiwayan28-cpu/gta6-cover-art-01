/* Vice Dusk Cover Studio — studio wiring.
   Owns the editor state, loads photos, wires every control, and exports
   the PNG. The drawing itself lives in painter.js. */
(function (global) {
  'use strict';

  var presets = global.ViceDuskPresets;
  var painter = global.CoverPainter;

  var state = {
    layout: 'marquee',
    grade: 'dusk',
    gradeStrength: 70,
    title: 'NEON SUNSET',
    subtitle: 'CHASE THE LAST LIGHT',
    titleSize: 96,
    captionPlace: 'bottom',
    captionColour: '#ffffff',
    sizeKey: '1920x1080'
  };

  // One entry per panel slot. source is a key into `photos`, or 'none'.
  var slots = {
    A: { source: 'sample-boulevard', zoom: 1.15, ox: 0, oy: 0 },
    B: { source: 'sample-pier', zoom: 1.1, ox: 0, oy: 0 },
    C: { source: 'sample-boulevard', zoom: 1.1, ox: 0, oy: 0 }
  };

  // Loaded images by source key. Upload slots start empty.
  var photos = {
    'sample-boulevard': null,
    'sample-pier': null,
    'upload-A': null,
    'upload-B': null,
    'upload-C': null
  };

  var canvas;
  var statusLine;

  function $(id) { return document.getElementById(id); }

  function slotOptions() {
    return [
      ['none', 'Empty panel'],
      ['sample-boulevard', 'Sample: Boulevard'],
      ['sample-pier', 'Sample: Pier'],
      ['upload-A', 'Upload A'],
      ['upload-B', 'Upload B'],
      ['upload-C', 'Upload C']
    ];
  }

  function fillSlotSelects() {
    var letters = ['A', 'B', 'C'];
    var i;
    for (i = 0; i < letters.length; i++) {
      var letter = letters[i];
      var select = $('slot' + letter);
      var options = slotOptions();
      var j;
      for (j = 0; j < options.length; j++) {
        var opt = document.createElement('option');
        opt.value = options[j][0];
        opt.textContent = options[j][1];
        if (options[j][0] === slots[letter].source) opt.selected = true;
        select.appendChild(opt);
      }
    }
  }

  function refresh() {
    if (!canvas) return;
    var layout = presets.LAYOUTS[state.layout] || presets.LAYOUTS.marquee;
    var panels = [];
    var i;
    for (i = 0; i < layout.panels.length; i++) {
      var slot = slots[layout.panels[i].slot];
      var img = slot.source === 'none' ? null : photos[slot.source];
      panels.push({ img: img || null, zoom: slot.zoom, ox: slot.ox, oy: slot.oy });
    }
    painter.render(canvas, state, panels);
    var size = presets.SIZES[state.sizeKey];
    if (statusLine) {
      statusLine.textContent = 'Ready — ' + size.w + ' × ' + size.h + ' · ' +
        layout.label + ' · ' + presets.GRADES[state.grade].label + '. Photos stay on your machine.';
    }
  }

  function loadImage(key, src, done) {
    var img = new Image();
    img.onload = function () {
      photos[key] = img;
      refresh();
      if (done) done(true);
    };
    img.onerror = function () {
      if (done) done(false);
    };
    img.src = src;
  }

  function loadSamples() {
    loadImage('sample-boulevard', 'samples/boulevard.jpg');
    loadImage('sample-pier', 'samples/pier.jpg');
  }

  function wireUpload(inputId, letter) {
    var input = $(inputId);
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          photos['upload-' + letter] = img;
          slots[letter].source = 'upload-' + letter;
          $('slot' + letter).value = 'upload-' + letter;
          refresh();
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function wireSlot(letter) {
    var prefix = letter;
    $('slot' + letter).addEventListener('change', function (e) {
      slots[letter].source = e.target.value;
      refresh();
    });
    $('zoom' + prefix).addEventListener('input', function (e) {
      slots[letter].zoom = parseFloat(e.target.value);
      refresh();
    });
    $('offX' + prefix).addEventListener('input', function (e) {
      slots[letter].ox = parseInt(e.target.value, 10);
      refresh();
    });
    $('offY' + prefix).addEventListener('input', function (e) {
      slots[letter].oy = parseInt(e.target.value, 10);
      refresh();
    });
  }

  function exportPng() {
    refresh();
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'vice-dusk-cover-' + state.sizeKey + '.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      if (statusLine) statusLine.textContent = 'PNG exported — ' + state.sizeKey + '. Check your downloads.';
    }, 'image/png');
  }

  // Cover-only mode for clean screenshots: ?view=cover&layout=columns&
  // grade=neon&size=1080x1350&title=NEON%20SUNSET
  function applyViewParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('view') !== 'cover') return;
    document.body.classList.add('cover-only');
    var layout = params.get('layout');
    if (layout && presets.LAYOUTS[layout]) state.layout = layout;
    var grade = params.get('grade');
    if (grade && presets.GRADES[grade]) state.grade = grade;
    var size = params.get('size');
    if (size && presets.SIZES[size]) state.sizeKey = size;
    var title = params.get('title');
    if (title !== null) state.title = title;
    var subtitle = params.get('subtitle');
    if (subtitle !== null) state.subtitle = subtitle;
  }

  function init() {
    canvas = $('stage');
    statusLine = $('statusLine');
    applyViewParams();
    fillSlotSelects();

    $('layoutPick').addEventListener('change', function (e) {
      state.layout = e.target.value;
      refresh();
    });
    $('exportSize').addEventListener('change', function (e) {
      state.sizeKey = e.target.value;
      refresh();
    });
    $('gradeRow').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-grade]');
      if (!btn) return;
      state.grade = btn.getAttribute('data-grade');
      var all = document.querySelectorAll('.grade-btn');
      var i;
      for (i = 0; i < all.length; i++) all[i].classList.remove('active');
      btn.classList.add('active');
      refresh();
    });
    $('gradeStrength').addEventListener('input', function (e) {
      state.gradeStrength = parseInt(e.target.value, 10);
      refresh();
    });
    $('titleText').addEventListener('input', function (e) {
      state.title = e.target.value;
      refresh();
    });
    $('subtitleText').addEventListener('input', function (e) {
      state.subtitle = e.target.value;
      refresh();
    });
    $('titleSize').addEventListener('input', function (e) {
      state.titleSize = parseInt(e.target.value, 10);
      refresh();
    });
    $('captionPlace').addEventListener('change', function (e) {
      state.captionPlace = e.target.value;
      refresh();
    });
    $('captionColour').addEventListener('change', function (e) {
      state.captionColour = e.target.value;
      refresh();
    });
    $('downloadBtn').addEventListener('click', exportPng);

    wireUpload('uploadA', 'A');
    wireUpload('uploadB', 'B');
    wireUpload('uploadC', 'C');
    wireSlot('A');
    wireSlot('B');
    wireSlot('C');

    $('sampleBoulevard').addEventListener('click', function () {
      loadImage('sample-boulevard', 'samples/boulevard.jpg', function () {
        slots.A.source = 'sample-boulevard';
        $('slotA').value = 'sample-boulevard';
        refresh();
      });
    });
    $('samplePier').addEventListener('click', function () {
      loadImage('sample-pier', 'samples/pier.jpg', function () {
        slots.B.source = 'sample-pier';
        $('slotB').value = 'sample-pier';
        refresh();
      });
    });
    $('clearPhotos').addEventListener('click', function () {
      photos['upload-A'] = null;
      photos['upload-B'] = null;
      photos['upload-C'] = null;
      var letters = ['A', 'B', 'C'];
      var i;
      for (i = 0; i < letters.length; i++) {
        if (slots[letters[i]].source.indexOf('upload-') === 0) {
          slots[letters[i]].source = 'sample-boulevard';
          $('slot' + letters[i]).value = 'sample-boulevard';
        }
      }
      refresh();
    });

    // Keep the controls in sync with any view params the URL set.
    $('layoutPick').value = state.layout;
    $('exportSize').value = state.sizeKey;
    $('titleText').value = state.title;
    $('subtitleText').value = state.subtitle;
    $('captionPlace').value = state.captionPlace;
    $('captionColour').value = state.captionColour;

    loadSamples();
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposed for the cover screenshot mode and for quick manual checks.
  global.ViceDuskStudio = { refresh: refresh, exportPng: exportPng, state: state };
})(window);
