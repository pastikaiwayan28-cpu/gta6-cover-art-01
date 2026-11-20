/* Vice Dusk Cover Studio — painter.
   Draws the whole cover onto a canvas from the editor state. No network,
   no libraries: plain Canvas 2D. */
(function (global) {
  'use strict';

  var HEAVY_FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
  var BODY_FONT = '"Helvetica Neue", Arial, sans-serif';

  function clamp(value, low, high) {
    if (value < low) return low;
    if (value > high) return high;
    return value;
  }

  // Draw one photo into a rectangle, cover-fit, with zoom and shift.
  // zoom 1 fills the rect; ox/oy are -50..50 and shift up to a tenth of it.
  function drawPhoto(ctx, img, rect, zoom, ox, oy, grey) {
    var tw = rect.w;
    var th = rect.h;
    var scale = Math.max(tw / img.naturalWidth, th / img.naturalHeight) * zoom;
    var dw = img.naturalWidth * scale;
    var dh = img.naturalHeight * scale;
    var dx = rect.x + (tw - dw) / 2 + (ox / 50) * tw * 0.1;
    var dy = rect.y + (th - dh) / 2 + (oy / 50) * th * 0.1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, tw, th);
    ctx.clip();
    if (grey) ctx.filter = 'grayscale(1) contrast(1.12) brightness(1.04)';
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  // Paint the grade wash: a vertical gradient plus a flat tint, both
  // scaled by strength (0..100). Strength 0 leaves the photos untouched.
  function drawGrade(ctx, w, h, grade, strength) {
    var amount = clamp(strength, 0, 100) / 100;
    if (amount <= 0) return;
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    var i;
    for (i = 0; i < grade.stops.length; i++) {
      grad.addColorStop(grade.stops[i][0], grade.stops[i][1]);
    }
    ctx.save();
    ctx.globalAlpha = amount;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = grade.tint;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // A soft dark scrim behind the caption so white lettering always reads.
  function drawScrim(ctx, w, h, place) {
    var bandH = Math.round(h * 0.26);
    var y = place === 'top' ? 0 : h - bandH;
    var grad = place === 'top'
      ? ctx.createLinearGradient(0, 0, 0, bandH)
      : ctx.createLinearGradient(0, h - bandH, 0, h);
    if (place === 'top') {
      grad.addColorStop(0, 'rgba(10, 6, 14, 0.82)');
      grad.addColorStop(1, 'rgba(10, 6, 14, 0)');
    } else {
      grad.addColorStop(0, 'rgba(10, 6, 14, 0)');
      grad.addColorStop(1, 'rgba(10, 6, 14, 0.85)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, w, bandH);
    return { y: y, h: bandH };
  }

  function drawCaption(ctx, w, h, state, scale) {
    var title = (state.title || '').trim();
    var subtitle = (state.subtitle || '').trim();
    if (!title && !subtitle) return;
    var band = drawScrim(ctx, w, h, state.captionPlace);
    var pad = Math.round(48 * scale);
    var baseY = state.captionPlace === 'top'
      ? band.y + Math.round(30 * scale)
      : band.y + band.h - Math.round(28 * scale);

    // Stack, top to bottom: title, sunset rule, subtitle. The baselines
    // are spaced so the rule never crosses either line of text.
    var titlePx = Math.round(state.titleSize * scale);
    var titleY;
    var ruleY;
    var subY;
    if (state.captionPlace === 'top') {
      titleY = baseY + titlePx;
      ruleY = titleY + Math.round(16 * scale);
      subY = ruleY + Math.round(38 * scale);
    } else {
      subY = baseY;
      ruleY = baseY - Math.round(44 * scale);
      titleY = ruleY - Math.round(18 * scale);
    }

    ctx.save();
    ctx.textBaseline = 'alphabetic';
    if (title) {
      ctx.font = '900 ' + titlePx + 'px ' + HEAVY_FONT;
      ctx.fillStyle = state.captionColour;
      // A dark edge keeps the letters readable over bright photos.
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = Math.round(18 * scale);
      ctx.shadowOffsetY = Math.round(4 * scale);
      ctx.fillText(title.toUpperCase(), pad, titleY);
      // A sunset rule under the title.
      var rule = ctx.createLinearGradient(pad, 0, pad + Math.round(420 * scale), 0);
      rule.addColorStop(0, '#ff2e88');
      rule.addColorStop(0.55, '#ff9a3d');
      rule.addColorStop(1, '#ffd23d');
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = rule;
      ctx.fillRect(pad, ruleY, Math.round(420 * scale), Math.round(7 * scale));
    }
    if (subtitle) {
      var subSize = Math.round(30 * scale);
      ctx.font = '700 ' + subSize + 'px ' + BODY_FONT;
      ctx.fillStyle = state.captionColour;
      ctx.globalAlpha = 0.92;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = Math.round(12 * scale);
      ctx.shadowOffsetY = Math.round(3 * scale);
      ctx.fillText(subtitle.toUpperCase(), pad, subY);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // A small corner tag naming the studio, drawn in the corner opposite
  // the caption so it never collides with the title.
  function drawTag(ctx, w, h, place, scale) {
    var text = 'VICE DUSK';
    var size = Math.round(24 * scale);
    ctx.save();
    ctx.font = '800 ' + size + 'px ' + BODY_FONT;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'right';
    var x = w - Math.round(28 * scale);
    var y = place === 'top' ? h - Math.round(26 * scale) : Math.round(40 * scale);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // state: { layout, grade, gradeStrength, title, subtitle, titleSize,
  //   captionPlace, captionColour, sizeKey }
  // panels: [{ img, zoom, ox, oy }] — one per layout panel, img may be null.
  function render(canvas, state, panels) {
    var presets = global.ViceDuskPresets;
    var size = presets.SIZES[state.sizeKey] || presets.SIZES['1920x1080'];
    var layout = presets.LAYOUTS[state.layout] || presets.LAYOUTS.marquee;
    var grade = presets.GRADES[state.grade] || presets.GRADES.dusk;
    var w = size.w;
    var h = size.h;
    var scale = w / 1080;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Dark gutters show as thin seams between panels.
    ctx.fillStyle = '#0d0a10';
    ctx.fillRect(0, 0, w, h);
    var gutter = Math.max(4, Math.round(w * 0.004));

    var i;
    var rect;
    for (i = 0; i < layout.panels.length; i++) {
      var panel = layout.panels[i];
      rect = {
        x: Math.round(panel.x * w) + gutter,
        y: Math.round(panel.y * h) + gutter,
        w: Math.round(panel.w * w) - gutter * 2,
        h: Math.round(panel.h * h) - gutter * 2
      };
      var shot = panels[i];
      if (shot && shot.img) {
        drawPhoto(ctx, shot.img, rect, shot.zoom, shot.ox, shot.oy, grade.grey);
      } else {
        // Empty panel: a dusk gradient placeholder with its slot letter.
        var empty = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
        empty.addColorStop(0, '#3a1c46');
        empty.addColorStop(1, '#120d16');
        ctx.fillStyle = empty;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '900 ' + Math.round(90 * scale) + 'px ' + HEAVY_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(panel.slot, rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }
    }

    drawGrade(ctx, w, h, grade, state.gradeStrength);
    drawCaption(ctx, w, h, state, scale);
    drawTag(ctx, w, h, state.captionPlace, scale);
    return true;
  }

  global.CoverPainter = { render: render };
})(window);
