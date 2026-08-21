'use strict';
/* ============================================================
   Emberfall - 02_tileset.js : procedural tile art (floors, walls,
   doors, stairs, chests, water). All prerendered once per theme.
   ============================================================ */
var TS = (function () {

  var TW = CFG.TILE_W, TH = CFG.TILE_H, WH = CFG.WALL_H, DH = CFG.DOOR_H;

  /* ---------- color helpers ---------- */
  function hexRgb(h) {
    var v = parseInt(h.slice(1), 16);
    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
  }
  function shade(h, f) {
    var c = hexRgb(h);
    var r = Util.clamp(Math.round(c.r * f), 0, 255);
    var g = Util.clamp(Math.round(c.g * f), 0, 255);
    var b = Util.clamp(Math.round(c.b * f), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function rgba(h, a) {
    var c = hexRgb(h);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  function diamondPath(ctx, cx, cy, w, h) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.lineTo(cx, cy + h / 2);
    ctx.lineTo(cx - w / 2, cy);
    ctx.closePath();
  }
  function insideDiamond(px, py, cx, cy, w, h) {
    return Math.abs(px - cx) / (w / 2) + Math.abs(py - cy) / (h / 2) <= 1;
  }

  /* ---------- mosaic stone floor ---------- */
  function makeFloor(theme) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('floor-' + theme));
    var out = [];
    for (var v = 0; v < 12; v++) {
      var c = Util.makeCanvas(TW, TH);
      var g = c.getContext('2d');
      var cx = TW / 2, cy = TH / 2;
      var base = pal.floor[rng.range(0, pal.floor.length - 1)];
      var bright = rng.jitter(1, 0.05);
      // base stone
      diamondPath(g, cx, cy, TW, TH);
      g.fillStyle = shade(base, bright);
      g.fill();
      // broad tonal patches (soft, low alpha)
      var patches = rng.range(2, 4);
      for (var p = 0; p < patches; p++) {
        var px = cx + (rng.next() * 2 - 1) * TW * 0.3;
        var py = cy + (rng.next() * 2 - 1) * TH * 0.3;
        var pr = TW * (0.2 + rng.next() * 0.35);
        var grd = g.createRadialGradient(px, py, 1, px, py, pr);
        var lf = rng.jitter(1, 0.14);
        grd.addColorStop(0, shade(base, bright * lf * 0.96).replace('rgb', 'rgba').replace(')', ',0.5)'));
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        diamondPath(g, cx, cy, TW, TH);
        g.fill();
      }
      // irregular polygonal facets
      var plain = rng.chance(0.45);
      if (!plain) {
        var facets = rng.range(3, 9);
        for (var f = 0; f < facets; f++) {
          var fx = cx + (rng.next() * 2 - 1) * TW * 0.24;
          var fy = cy + (rng.next() * 2 - 1) * TH * 0.24;
          var n = rng.range(4, 7);
          var pts = [];
          var ang0 = rng.next() * Math.PI * 2;
          var rbase = TW * (0.14 + rng.next() * 0.2);
          for (var k = 0; k < n; k++) {
            var ang = ang0 + (k / n) * Math.PI * 2 + rng.jitter(0, 0.5);
            var rr = rbase * (0.55 + rng.next() * 0.7);
            pts.push({ x: fx + Math.cos(ang) * rr, y: fy + Math.sin(ang) * rr * 0.5 });
          }
          // clamp into diamond
          var gx = 0, gy = 0, inside = 0;
          for (var m = 0; m < pts.length; m++) {
            if (insideDiamond(pts[m].x, pts[m].y, cx, cy, TW, TH)) inside++;
          }
          if (inside < n - 1) {
            for (var m2 = 0; m2 < pts.length; m2++) {
              var iter = 0;
              while (!insideDiamond(pts[m2].x, pts[m2].y, cx, cy, TW - 2, TH - 2) && iter++ < 12) {
                pts[m2].x = cx + (pts[m2].x - cx) * 0.72;
                pts[m2].y = cy + (pts[m2].y - cy) * 0.72;
              }
            }
          }
          var ff = rng.jitter(1, 0.12);
          var col = shade(base, bright * ff);
          g.fillStyle = col;
          g.globalAlpha = 0.55 + rng.next() * 0.25;
          g.beginPath();
          g.moveTo(pts[0].x, pts[0].y);
          for (var q = 1; q < pts.length; q++) g.lineTo(pts[q].x, pts[q].y);
          g.closePath();
          g.fill();
          // occasional multi-facet stone (a second attached poly)
          if (rng.chance(0.28)) {
            var sp = pts[rng.range(0, pts.length - 1)];
            g.beginPath();
            g.moveTo(sp.x, sp.y);
            for (var q2 = 1; q2 < 4; q2++) {
              var aa = ang0 + q2 * 1.1 + rng.jitter(0, 0.4);
              var rr2 = rbase * 0.7;
              g.lineTo(sp.x + Math.cos(aa) * rr2, sp.y + Math.sin(aa) * rr2 * 0.5);
            }
            g.closePath();
            g.fill();
          }
          g.globalAlpha = 1;
        }
      }
      // speckles
      g.fillStyle = 'rgba(0,0,0,0.09)';
      for (var s = 0; s < 26; s++) {
        var sx2 = cx + (rng.next() * 2 - 1) * TW * 0.44;
        var sy2 = cy + (rng.next() * 2 - 1) * TH * 0.44;
        if (!insideDiamond(sx2, sy2, cx, cy, TW - 3, TH - 3)) continue;
        g.fillRect(sx2, sy2, 1, 1);
      }
      g.fillStyle = 'rgba(255,255,255,0.05)';
      for (var s2 = 0; s2 < 14; s2++) {
        var sx3 = cx + (rng.next() * 2 - 1) * TW * 0.44;
        var sy3 = cy + (rng.next() * 2 - 1) * TH * 0.44;
        if (!insideDiamond(sx3, sy3, cx, cy, TW - 3, TH - 3)) continue;
        g.fillRect(sx3, sy3, 1, 1);
      }
      // grout + edge shading
      diamondPath(g, cx, cy, TW - 1, TH - 1);
      g.strokeStyle = pal.floorGrout;
      g.lineWidth = 1.6;
      g.stroke();
      // bevel: lit top edges, dark bottom edges
      g.strokeStyle = 'rgba(255,255,255,0.10)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx - 0.5, cy - TH / 2 + 1);
      g.lineTo(cx + TW / 2 - 1.5, cy - 0.5);
      g.moveTo(cx - TW / 2 + 1.5, cy - 0.5);
      g.lineTo(cx - 0.5, cy + TH / 2 - 1);
      g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.30)';
      g.beginPath();
      g.moveTo(cx - 0.5, cy + TH / 2 - 1);
      g.lineTo(cx + TW / 2 - 1.5, cy - 0.5);
      g.stroke();
      out.push(c);
    }
    return out;
  }

  function makeWallTop(theme) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('wtop-' + theme));
    var out = [];
    for (var v = 0; v < 4; v++) {
      var c = Util.makeCanvas(TW, TH);
      var g = c.getContext('2d');
      var cx = TW / 2, cy = TH / 2;
      var base = pal.wallTop;
      diamondPath(g, cx, cy, TW, TH);
      g.fillStyle = shade(base, rng.jitter(1, 0.06));
      g.fill();
      diamondPath(g, cx, cy, TW - 1, TH - 1);
      g.strokeStyle = 'rgba(0,0,0,0.35)';
      g.lineWidth = 1.5;
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.10)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx - 0.5, cy - TH / 2 + 1);
      g.lineTo(cx + TW / 2 - 1.5, cy - 0.5);
      g.stroke();
      out.push(c);
    }
    return out;
  }

  /* wall face: canvas (TW/2+2) x (WH+TH/2+2); skew = +0.5 for SW, -0.5 for SE */
  function makeWallFace(theme, skew, light) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('face-' + theme + '-' + skew));
    var w = TW / 2 + 2, h = WH + TH / 2 + 2;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var lf = light ? 1.06 : 0.72;
    // fill the parallelogram area
    var edgeY = skew > 0 ? 0 : TH / 2;
    g.beginPath();
    g.moveTo(0, edgeY);
    g.lineTo(0, edgeY + WH);
    g.lineTo(TW / 2, WH + TH / 2 - edgeY);
    g.lineTo(TW / 2, TH / 2 - edgeY);
    g.closePath();
    g.fillStyle = shade(pal.wall[1], lf);
    g.fill();
    // stone rows
    var rowH = 7 + rng.range(0, 2);
    var mortar = pal.wallMortar;
    var yTop = edgeY + WH + TH / 2 - 4;
    var row = 0;
    while (yTop > edgeY - 6) {
      var yB = yTop - rowH;
      var offset = (row % 2) * (TW / 8);
      var x = -TW / 8 + offset;
      while (x < TW / 2 + TW / 8) {
        var wdt = TW / 4 + rng.range(-4, 6);
        var st = shade(pal.wall[rng.range(0, pal.wall.length - 1)], lf * rng.jitter(1, 0.07));
        g.fillStyle = st;
        quadRow(g, x, x + wdt, yB, yTop, skew);
        g.strokeStyle = mortar;
        g.lineWidth = 1;
        quadRowStroke(g, x, x + wdt, yB, yTop, skew);
        x += wdt + 1.5;
      }
      yTop = yB - 1.5;
      row++;
    }
    // top rim highlight, bottom shadow
    g.beginPath();
    g.moveTo(0, edgeY + WH);
    g.lineTo(TW / 2, WH + TH / 2 - edgeY);
    g.strokeStyle = 'rgba(0,0,0,0.5)';
    g.lineWidth = 2.5;
    g.stroke();
    g.beginPath();
    g.moveTo(0, edgeY);
    g.lineTo(TW / 2, TH / 2 - edgeY);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1.5;
    g.stroke();
    // vertical-ish shading gradient toward the corner
    var grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, 'rgba(0,0,0,0.22)');
    grd.addColorStop(0.5, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(255,255,255,' + (light ? '0.05' : '0.02') + ')');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(0, edgeY);
    g.lineTo(0, edgeY + WH);
    g.lineTo(TW / 2, WH + TH / 2 - edgeY);
    g.lineTo(TW / 2, TH / 2 - edgeY);
    g.closePath();
    g.fill();
    return c;
  }
  function quadRow(g, x0, x1, y0, y1, skew) {
    g.beginPath();
    g.moveTo(x0, y0 + x0 * skew);
    g.lineTo(x1, y0 + x1 * skew);
    g.lineTo(x1, y1 + x1 * skew);
    g.lineTo(x0, y1 + x0 * skew);
    g.closePath();
    g.fill();
  }
  function quadRowStroke(g, x0, x1, y0, y1, skew) {
    g.beginPath();
    g.moveTo(x0, y0 + x0 * skew);
    g.lineTo(x1, y0 + x1 * skew);
    g.lineTo(x1, y1 + x1 * skew);
    g.lineTo(x0, y1 + x0 * skew);
    g.closePath();
    g.stroke();
  }

  /* ---------- doors ---------- */
  function drawDoorFrame(g, w, h, pal) {
    // stone jambs + lintel
    g.fillStyle = shade(pal.wall[1], 1.0);
    g.fillRect(0, 0, w, 8);
    g.fillRect(0, 0, 6, h);
    g.fillRect(w - 6, 0, 6, h);
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
  }
  function woodPlanks(g, x, y, w, h, rng, dark) {
    var n = Math.max(2, Math.round(w / 9));
    for (var i = 0; i < n; i++) {
      var px = x + i * (w / n);
      var wd = w / n + 0.5;
      var b = rng.jitter(1, 0.06);
      g.fillStyle = shade(dark ? '#3b2c1c' : '#4a3826', b);
      g.fillRect(px, y, wd, h);
      g.strokeStyle = 'rgba(0,0,0,0.45)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(px + 0.5, y);
      g.lineTo(px + 0.5, y + h);
      g.stroke();
      // wood grain
      g.strokeStyle = 'rgba(0,0,0,0.18)';
      g.beginPath();
      g.moveTo(px + wd * 0.3, y + 4);
      g.quadraticCurveTo(px + wd * 0.5, y + h * 0.5, px + wd * 0.4, y + h - 4);
      g.stroke();
    }
  }
  function ironBands(g, x, y, w, h, rng) {
    for (var i = 0; i < 2; i++) {
      var by = y + (i + 1) * h / 3;
      g.fillStyle = '#2e3138';
      g.fillRect(x, by - 2, w, 4);
      g.fillStyle = '#6f7683';
      g.fillRect(x, by - 2, w, 1);
      g.fillStyle = '#8d95a4';
      for (var r = 0; r < 4; r++) {
        var rx = x + 5 + r * (w - 10) / 3.5;
        g.fillRect(rx, by - 1.5, 2.5, 3);
      }
    }
  }
  function doorRing(g, x, y) {
    g.strokeStyle = '#a49a7f';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, 3.4, 0.3, Math.PI * 1.6);
    g.stroke();
  }

  function makeDoor(theme, exterior, double) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('door-' + theme + (exterior ? '-x' : '') + (double ? '-d' : '')));
    var w = TW + 2, h = DH;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    drawDoorFrame(g, w, h, pal);
    if (double) {
      woodPlanks(g, 6, 8, w / 2 - 8, h - 8, rng, false);
      woodPlanks(g, w / 2 + 1, 8, w / 2 - 7, h - 8, rng, false);
      ironBands(g, 6, 8, w / 2 - 8, h - 8, rng);
      ironBands(g, w / 2 + 1, 8, w / 2 - 7, h - 8, rng);
      doorRing(g, w / 2 - 9, h * 0.45);
      doorRing(g, w / 2 + 10, h * 0.45);
    } else {
      woodPlanks(g, 7, 8, w - 14, h - 8, rng, false);
      ironBands(g, 7, 8, w - 14, h - 8, rng);
      doorRing(g, w - 20, h * 0.45);
    }
    if (exterior) {
      // warm light leaking around the door
      g.globalCompositeOperation = 'lighter';
      var grd = g.createRadialGradient(w / 2, h * 0.3, 2, w / 2, h * 0.3, w * 0.7);
      grd.addColorStop(0, 'rgba(255,214,140,0.20)');
      grd.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    }
    return c;
  }

  function makeDoorOpen(theme, exterior, double, hollow) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('dooropen-' + theme + (exterior ? '-x' : '') + (double ? '-d' : '') + (hollow ? '-h' : '')));
    var w = TW + 2, h = DH;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    // dark interior of the opening
    if (!hollow) {
      g.fillStyle = '#0c0c10';
      g.fillRect(6, 6, w - 12, h - 6);
    }
    if (exterior) {
      var grd = g.createRadialGradient(w / 2, h * 0.6, 4, w / 2, h * 0.6, w * 0.65);
      grd.addColorStop(0, 'rgba(255,222,150,0.85)');
      grd.addColorStop(0.5, 'rgba(220,180,110,0.30)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(4, 2, w - 8, h);
    } else {
      if (!hollow) {
        var grd2 = g.createRadialGradient(w / 2, h * 0.6, 4, w / 2, h * 0.6, w * 0.55);
        grd2.addColorStop(0, 'rgba(40,44,60,0.6)');
        grd2.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd2;
        g.fillRect(4, 2, w - 8, h);
      }
    }
    drawDoorFrame(g, w, h, pal);
    // leaves swung inward against the frame
    function leaf(lx, lw, mirror) {
      var lg = g;
      lg.save();
      lg.translate(lx, h);
      lg.transform(1, 0, (mirror ? -0.34 : 0.34), 1, 0, 0);
      lg.translate(-lx, -h);
      woodPlanks(lg, lx, 8, lw, h - 8, rng, true);
      ironBands(lg, lx, 8, lw, h - 8, rng);
      lg.restore();
    }
    if (double) {
      leaf(4, w / 2 - 9, false);
      leaf(w / 2 + 4, w / 2 - 9, true);
    } else {
      leaf(3, w / 2 - 6, false);
    }
    return c;
  }

  /* ---------- stairs ---------- */
  function makeStairs(theme, dirDown) {
    var pal = CFG.PALETTES[theme];
    var rng = new Util.RNG(Util.hashStr('stair-' + theme + '-' + dirDown));
    var w = TW + 2, h = DH + 6;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    drawDoorFrame(g, w, h + 6, pal);
    // dark void
    g.fillStyle = '#08080c';
    g.fillRect(6, 6, w - 12, h);
    if (dirDown) {
      // descending: treads visible, stacked up and away
      var steps = 4;
      var treadH = 11;
      var y = h - 4;
      for (var i = 0; i < steps; i++) {
        var x0 = 6 + i * 5, x1 = w - 6 - i * 5;
        var top = y - treadH;
        var f = 1 - i * 0.16;
        g.fillStyle = shade('#4b4d57', f * (i % 2 ? 1.04 : 0.96));
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x1, y);
        g.lineTo(x1, top);
        g.lineTo(x0, top);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.5)';
        g.lineWidth = 1;
        g.stroke();
        y = top;
      }
      // faint glow above the descent
      var grd = g.createRadialGradient(w / 2, y - 6, 2, w / 2, y - 6, w * 0.5);
      grd.addColorStop(0, 'rgba(90,100,140,0.25)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(4, 0, w - 8, h);
    } else {
      // ascending: risers visible, light from above
      var steps2 = 4;
      var risH = 12;
      var y2 = h - 4;
      for (var i2 = 0; i2 < steps2; i2++) {
        var x0b = 6 + i2 * 5, x1b = w - 6 - i2 * 5;
        var top2 = y2 - risH;
        var f2 = 0.55 + i2 * 0.14;
        g.fillStyle = shade('#575a66', f2);
        g.beginPath();
        g.moveTo(x0b, y2);
        g.lineTo(x1b, y2);
        g.lineTo(x1b, top2);
        g.lineTo(x0b, top2);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.4)';
        g.stroke();
        y2 = top2;
      }
      var grd2 = g.createRadialGradient(w / 2, y2 - 8, 2, w / 2, y2 - 8, w * 0.55);
      grd2.addColorStop(0, 'rgba(255,232,170,0.5)');
      grd2.addColorStop(0.6, 'rgba(200,170,110,0.18)');
      grd2.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd2;
      g.fillRect(4, 0, w - 8, h);
    }
    return c;
  }

  /* ---------- cave / gate ---------- */
  function makeCave() {
    var rng = new Util.RNG(1234);
    var w = TW + 2, h = DH + 2;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    g.fillStyle = '#05060a';
    g.fillRect(6, 4, w - 12, h - 4);
    // rocky irregular arch
    g.fillStyle = '#3d3f3a';
    var pts = [];
    for (var i = 0; i <= 20; i++) {
      var t = i / 20;
      var ang = Math.PI * (1 - t);
      var rr = w * 0.52 * (1 + 0.22 * Math.sin(t * Math.PI * 4 + 1));
      pts.push({ x: w / 2 + Math.cos(ang) * rr, y: h - 4 - Math.sin(ang) * h * 1.1 });
    }
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h - 30);
    for (var p = 0; p < pts.length; p++) g.lineTo(pts[p].x, pts[p].y);
    g.lineTo(w, h - 30);
    g.lineTo(w, h);
    g.closePath();
    g.fill();
    g.fillStyle = '#2c2e2b';
    g.beginPath();
    g.moveTo(3, h);
    g.lineTo(3, h - 26);
    for (var p2 = 0; p2 < pts.length; p2++) g.lineTo(pts[p2].x, pts[p2].y);
    g.lineTo(w - 3, h - 26);
    g.lineTo(w - 3, h);
    g.closePath();
    g.fill();
    // inner shadow at mouth
    var grd = g.createRadialGradient(w / 2, h * 0.55, 4, w / 2, h * 0.55, w * 0.55);
    grd.addColorStop(0, 'rgba(0,0,0,0.9)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    return c;
  }

  function makeGate(open) {
    var rng = new Util.RNG(777);
    var w = TW + 2, h = DH + 8;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    // stone arch
    g.fillStyle = '#57503f';
    g.fillRect(0, 0, w, 10);
    g.fillRect(0, 0, 7, h);
    g.fillRect(w - 7, 0, 7, h);
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
    if (!open) {
      // lowered portcullis bars
      g.fillStyle = '#2a2c31';
      g.fillRect(7, 10, w - 14, h - 10);
      g.fillStyle = '#575b64';
      for (var x = 12; x < w - 8; x += 8) g.fillRect(x, 8, 3.5, h - 8);
      for (var y = 16; y < h; y += 9) g.fillRect(7, y, w - 14, 3);
      g.strokeStyle = '#8d95a4';
      g.lineWidth = 1;
      g.strokeRect(7.5, 10.5, w - 16, h - 21);
    } else {
      g.fillStyle = '#1b1d22';
      g.fillRect(7, 10, w - 14, h - 10);
      // raised bars at top
      g.fillStyle = '#575b64';
      for (var x2 = 12; x2 < w - 8; x2 += 8) g.fillRect(x2, 6, 3.5, 14);
      for (var y2 = 8; y2 < 22; y2 += 7) g.fillRect(7, y2, w - 14, 2.5);
    }
    return c;
  }

  /* ---------- chest ---------- */
  function makeChest(open) {
    var rng = new Util.RNG(555);
    var c = Util.makeCanvas(TW, TH + 26);
    var g = c.getContext('2d');
    var cx = TW / 2, cy = TH + 12;
    var bw = 40, bh = 16, bd = 26;
    function box(wx, wy, wdt, hgt, col) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(wx, wy);
      g.lineTo(wx + wdt, wy);
      g.lineTo(wx + wdt + bd / 2, wy + hgt / 2);
      g.lineTo(wx + wdt, wy + hgt);
      g.lineTo(wx, wy + hgt);
      g.lineTo(wx - bd / 2, wy + hgt / 2);
      g.closePath();
      g.fill();
    }
    if (!open) {
      box(cx - bw / 2, cy - bh / 2, bw, bh, '#5a4630');
      // lid
      box(cx - bw / 2 - 2, cy - bh / 2 - 8, bw + 4, 9, '#6b5438');
      g.strokeStyle = '#2e2620';
      g.stroke();
      g.fillStyle = '#7d8591';
      g.fillRect(cx - 3, cy - bh / 2 - 1, 6, 5);
      // straps
      g.fillStyle = '#3a3732';
      g.fillRect(cx - bw / 2 + 3, cy - 4, bw - 6, 3);
    } else {
      box(cx - bw / 2, cy - bh / 2, bw, bh, '#4a3a28');
      // lid open, tilted back
      g.save();
      g.translate(cx, cy - bh / 2 - 6);
      g.rotate(-0.5);
      box(-bw / 2 - 2, -4, bw + 4, 9, '#6b5438');
      g.restore();
      // dark interior + glint
      box(cx - bw / 2 + 5, cy - bh / 2 - 2, bw - 10, 4, '#0e0d0a');
      g.fillStyle = '#ffd977';
      for (var i = 0; i < 5; i++) {
        g.fillRect(cx - 14 + i * 7, cy - bh / 2 - 3, 2, 2);
      }
    }
    return c;
  }

  /* ---------- water ---------- */
  function makeWater() {
    var frames = [];
    for (var f = 0; f < 2; f++) {
      var c = Util.makeCanvas(TW, TH);
      var g = c.getContext('2d');
      var cx = TW / 2, cy = TH / 2;
      diamondPath(g, cx, cy, TW, TH);
      var grd = g.createLinearGradient(cx, cy - TH / 2, cx, cy + TH / 2);
      grd.addColorStop(0, '#26394a');
      grd.addColorStop(0.5, '#1d2e3d');
      grd.addColorStop(1, '#223547');
      g.fillStyle = grd;
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.4)';
      g.lineWidth = 1.5;
      diamondPath(g, cx, cy, TW - 2, TH - 2);
      g.stroke();
      // ripples
      g.strokeStyle = 'rgba(160,200,220,0.25)';
      g.lineWidth = 1;
      for (var i = 0; i < 4; i++) {
        var rx = cx + ((i * 37 + f * 19) % 24) - 12;
        var ry = cy + ((i * 23 + f * 13) % 10) - 5;
        g.beginPath();
        g.arc(rx, ry, 4 + (i % 2) * 3, 0.3, Math.PI * 1.4);
        g.stroke();
      }
      frames.push(c);
    }
    return frames;
  }

  /* ---------- cache ---------- */
  var cache = {};
  function get(theme) {
    if (cache[theme]) return cache[theme];
    var t = {
      floor: makeFloor(theme),
      wallTop: makeWallTop(theme),
      faceSW: makeWallFace(theme, 0.5, true),
      faceSE: makeWallFace(theme, -0.5, false),
      water: makeWater(),
      door: makeDoor(theme, false, false),
      doorOpen: makeDoorOpen(theme, false, false),
      doorX: makeDoor(theme, true, false),
      doorXOpen: makeDoorOpen(theme, true, false),
      double: makeDoor(theme, false, true),
      doubleOpen: makeDoorOpen(theme, false, true),
      doubleX: makeDoor(theme, true, true),
      doubleXOpen: makeDoorOpen(theme, true, true),
      stairDown: makeStairs(theme, true),
      stairUp: makeStairs(theme, false),
      doorOpenH: makeDoorOpen(theme, false, false, true),
      doubleOpenH: makeDoorOpen(theme, false, true, true),
      cave: makeCave(),
      gateClosed: makeGate(false),
      gateOpen: makeGate(true),
      chestClosed: makeChest(false),
      chestOpen: makeChest(true)
    };
    cache[theme] = t;
    return t;
  }

  return { get: get, shade: shade, rgba: rgba, hexRgb: hexRgb };
})();
