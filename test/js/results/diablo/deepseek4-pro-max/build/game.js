/* Emberfall — generated bundle */
'use strict';
/* ============================================================
   Emberfall - 00_util.js : math, RNG, canvas helpers
   ============================================================ */
var Util = (function () {

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }

  /* Deterministic PRNG (mulberry32) */
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStr(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function RNG(seed) {
    this._f = mulberry32(seed);
  }
  RNG.prototype.next = function () { return this._f(); };
  RNG.prototype.range = function (a, b) { return a + Math.floor(this._f() * (b - a + 1)); };
  RNG.prototype.chance = function (p) { return this._f() < p; };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this._f() * arr.length)]; };
  RNG.prototype.jitter = function (v, amt) { return v + (this._f() * 2 - 1) * amt; };

  function shuffle(arr, rng) {
    var r = rng ? (typeof rng === 'function' ? rng : rng.next.bind(rng)) : Math.random;
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---- canvas helpers ---- */
  var _canvasFactory = null; // tests may override
  function setCanvasFactory(f) { _canvasFactory = f; }

  function makeCanvas(w, h) {
    var c;
    if (_canvasFactory) c = _canvasFactory(w, h);
    else c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  /* ---- base64 helpers for byte arrays (explored masks) ---- */
  function b64FromBytes(bytes) {
    if (typeof btoa === 'function') {
      var s = '';
      var CH = 0x8000;
      for (var i = 0; i < bytes.length; i += CH) {
        s += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(bytes.length, i + CH)));
      }
      return btoa(s);
    }
    // fallback
    var out = [];
    for (var j = 0; j < bytes.length; j++) out.push(bytes[j]);
    return out.join(',');
  }

  function bytesFromB64(str) {
    if (typeof atob === 'function') {
      if (str.indexOf(',') >= 0 && str.indexOf('A') < 0) {
        var parts = str.split(',');
        var a = new Uint8Array(parts.length);
        for (var i = 0; i < parts.length; i++) a[i] = +parts[i];
        return a;
      }
      var s = atob(str);
      var b = new Uint8Array(s.length);
      for (var j = 0; j < s.length; j++) b[j] = s.charCodeAt(j);
      return b;
    }
    var ps = str.split(',');
    var c = new Uint8Array(ps.length);
    for (var k = 0; k < ps.length; k++) c[k] = +ps[k];
    return c;
  }

  function now() {
    return (typeof performance !== 'undefined') ? performance.now() : Date.now();
  }

  /* A* pathfinding over a walkable function; returns array of {x,y} or null */
  function findPath(w, h, blockedFn, sx, sy, tx, ty, maxNodes) {
    if (sx === tx && sy === ty) return [{ x: sx, y: sy }];
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return null;
    if (blockedFn(tx, ty)) return null;
    maxNodes = maxNodes || 4000;
    var size = w * h;
    var came = new Int32Array(size).fill(-1);
    var g = new Float32Array(size).fill(1e9);
    var f = new Float32Array(size).fill(1e9);
    var open = new Array(size); // binary heap of node indices
    var oi = 0;
    var idx = function (x, y) { return y * w + x; };
    var s = idx(sx, sy), t = idx(tx, ty);
    var heur = function (x, y) {
      var dx = Math.abs(x - tx), dy = Math.abs(y - ty);
      return (dx + dy) * 1.0 + (Math.abs(dx - dy)) * 0.1;
    };
    g[s] = 0; f[s] = heur(sx, sy);
    function push(n) { open[oi++] = n; var i = oi - 1; while (i > 0) { var p = (i - 1) >> 1; if (f[open[i]] < f[open[p]]) { var tmp = open[i]; open[i] = open[p]; open[p] = tmp; i = p; } else break; } }
    function pop() {
      var top = open[0]; oi--; open[0] = open[oi];
      var i = 0;
      for (; ;) {
        var l = i * 2 + 1, r = l + 1, m = i;
        if (l < oi && f[open[l]] < f[open[m]]) m = l;
        if (r < oi && f[open[r]] < f[open[m]]) m = r;
        if (m === i) break;
        var tmp = open[i]; open[i] = open[m]; open[m] = tmp; i = m;
      }
      return top;
    }
    push(s);
    var explored = 0;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (oi > 0) {
      var cur = pop();
      var cx = cur % w, cy = (cur / w) | 0;
      if (cur === t) {
        var path = [];
        var n = t;
        while (n !== -1) { path.push({ x: n % w, y: (n / w) | 0 }); n = came[n]; }
        path.reverse();
        return path;
      }
      if (++explored > maxNodes) return null;
      for (var d = 0; d < 4; d++) {
        var nx = cx + dirs[d][0], ny = cy + dirs[d][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (blockedFn(nx, ny)) continue;
        var ni = idx(nx, ny);
        var ng = g[cur] + 1;
        if (ng < g[ni]) {
          came[ni] = cur;
          g[ni] = ng;
          f[ni] = ng + heur(nx, ny);
          push(ni);
        }
      }
    }
    return null;
  }

  /* Bresenham line; calls cb(x,y) and returns true if any cell blocks */
  function lineLOS(x0, y0, x1, y1, blockedFn, maxLen) {
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;
    var cx = x0, cy = y0, steps = 0;
    maxLen = maxLen || 64;
    for (; ;) {
      if (cx !== x0 || cy !== y0) {
        if (blockedFn(cx, cy)) return false;
      }
      if (cx === x1 && cy === y1) return true;
      if (++steps > maxLen) return false;
      var e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  }

  function fmtSep(n) {
    var s = String(Math.floor(n));
    var out = '';
    for (var i = 0; i < s.length; i++) {
      out += s[i];
      if ((s.length - i - 1) % 3 === 0 && i !== s.length - 1) out += ',';
    }
    return out;
  }

  return {
    clamp: clamp, lerp: lerp, dist: dist,
    mulberry32: mulberry32, hashStr: hashStr, RNG: RNG, shuffle: shuffle,
    makeCanvas: makeCanvas, setCanvasFactory: setCanvasFactory,
    b64FromBytes: b64FromBytes, bytesFromB64: bytesFromB64,
    now: now, findPath: findPath, lineLOS: lineLOS, fmtSep: fmtSep
  };
})();

'use strict';
/* ============================================================
   Emberfall - 01_cfg.js : global configuration / balancing
   ============================================================ */
var CFG = (function () {

  var TILE_W = 64;      // isometric tile width
  var TILE_H = 32;      // isometric tile height
  var WALL_H = 46;      // wall face height in px
  var DOOR_H = 46;

  var T = { FLOOR: 0, WALL: 1, WATER: 2 };

  var VIEW_R = 9;              // fog visibility radius (tiles)
  var TORCH_R = 4;             // torch light radius (tiles)
  var VIS_INTERVAL = 160;      // ms between visibility recomputes
  var MAX_FRAME = 50;          // max dt ms per frame

  var PLAYER = {
    baseHP: 60, baseMP: 30, baseDmg: 4, baseArmor: 0,
    hpPerLevel: 14, mpPerLevel: 8, dmgPerLevel: 1, armorPerLevel: 1,
    speed: 4.6,            // tiles / second
    meleeRange: 1.25,
    attackCd: 0.42,
    manaRegen: 2.2,
    pickupRange: 1.4,
    interactRange: 1.6,
    npcRange: 2.4,
    merchantRange: 6.0,
    startGold: 50
  };

  function xpNeeded(level) { return 60 + (level - 1) * 45; }

  var ABILITIES = {
    firebolt: { key: '1', name: 'Firebolt', mana: 5, cd: 0.7, dmg: function (lvl) { return 10 + lvl * 2; } },
    nova: { key: '2', name: 'Flame Nova', mana: 12, cd: 3.0, dmg: function (lvl) { return 15 + Math.round(lvl * 2.6); } },
    heal: { key: '3', name: 'Mend', mana: 9, cd: 4.5, amount: function (lvl) { return 26 + lvl * 4; } }
  };

  var POTIONS = {
    health: { heal: 40, healMax: 0.25, key: 'Q' },
    mana: { heal: 35, healMax: 0.25, key: 'W' }
  };

  var AREA_ORDER = ['town', 'wild', 'cath1', 'cath2', 'cath3', 'b1', 'b2', 'b3', 'b4'];

  var AREA_NAMES = {
    town: 'Town of Thornhollow',
    wild: 'Grimmoor Wilds',
    cath1: 'Cathedral \u00b7 1F',
    cath2: 'Cathedral \u00b7 2F',
    cath3: 'Cathedral \u00b7 3F \u2014 The High Chancel',
    b1: 'The Catacombs \u00b7 B1F',
    b2: 'The Catacombs \u00b7 B2F',
    b3: 'The Catacombs \u00b7 B3F',
    b4: 'The Catacombs \u00b7 B4F \u2014 The Charnel Throne'
  };

  var SAVE_KEY = 'emberfall_save_v1';

  var PALETTES = {
    crypt: {
      floor: ['#35373f', '#383a43', '#33353d', '#3a3c45', '#313338', '#3d3f48'],
      floorGrout: '#1d1e24',
      wall: ['#26282e', '#2b2d35', '#22242a'],
      wallMortar: '#141519',
      wallTop: '#3a3c45',
      accent: '#5a6b5a'
    },
    cathedral: {
      floor: ['#4a463d', '#4e4a41', '#454139', '#514d44', '#423e36', '#555148'],
      floorGrout: '#2a2722',
      wall: ['#4d4940', '#534f45', '#474339'],
      wallMortar: '#2e2b25',
      wallTop: '#57534a',
      accent: '#6d5a3a'
    },
    town: {
      floor: ['#4a4436', '#4c4638', '#474132', '#4e483a'],
      wall: ['#57503f', '#524b3b', '#5c5542'],
      wallMortar: '#332e22',
      wallTop: '#5f5846',
      accent: '#7a6a45'
    },
    wild: {
      floor: ['#425132', '#3f4d30', '#475636', '#3c4a2e'],
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    grass: {
      floor: ['#405c34', '#3d5730', '#46643a', '#385229', '#4a6a3e'],
      floorGrout: '#232c1b',
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    dirt: {
      floor: ['#57493a', '#544636', '#5a4c3d', '#514334'],
      floorGrout: '#33291f',
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    boss: {
      floor: ['#2f3138', '#32343c', '#2c2e35', '#353740'],
      floorGrout: '#191a20',
      wall: ['#232529', '#282a30', '#1f2125'],
      wallMortar: '#101115',
      wallTop: '#33353d',
      accent: '#6e2f2f'
    }
  };

  return {
    TILE_W: TILE_W, TILE_H: TILE_H, WALL_H: WALL_H, DOOR_H: DOOR_H,
    T: T, VIEW_R: VIEW_R, TORCH_R: TORCH_R, VIS_INTERVAL: VIS_INTERVAL, MAX_FRAME: MAX_FRAME,
    PLAYER: PLAYER, xpNeeded: xpNeeded, ABILITIES: ABILITIES, POTIONS: POTIONS,
    AREA_ORDER: AREA_ORDER, AREA_NAMES: AREA_NAMES, SAVE_KEY: SAVE_KEY, PALETTES: PALETTES
  };
})();

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

'use strict';
/* ============================================================
   Emberfall - 03_actor_sprites.js : entities, props, buildings,
   icons, glows. All procedural & prerendered.
   ============================================================ */
var SPR = (function () {

  var TW = CFG.TILE_W, TH = CFG.TILE_H, WH = CFG.WALL_H, DH = CFG.DOOR_H;

  /* ---------- glow sprites ---------- */
  function makeGlow(color, radius, hot) {
    var r = Math.max(8, radius);
    var c = Util.makeCanvas(r * 2, r * 2);
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(r, r, 1, r, r, r);
    grd.addColorStop(0, hot);
    grd.addColorStop(0.35, color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  var glows = {};
  function glow(name) {
    if (glows[name]) return glows[name];
    var m = {
      warm: ['rgba(255,214,130,0.55)', 90],
      torch: ['rgba(255,168,70,0.5)', 72],
      blue: ['rgba(120,170,255,0.45)', 80],
      red: ['rgba(255,80,80,0.5)', 70],
      green: ['rgba(120,255,170,0.5)', 70],
      white: ['rgba(240,240,255,0.5)', 80]
    }[name] || ['rgba(255,200,120,0.5)', 80];
    glows[name] = makeGlow(m[0], m[1], 'rgba(255,255,255,0.9)');
    return glows[name];
  }

  /* ---------- flame frames ---------- */
  function makeFlameFrames(color, n) {
    var out = [];
    for (var f = 0; f < n; f++) {
      var c = Util.makeCanvas(26, 44);
      var g = c.getContext('2d');
      var rng = new Util.RNG(90 + f * 7);
      var cx = 13;
      for (var i = 0; i < 3; i++) {
        var bx = cx + ((i * 13 + f * 5) % 9) - 4.5;
        var h = 30 + ((i * 17 + f * 11) % 12) - 6;
        var wdt = 7 + ((i * 11 + f * 7) % 5);
        var grd = g.createRadialGradient(bx, 40, 1, bx, 40, h);
        grd.addColorStop(0, 'rgba(255,255,220,0.95)');
        grd.addColorStop(0.4, color);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.moveTo(bx - wdt, 42);
        g.quadraticCurveTo(bx - wdt * 1.4, 42 - h * 0.6, bx, 42 - h);
        g.quadraticCurveTo(bx + wdt * 1.4, 42 - h * 0.6, bx + wdt, 42);
        g.closePath();
        g.fill();
      }
      out.push(c);
    }
    return out;
  }
  var flameFrames = { orange: null, blue: null };
  function flames(color) {
    color = color || 'orange';
    if (!flameFrames[color]) flameFrames[color] = makeFlameFrames(color === 'blue' ? 'rgba(140,190,255,0.8)' : 'rgba(255,150,60,0.85)', 3);
    return flameFrames[color];
  }

  /* ---------- humanoid actors ---------- */
  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }

  /* opts: robe, trim, hood, skin, skull, weapon, cape, crown, staff, size, horn */
  function humanoid(opts) {
    var sc = opts.size || 1;
    var w = 84, h = 104;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, feet = h - 8;
    var s = sc;
    // shadow
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(cx, feet + 2, 16 * s, 5.5 * s, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.translate(cx, feet);
    g.scale(s, s);
    var robe = opts.robe || '#4a4a55';
    var robeD = TS.shade(robe, 0.72);
    var robeL = TS.shade(robe, 1.12);
    var trim = opts.trim || '#8a7f5f';
    var skin = opts.skin || '#c9a27a';
    var skull = !!opts.skull;
    // cape
    if (opts.cape) {
      g.fillStyle = TS.shade(opts.cape, 0.85);
      g.beginPath();
      g.moveTo(-9, -52);
      g.quadraticCurveTo(-22, -20, -16, -4);
      g.lineTo(-7, -4);
      g.quadraticCurveTo(-10, -30, -2, -52);
      g.closePath();
      g.fill();
    }
    // legs
    if (opts.quadruped) {
      // handled separately by wolf()
    } else {
      g.fillStyle = robeD;
      roundRect(g, -9, -22, 6.5, 22, 2.5);
      roundRect(g, 2.5, -22, 6.5, 22, 2.5);
      // boots
      g.fillStyle = '#241d17';
      roundRect(g, -10, -7, 8, 7, 2);
      roundRect(g, 2, -7, 8, 7, 2);
      // robe skirt
      g.fillStyle = robe;
      g.beginPath();
      g.moveTo(-13, -24);
      g.quadraticCurveTo(-15, -8, -11, -2);
      g.lineTo(11, -2);
      g.quadraticCurveTo(15, -8, 13, -24);
      g.quadraticCurveTo(0, -30, -13, -24);
      g.closePath();
      g.fill();
      // trim on skirt
      g.strokeStyle = trim;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(-11, -8);
      g.quadraticCurveTo(0, -13, 11, -8);
      g.stroke();
    }
    // torso
    g.fillStyle = robe;
    roundRect(g, -10, -52, 20, 30, 8);
    g.fill();
    g.strokeStyle = robeD;
    g.lineWidth = 1;
    g.stroke();
    // belt
    g.fillStyle = trim;
    g.fillRect(-10, -30, 20, 3.5);
    g.fillStyle = '#b9a668';
    g.fillRect(-3, -31, 6, 5);
    // arms
    g.fillStyle = robe;
    roundRect(g, -16, -50, 6, 22, 3);
    roundRect(g, 10, -50, 6, 22, 3);
    g.fill();
    // hands
    g.fillStyle = skull ? '#d8d2c2' : skin;
    g.beginPath();
    g.arc(-13, -27, 3.2, 0, Math.PI * 2);
    g.arc(13, -27, 3.2, 0, Math.PI * 2);
    g.fill();
    // weapon in right hand
    if (opts.weapon === 'sword') {
      g.save();
      g.translate(13, -27);
      g.rotate(0.9);
      g.fillStyle = '#c8ccd4';
      g.fillRect(-1.4, -30, 2.8, 26);
      g.fillStyle = '#aeb4bd';
      g.fillRect(-2.6, -38, 5.2, 9);
      g.fillStyle = '#7a5b28';
      g.fillRect(-2, -1, 4, 5);
      g.restore();
    } else if (opts.weapon === 'axe') {
      g.save();
      g.translate(13, -27);
      g.rotate(0.8);
      g.fillStyle = '#8a6b45';
      g.fillRect(-1.5, -26, 3, 26);
      g.fillStyle = '#9aa2ac';
      g.beginPath();
      g.moveTo(0, -40);
      g.quadraticCurveTo(9, -36, 10, -26);
      g.quadraticCurveTo(5, -30, 0, -28);
      g.closePath();
      g.fill();
      g.restore();
    } else if (opts.weapon === 'staff') {
      g.save();
      g.translate(13, -27);
      g.rotate(0.15);
      g.fillStyle = '#5f4a2e';
      g.fillRect(-1.5, -44, 3, 44);
      g.fillStyle = opts.staffOrb || '#7a5ad8';
      g.beginPath();
      g.arc(0, -48, 6, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.beginPath();
      g.arc(-2, -50, 2, 0, Math.PI * 2);
      g.fill();
      g.restore();
    } else if (opts.weapon === 'club') {
      g.save();
      g.translate(13, -27);
      g.rotate(0.7);
      g.fillStyle = '#4d3a26';
      g.fillRect(-2, -28, 4, 28);
      g.fillStyle = '#6e6a60';
      g.beginPath();
      g.arc(0, -34, 7.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    // shoulders
    g.fillStyle = robeL;
    g.beginPath();
    g.arc(-11, -49, 4, 0, Math.PI * 2);
    g.arc(11, -49, 4, 0, Math.PI * 2);
    g.fill();
    // head
    var hy = -58;
    if (skull) {
      g.fillStyle = '#ded8c8';
      g.beginPath();
      g.arc(0, hy, 9.5, 0, Math.PI * 2);
      g.fill();
      // jaw
      g.fillRect(-4.5, hy + 2, 9, 4.5);
      // eye sockets
      g.fillStyle = '#15120d';
      g.beginPath();
      g.arc(-3.5, hy - 1.5, 2.6, 0, Math.PI * 2);
      g.arc(3.5, hy - 1.5, 2.6, 0, Math.PI * 2);
      g.fill();
      // nose hole
      g.beginPath();
      g.moveTo(0, hy + 3);
      g.lineTo(-1.6, hy + 5.5);
      g.lineTo(1.6, hy + 5.5);
      g.closePath();
      g.fill();
      // teeth lines
      g.strokeStyle = '#8a8578';
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(-4, hy + 5);
      g.lineTo(4, hy + 5);
      g.moveTo(-3, hy + 6.5);
      g.lineTo(3, hy + 6.5);
      g.stroke();
    } else {
      g.fillStyle = skin;
      g.beginPath();
      g.arc(0, hy + 1, 8.5, 0, Math.PI * 2);
      g.fill();
      // eyes (dark, shadowed)
      g.fillStyle = 'rgba(20,16,12,0.85)';
      g.fillRect(-5, hy - 1, 2.6, 2.2);
      g.fillRect(2.6, hy - 1, 2.6, 2.2);
      // beard option
      if (opts.beard) {
        g.fillStyle = TS.shade(opts.beard, 1);
        g.beginPath();
        g.arc(0, hy + 4, 7.5, 0.2, Math.PI - 0.2);
        g.fill();
      }
    }
    // hood
    if (opts.hood) {
      g.fillStyle = robeD;
      g.beginPath();
      g.arc(0, hy - 1, 11.5, Math.PI * 0.85, Math.PI * 2.15);
      g.quadraticCurveTo(9, hy + 8, 0, hy + 9);
      g.quadraticCurveTo(-9, hy + 8, -11, hy - 2);
      g.closePath();
      g.fill();
      g.strokeStyle = trim;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(0, hy - 1, 11, Math.PI * 0.95, Math.PI * 2.05);
      g.stroke();
    } else if (opts.hair) {
      g.fillStyle = opts.hair;
      g.beginPath();
      g.arc(0, hy - 1, 9, Math.PI * 0.9, Math.PI * 2.1);
      g.closePath();
      g.fill();
    }
    // crown
    if (opts.crown) {
      g.fillStyle = '#d4b95c';
      g.beginPath();
      g.moveTo(-8, hy - 7);
      g.lineTo(-8, hy - 13);
      g.lineTo(-5, hy - 9);
      g.lineTo(-2, hy - 14);
      g.lineTo(1, hy - 9);
      g.lineTo(4, hy - 13);
      g.lineTo(8, hy - 8);
      g.closePath();
      g.fill();
      g.fillStyle = '#8a2f2f';
      g.fillRect(-4, hy - 9.5, 2.5, 2.5);
      g.fillRect(2, hy - 9.5, 2.5, 2.5);
    }
    // horns (gargoyle)
    if (opts.horn) {
      g.fillStyle = '#8d8a7e';
      g.beginPath();
      g.moveTo(-7, hy - 6);
      g.quadraticCurveTo(-13, hy - 16, -8, hy - 18);
      g.quadraticCurveTo(-10, hy - 11, -5, hy - 7);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(7, hy - 6);
      g.quadraticCurveTo(13, hy - 16, 8, hy - 18);
      g.quadraticCurveTo(10, hy - 11, 5, hy - 7);
      g.closePath();
      g.fill();
    }
    g.restore();
    return c;
  }

  function wolf(opts) {
    var w = 88, h = 74;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, feet = h - 10;
    var fur = opts.fur || '#5a5c55';
    var furD = TS.shade(fur, 0.75);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(cx, feet + 1, 20, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.translate(cx, feet);
    // legs
    g.fillStyle = furD;
    roundRect(g, -24, -16, 5, 16, 2);
    roundRect(g, -10, -16, 5, 16, 2);
    roundRect(g, 6, -16, 5, 16, 2);
    roundRect(g, 18, -16, 5, 16, 2);
    // body
    g.fillStyle = fur;
    g.beginPath();
    g.ellipse(-2, -26, 24, 13, -0.08, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = TS.shade(fur, 1.1);
    g.beginPath();
    g.ellipse(-2, -30, 19, 8, -0.08, 0, Math.PI * 2);
    g.fill();
    // tail
    g.fillStyle = furD;
    g.beginPath();
    g.moveTo(19, -30);
    g.quadraticCurveTo(34, -34, 32, -46);
    g.quadraticCurveTo(27, -40, 22, -33);
    g.closePath();
    g.fill();
    // head
    g.fillStyle = fur;
    g.beginPath();
    g.moveTo(-20, -38);
    g.quadraticCurveTo(-32, -32, -34, -42);
    g.quadraticCurveTo(-28, -48, -20, -46);
    g.closePath();
    g.fill();
    // snout
    g.fillStyle = TS.shade(fur, 0.85);
    g.beginPath();
    g.moveTo(-28, -43);
    g.quadraticCurveTo(-42, -40, -44, -45);
    g.quadraticCurveTo(-38, -47, -28, -47);
    g.closePath();
    g.fill();
    // ears
    g.fillStyle = furD;
    g.beginPath();
    g.moveTo(-24, -48);
    g.lineTo(-20, -58);
    g.lineTo(-17, -48);
    g.closePath();
    g.fill();
    // eyes
    g.fillStyle = '#ffd34d';
    g.fillRect(-31, -45, 2.6, 2);
    g.fillStyle = '#e8e2d4';
    g.fillRect(-41, -45, 2, 1.6);
    // teeth
    g.fillStyle = '#e8e2d4';
    g.beginPath();
    g.moveTo(-44, -44);
    g.lineTo(-40, -43);
    g.lineTo(-42, -41.6);
    g.closePath();
    g.fill();
    g.restore();
    return c;
  }

  /* ---------- corpses ---------- */
  function corpse(kind) {
    var c = Util.makeCanvas(64, 44);
    var g = c.getContext('2d');
    var cx = 32, y = 34;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, y + 3, 20, 5, 0, 0, Math.PI * 2);
    g.fill();
    if (kind === 'skeleton' || kind === 'brute' || kind === 'king') {
      var big = kind !== 'skeleton';
      var sc = big ? 1.5 : 1;
      g.save();
      g.translate(cx, y);
      g.scale(sc, sc);
      // scattered bones
      g.strokeStyle = '#c9c2ae';
      g.lineWidth = 3.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-14, 2); g.lineTo(-4, -6);
      g.moveTo(12, 2); g.lineTo(4, -8);
      g.moveTo(-6, 3); g.lineTo(-2, -1);
      g.moveTo(6, 3); g.lineTo(9, -1);
      g.moveTo(-20, 4); g.lineTo(-14, 0);
      g.moveTo(16, 3); g.lineTo(22, 0);
      g.stroke();
      // skull
      g.fillStyle = '#d6cfba';
      g.beginPath();
      g.arc(0, -8, 8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#14120e';
      g.beginPath();
      g.arc(-3, -9, 2.2, 0, Math.PI * 2);
      g.arc(3, -9, 2.2, 0, Math.PI * 2);
      g.fill();
      // ribs
      g.strokeStyle = '#b3ab94';
      g.lineWidth = 2.2;
      for (var i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(-11 + i * 3, 3 - i * 2);
        g.quadraticCurveTo(0, 8 - i * 2, 12 - i * 3, 2 - i * 2);
        g.stroke();
      }
      if (kind === 'king') {
        g.fillStyle = '#b8a24a';
        g.beginPath();
        g.moveTo(-9, -17);
        g.lineTo(-9, -22);
        g.lineTo(-5, -19);
        g.lineTo(-1, -23);
        g.lineTo(3, -19);
        g.lineTo(9, -18);
        g.closePath();
        g.fill();
      }
      g.restore();
    } else if (kind === 'robed') {
      g.fillStyle = '#3a3238';
      g.beginPath();
      g.ellipse(cx, y - 3, 17, 8, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2a2428';
      g.beginPath();
      g.ellipse(cx + 5, y - 8, 9, 6, 0.4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#c9a27a';
      g.beginPath();
      g.arc(cx - 2, y - 12, 4.5, 0, Math.PI * 2);
      g.fill();
    } else if (kind === 'wolf') {
      g.fillStyle = '#4a463e';
      g.beginPath();
      g.ellipse(cx, y - 3, 20, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#3a372f';
      g.beginPath();
      g.ellipse(cx - 16, y - 7, 8, 5, 0.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#57534a';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - 10, y - 14); g.lineTo(cx - 14, y - 22);
      g.moveTo(cx + 8, y - 16); g.lineTo(cx + 10, y - 24);
      g.stroke();
    } else if (kind === 'wraith') {
      g.fillStyle = 'rgba(120,160,200,0.25)';
      g.beginPath();
      g.ellipse(cx, y - 2, 16, 6, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(150,180,220,0.3)';
      g.lineWidth = 2;
      for (var j = 0; j < 3; j++) {
        g.beginPath();
        g.moveTo(cx - 14 + j * 4, y + 2 - j);
        g.quadraticCurveTo(cx + j * 3, y - 8, cx + 14 - j * 4, y + 1 - j);
        g.stroke();
      }
    }
    return c;
  }

  /* ---------- props ---------- */
  function makeTree(variant) {
    var rng = new Util.RNG(3000 + variant * 13);
    var w = TW + 46, h = TH + 96;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, base = h - 14;
    // shadow
    g.fillStyle = 'rgba(0,0,0,0.32)';
    g.beginPath();
    g.ellipse(cx, base + 3, 22, 6.5, 0, 0, Math.PI * 2);
    g.fill();
    // trunk
    g.fillStyle = '#3d3226';
    g.fillRect(cx - 3.4, base - 34, 6.8, 34);
    g.fillStyle = '#4d3f2e';
    g.fillRect(cx - 3.4, base - 34, 2.6, 34);
    // canopy blobs
    var green = rng.chance(0.5) ? '#37502c' : '#405a32';
    var layers = 3;
    var ry = base - 34;
    for (var l = 0; l < layers; l++) {
      var bw = (layers - l) * 15 + 8;
      g.fillStyle = TS.shade(green, 1 - l * 0.09);
      g.beginPath();
      g.ellipse(cx + rng.jitter(0, 5), ry, bw, bw * 0.62, 0, 0, Math.PI * 2);
      g.fill();
      ry -= 15 + l * 4;
    }
    g.fillStyle = 'rgba(255,255,230,0.10)';
    g.beginPath();
    g.ellipse(cx - 8, ry + 12, 12, 7, -0.5, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeRock(variant) {
    var rng = new Util.RNG(7000 + variant * 7);
    var w = 56, h = 42;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(w / 2, h - 5, 18, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#565b58';
    g.beginPath();
    g.moveTo(8, h - 8);
    g.lineTo(14, 16);
    g.lineTo(30, 8);
    g.lineTo(46, 18);
    g.lineTo(52, h - 8);
    g.closePath();
    g.fill();
    g.fillStyle = '#6a706c';
    g.beginPath();
    g.moveTo(14, 16);
    g.lineTo(30, 8);
    g.lineTo(46, 18);
    g.lineTo(36, 26);
    g.lineTo(20, 24);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 1;
    g.stroke();
    return c;
  }
  function makeBush() {
    var w = 46, h = 36;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath();
    g.ellipse(w / 2, h - 5, 14, 4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2f3d26';
    g.beginPath();
    g.ellipse(w / 2 - 4, h - 12, 10, 8, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3a4a2e';
    g.beginPath();
    g.ellipse(w / 2 + 4, h - 12, 11, 9, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(200,220,160,0.15)';
    g.beginPath();
    g.ellipse(w / 2 - 1, h - 16, 8, 5, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeTombstone(variant) {
    var rng = new Util.RNG(8100 + variant * 9);
    var w = 34, h = 46;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(w / 2, h - 4, 10, 3.4, 0, 0, Math.PI * 2);
    g.fill();
    var gray = rng.chance(0.5) ? '#5d615c' : '#545852';
    g.fillStyle = gray;
    if (variant % 2 === 0) {
      g.fillRect(8, 8, 18, h - 16);
      g.beginPath();
      g.arc(w / 2, 12, 9, Math.PI, 0);
      g.fill();
    } else {
      g.fillRect(10, 14, 14, h - 22);
      g.beginPath();
      g.moveTo(10, 16);
      g.lineTo(17, 6);
      g.lineTo(24, 16);
      g.closePath();
      g.fill();
    }
    g.fillStyle = '#3a3d38';
    g.fillRect(11, h - 10, 12, 4);
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.stroke();
    return c;
  }
  function makePillar(variant) {
    var w = 44, h = TH + WH + 14;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, top = TH / 2 + 2;
    // shaft
    g.fillStyle = '#5b5a54';
    g.beginPath();
    g.moveTo(cx - 8, top);
    g.lineTo(cx + 8, top);
    g.lineTo(cx + 8, top + WH);
    g.lineTo(cx - 8, top + WH);
    g.closePath();
    g.fill();
    g.fillStyle = '#6d6c64';
    g.beginPath();
    g.moveTo(cx - 8, top);
    g.lineTo(cx, top - TH / 2);
    g.lineTo(cx + 8, top);
    g.closePath();
    g.fill();
    // base + capital
    g.fillStyle = '#4a4943';
    g.fillRect(cx - 11, top + WH - 6, 22, 6);
    g.fillRect(cx - 11, top - 5, 22, 6);
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.strokeRect(cx - 8, top, 16, WH);
    // cracks
    g.strokeStyle = 'rgba(0,0,0,0.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx - 3 + (variant % 3), top + 6);
    g.lineTo(cx + (variant % 3) - 1, top + 20);
    g.stroke();
    return c;
  }
  function makeBrazier() {
    var w = 40, h = 64;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2;
    g.fillStyle = '#2e2c28';
    g.fillRect(cx - 2.5, h - 26, 5, 26);
    g.fillRect(cx - 8, h - 28, 16, 4);
    // bowl
    g.fillStyle = '#3a3833';
    g.beginPath();
    g.moveTo(cx - 10, h - 30);
    g.lineTo(cx + 10, h - 30);
    g.lineTo(cx + 7, h - 40);
    g.lineTo(cx - 7, h - 40);
    g.closePath();
    g.fill();
    g.fillStyle = '#221d16';
    g.beginPath();
    g.ellipse(cx, h - 40, 8, 3.2, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeTorchSconce() {
    var w = 30, h = 46;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    // wall bracket
    g.fillStyle = '#4a443a';
    g.fillRect(4, h - 8, 20, 4);
    g.fillRect(6, h - 14, 4, 8);
    // torch stick
    g.fillStyle = '#5a4a30';
    g.fillRect(11, h - 34, 4, 24);
    g.fillStyle = '#3a2d1c';
    g.fillRect(9, h - 40, 8, 8);
    return c;
  }
  function makeAltar() {
    var w = TW, h = TH + 46;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, top = TH + 18;
    // base block
    g.fillStyle = '#55534c';
    g.beginPath();
    g.moveTo(cx - 16, top);
    g.lineTo(cx + 16, top);
    g.lineTo(cx + 16, top + 22);
    g.lineTo(cx - 16, top + 22);
    g.closePath();
    g.fill();
    g.fillStyle = '#66645c';
    g.beginPath();
    g.moveTo(cx - 16, top);
    g.lineTo(cx, top - 9);
    g.lineTo(cx + 16, top);
    g.closePath();
    g.fill();
    g.fillStyle = '#3f3d38';
    g.fillRect(cx - 19, top + 20, 38, 5);
    // cloth
    g.fillStyle = '#5e2430';
    g.beginPath();
    g.moveTo(cx - 13, top - 9);
    g.quadraticCurveTo(cx, top - 2, cx + 13, top - 9);
    g.lineTo(cx + 12, top + 2);
    g.quadraticCurveTo(cx, top + 5, cx - 12, top + 2);
    g.closePath();
    g.fill();
    // censer
    g.fillStyle = '#c9a24a';
    g.beginPath();
    g.arc(cx, top - 13, 5.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e6cf7a';
    g.beginPath();
    g.arc(cx - 1.6, top - 15, 2, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeThrone() {
    var w = 74, h = TH + WH + 30;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, top = TH + 10;
    // seat
    g.fillStyle = '#6e6a5c';
    g.fillRect(cx - 18, top, 36, 14);
    g.fillStyle = '#575448';
    g.fillRect(cx - 20, top + 12, 40, 10);
    // back with bone spikes
    g.fillStyle = '#7b776a';
    g.fillRect(cx - 18, top - 30, 36, 32);
    g.fillStyle = '#d8d2be';
    for (var i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(cx - 16 + i * 10, top - 26);
      g.lineTo(cx - 12 + i * 10, top - 40);
      g.lineTo(cx - 8 + i * 10, top - 26);
      g.closePath();
      g.fill();
    }
    // skull
    g.fillStyle = '#e2dcca';
    g.beginPath();
    g.arc(cx, top - 14, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#14120e';
    g.beginPath();
    g.arc(cx - 3.4, top - 15.5, 2.2, 0, Math.PI * 2);
    g.arc(cx + 3.4, top - 15.5, 2.2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#3c3930';
    g.lineWidth = 1;
    g.strokeRect(cx - 18, top - 30, 36, 44);
    return c;
  }
  function makeFountain() {
    var w = TW + 16, h = TH + 30;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = TH + 8;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, cy + 10, 30, 9, 0, 0, Math.PI * 2);
    g.fill();
    // basin
    g.fillStyle = '#5a5548';
    g.beginPath();
    g.ellipse(cx, cy, 28, 11, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#6d6756';
    g.beginPath();
    g.ellipse(cx, cy - 3, 28, 11, 0, 0, Math.PI * 2);
    g.fill();
    // water
    g.fillStyle = '#2b4254';
    g.beginPath();
    g.ellipse(cx, cy - 3, 22, 8.4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(160,200,225,0.35)';
    g.beginPath();
    g.ellipse(cx - 4, cy - 5, 9, 3.4, 0, 0, Math.PI * 2);
    g.fill();
    // center pillar
    g.fillStyle = '#6d6756';
    g.fillRect(cx - 4, cy - 26, 8, 24);
    g.fillStyle = '#7b7562';
    g.beginPath();
    g.ellipse(cx, cy - 26, 9, 3.6, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeWell() {
    var w = 64, h = TH + 44;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = TH + 6;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, cy + 12, 22, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#5f5a4c';
    g.beginPath();
    g.ellipse(cx, cy, 20, 8.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#6e685a';
    g.beginPath();
    g.ellipse(cx, cy - 2, 20, 8.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#0d1016';
    g.beginPath();
    g.ellipse(cx, cy - 2, 14, 5.8, 0, 0, Math.PI * 2);
    g.fill();
    // posts + roof
    g.fillStyle = '#4d3f2c';
    g.fillRect(cx - 14, cy - 34, 4, 34);
    g.fillRect(cx + 10, cy - 34, 4, 34);
    g.beginPath();
    g.moveTo(cx - 22, cy - 32);
    g.lineTo(cx, cy - 46);
    g.lineTo(cx + 22, cy - 32);
    g.closePath();
    g.fill();
    g.strokeStyle = '#3a2f20';
    g.stroke();
    return c;
  }
  function makeStall() {
    var w = TW + 20, h = TH + 40;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = TH + 6;
    // counter
    g.fillStyle = '#5d4c32';
    g.beginPath();
    g.moveTo(cx - 20, cy - 6);
    g.lineTo(cx + 20, cy - 6);
    g.lineTo(cx + 20, cy + 12);
    g.lineTo(cx - 20, cy + 12);
    g.closePath();
    g.fill();
    g.fillStyle = '#6d5a3c';
    g.beginPath();
    g.moveTo(cx - 20, cy - 6);
    g.lineTo(cx, cy - 14);
    g.lineTo(cx + 20, cy - 6);
    g.closePath();
    g.fill();
    // awning
    g.fillStyle = '#7a2f35';
    g.beginPath();
    g.moveTo(cx - 26, cy - 8);
    g.lineTo(cx - 26, cy - 26);
    g.quadraticCurveTo(cx, cy - 34, cx + 26, cy - 26);
    g.lineTo(cx + 26, cy - 8);
    g.closePath();
    g.fill();
    g.fillStyle = '#8f3a42';
    g.beginPath();
    g.moveTo(cx - 26, cy - 12);
    g.lineTo(cx - 26, cy - 26);
    g.quadraticCurveTo(cx, cy - 34, cx + 26, cy - 26);
    g.lineTo(cx + 26, cy - 12);
    g.lineTo(cx + 20, cy - 10);
    g.quadraticCurveTo(cx, cy - 20, cx - 20, cy - 10);
    g.closePath();
    g.fill();
    // poles
    g.fillStyle = '#4d3f2c';
    g.fillRect(cx - 24, cy - 8, 3, 20);
    g.fillRect(cx + 21, cy - 8, 3, 20);
    return c;
  }
  function makeRubble() {
    var w = 56, h = 40;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var rng = new Util.RNG(4444);
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath();
    g.ellipse(w / 2, h - 6, 18, 5, 0, 0, Math.PI * 2);
    g.fill();
    for (var i = 0; i < 6; i++) {
      var rx = 6 + rng.next() * (w - 12);
      var ry = h - 8 - rng.next() * 18;
      var rw = 6 + rng.next() * 10;
      var rh = 5 + rng.next() * 8;
      g.fillStyle = i % 2 ? '#56534a' : '#4a4842';
      g.beginPath();
      g.moveTo(rx, ry + rh);
      g.lineTo(rx + 3, ry);
      g.lineTo(rx + rw, ry + 2);
      g.lineTo(rx + rw - 3, ry + rh);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.4)';
      g.stroke();
    }
    return c;
  }
  function makeShrine() {
    var w = TW + 10, h = TH + 60;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = TH + 26;
    g.fillStyle = '#49463e';
    g.beginPath();
    g.moveTo(cx - 14, cy);
    g.lineTo(cx + 14, cy);
    g.lineTo(cx + 14, cy + 18);
    g.lineTo(cx - 14, cy + 18);
    g.closePath();
    g.fill();
    g.fillStyle = '#57544a';
    g.beginPath();
    g.moveTo(cx - 14, cy);
    g.lineTo(cx, cy - 8);
    g.lineTo(cx + 14, cy);
    g.closePath();
    g.fill();
    // glowing basin
    g.fillStyle = '#7a5ad8';
    g.beginPath();
    g.ellipse(cx, cy - 8, 8, 3, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makePew() {
    var w = 56, h = 40;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = h - 10;
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, cy + 4, 20, 5, 0, 0, Math.PI * 2);
    g.fill();
    // seat
    g.fillStyle = '#5a452e';
    g.beginPath();
    g.moveTo(cx - 18, cy);
    g.lineTo(cx + 18, cy);
    g.lineTo(cx + 18, cy - 6);
    g.lineTo(cx - 18, cy - 6);
    g.closePath();
    g.fill();
    g.fillStyle = '#6a5338';
    g.beginPath();
    g.moveTo(cx - 18, cy);
    g.lineTo(cx, cy - 6);
    g.lineTo(cx + 18, cy);
    g.closePath();
    g.fill();
    // back
    g.fillStyle = '#4a3825';
    g.fillRect(cx - 18, cy - 20, 4, 20);
    g.fillRect(cx + 14, cy - 20, 4, 20);
    g.fillStyle = '#5a452e';
    g.fillRect(cx - 16, cy - 22, 32, 5);
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.lineWidth = 1;
    g.strokeRect(cx - 18, cy - 22, 36, 26);
    return c;
  }
  function makeSarc(variant) {
    var w = 52, h = TH + 22;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, top = TH + 2;
    var col = variant % 2 ? '#565a58' : '#4d514e';
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.ellipse(cx, top + 14, 18, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(cx - 15, top);
    g.lineTo(cx + 15, top);
    g.lineTo(cx + 15, top + 16);
    g.lineTo(cx - 15, top + 16);
    g.closePath();
    g.fill();
    g.fillStyle = TS.shade(col, 1.18);
    g.beginPath();
    g.moveTo(cx - 15, top);
    g.lineTo(cx, top - 8);
    g.lineTo(cx + 15, top);
    g.closePath();
    g.fill();
    // carved lid detail
    g.strokeStyle = 'rgba(0,0,0,0.45)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(cx - 11, top - 4);
    g.lineTo(cx, top - 7);
    g.lineTo(cx + 11, top - 4);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.beginPath();
    g.moveTo(cx - 12, top + 2);
    g.lineTo(cx + 12, top + 2);
    g.stroke();
    // stone base
    g.fillStyle = '#3c3f3d';
    g.fillRect(cx - 17, top + 14, 34, 5);
    return c;
  }
  function makeBones() {
    var w = 48, h = 30;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var rng = new Util.RNG(991);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.beginPath();
    g.ellipse(w / 2, h - 4, 16, 4, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#b8b09a';
    g.lineWidth = 2.6;
    g.lineCap = 'round';
    for (var i = 0; i < 5; i++) {
      var x0 = 6 + rng.next() * (w - 12), y0 = h - 4 - rng.next() * 10;
      var x1 = x0 + (rng.next() * 2 - 1) * 14, y1 = y0 + (rng.next() * 2 - 1) * 6;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.fillStyle = '#c9c1ab';
      g.beginPath();
      g.arc(x1, y1, 2, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  }
  function makeTorchFloor() {
    var w = 34, h = 52;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2;
    g.fillStyle = '#3a3226';
    g.fillRect(cx - 2, h - 26, 4, 26);
    g.fillStyle = '#574a34';
    g.fillRect(cx - 5, h - 30, 10, 6);
    g.fillStyle = '#241a10';
    g.beginPath();
    g.ellipse(cx, h - 32, 5, 2.4, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  }
  function makeAnvil() {
    var w = 52, h = 42;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2;
    g.fillStyle = '#5a4d36';
    g.fillRect(cx - 12, h - 12, 24, 8);
    g.fillStyle = '#4a443c';
    g.beginPath();
    g.moveTo(cx - 8, h - 12);
    g.lineTo(cx - 5, h - 22);
    g.lineTo(cx + 5, h - 22);
    g.lineTo(cx + 8, h - 12);
    g.closePath();
    g.fill();
    g.fillStyle = '#6d665c';
    g.beginPath();
    g.moveTo(cx - 10, h - 22);
    g.lineTo(cx + 10, h - 22);
    g.lineTo(cx + 7, h - 27);
    g.lineTo(cx - 7, h - 27);
    g.closePath();
    g.fill();
    g.fillStyle = '#575048';
    g.fillRect(cx - 12, h - 26, 24, 4);
    return c;
  }
  function makeBarrel() {
    var w = 34, h = 44;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2;
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath();
    g.ellipse(cx, h - 4, 11, 3.4, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#6a4e30';
    g.beginPath();
    g.moveTo(cx - 9, h - 26);
    g.quadraticCurveTo(cx - 13, h - 8, cx - 9, h - 4);
    g.lineTo(cx + 9, h - 4);
    g.quadraticCurveTo(cx + 13, h - 8, cx + 9, h - 26);
    g.closePath();
    g.fill();
    g.fillStyle = '#7d5d3a';
    g.fillRect(cx - 8, h - 25, 16, 3.4);
    g.fillRect(cx - 10, h - 10, 20, 3);
    g.strokeStyle = '#3a2a1a';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx - 6, h - 26);
    g.lineTo(cx - 6, h - 4);
    g.moveTo(cx + 6, h - 26);
    g.lineTo(cx + 6, h - 4);
    g.stroke();
    return c;
  }
  function makeHay() {
    var w = 46, h = 34;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var rng = new Util.RNG(882);
    g.fillStyle = 'rgba(0,0,0,0.26)';
    g.beginPath();
    g.ellipse(w / 2, h - 5, 16, 4.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#a98d3f';
    g.beginPath();
    g.ellipse(w / 2, h - 10, 17, 10, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a7130';
    g.lineWidth = 1;
    for (var i = 0; i < 16; i++) {
      var a = rng.next() * Math.PI * 2;
      var r = rng.next() * 14;
      var hx = w / 2 + Math.cos(a) * r;
      var hy = h - 10 + Math.sin(a) * r * 0.5;
      var hx2 = hx + (rng.next() * 2 - 1) * 5;
      var hy2 = hy + rng.next() * 5;
      g.beginPath();
      g.moveTo(hx, hy);
      g.lineTo(hx2, hy2);
      g.stroke();
    }
    return c;
  }
  function makeCart() {
    var w = 74, h = TH + 34;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    var cx = w / 2, cy = TH + 4;
    // bed
    g.fillStyle = '#5d4a30';
    g.beginPath();
    g.moveTo(cx - 24, cy - 4);
    g.lineTo(cx + 24, cy - 4);
    g.lineTo(cx + 22, cy + 12);
    g.lineTo(cx - 22, cy + 12);
    g.closePath();
    g.fill();
    g.fillStyle = '#6d583a';
    g.beginPath();
    g.moveTo(cx - 24, cy - 4);
    g.lineTo(cx, cy - 12);
    g.lineTo(cx + 24, cy - 4);
    g.closePath();
    g.fill();
    // shaft
    g.fillStyle = '#4d3c26';
    g.fillRect(cx - 26, cy - 2, 52, 3.4);
    // wheels
    g.fillStyle = '#3a2f22';
    g.strokeStyle = '#2a2218';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx - 14, cy + 10, 8, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(cx + 14, cy + 10, 8, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    return c;
  }
  function makeGateBars(sealed) {
    var w = TW + 2, h = DH + 6;
    var c = Util.makeCanvas(w, h);
    var g = c.getContext('2d');
    g.fillStyle = '#2b2721';
    g.fillRect(0, 0, w, 9);
    g.fillRect(0, 0, 6, h);
    g.fillRect(w - 6, 0, 6, h);
    if (sealed) {
      g.fillStyle = '#1a1c22';
      g.fillRect(6, 8, w - 12, h - 8);
      g.fillStyle = '#4a4e58';
      for (var x = 12; x < w - 8; x += 7) g.fillRect(x, 8, 3.4, h - 8);
      for (var y = 14; y < h; y += 8) g.fillRect(6, y, w - 12, 2.6);
      // rune glow
      g.fillStyle = 'rgba(220,60,60,0.9)';
      g.beginPath();
      g.arc(w / 2, h / 2 - 4, 4, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,120,120,0.8)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(w / 2, h / 2 - 4, 7, 0, Math.PI * 2);
      g.stroke();
    } else {
      g.fillStyle = '#0b0b10';
      g.fillRect(6, 8, w - 12, h - 8);
      g.fillStyle = '#3a3e46';
      for (var x2 = 12; x2 < w - 8; x2 += 7) g.fillRect(x2, 4, 3.4, 12);
      var grd = g.createRadialGradient(w / 2, h * 0.6, 3, w / 2, h * 0.6, w * 0.55);
      grd.addColorStop(0, 'rgba(255,214,130,0.5)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
    }
    return c;
  }

  /* ---------- buildings (walls from grid; sprite = roof) ---------- */
  function quad(g, pts, fill, stroke) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
  }
  /* footprint: dx x dy tiles. Anchor tile (bx,by) = topmost. Returns canvas. */
  function building(dx, dy, style) {
    var roofH = 26 + (dx + dy) * 2;
    var eave = 5;
    var W = (dx + dy) * TW / 2 + eave * 2 + 4;
    var H = (dx + dy) * TH / 2 + WH + roofH + eave + 6;
    var c = Util.makeCanvas(W, H);
    var g = c.getContext('2d');
    // mapping: leftmost/topmost of footprint
    var leftmost = -(dy) * TW / 2 - eave - 2;
    var topmost = -TH / 2 - WH - roofH - eave - 3;
    var tx = function (x, y) { return (x - y) * TW / 2 - leftmost; };
    var ty = function (x, y) { return (x + y) * TH / 2 - topmost; };
    var S = style || {};
    var wallC = S.wall || '#6b6352';
    var roofC = S.roof || '#4a4038';
    var roofL = TS.shade(roofC, 1.15);
    var roofD = TS.shade(roofC, 0.72);
    var ridge = (dx >= dy); // ridge along x axis
    var R1, R2;
    if (ridge) { R1 = { x: tx(0, 0), y: ty(0, 0) - WH - roofH }; R2 = { x: tx(dx - 1, 0), y: ty(dx - 1, 0) - WH - roofH }; }
    else { R1 = { x: tx(0, 0), y: ty(0, 0) - WH - roofH }; R2 = { x: tx(0, dy - 1), y: ty(0, dy - 1) - WH - roofH }; }
    // gable triangles
    var gableC = TS.shade(wallC, 0.94);
    if (ridge) {
      quad(g, [[tx(0, 0) - eave, ty(0, 0) - WH], [tx(0, dy - 1) - eave, ty(0, dy - 1) - WH], [R1.x, R1.y]], gableC);
      quad(g, [[tx(dx - 1, 0) + eave, ty(dx - 1, 0) - WH], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH], [R2.x, R2.y]], gableC);
      // front-left plane (down to bottom-left edge)
      quad(g, [[R1.x, R1.y], [R2.x, R2.y], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH], [tx(0, dy - 1) - eave, ty(0, dy - 1) - WH]], roofL);
      // front-right plane
      quad(g, [[R2.x, R2.y], [tx(dx - 1, 0) + eave, ty(dx - 1, 0) - WH], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH]], roofD);
      // ridge cap
      g.strokeStyle = roofL;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(R1.x, R1.y);
      g.lineTo(R2.x, R2.y);
      g.stroke();
    } else {
      quad(g, [[tx(0, 0) - eave, ty(0, 0) - WH], [tx(dx - 1, 0) + eave, ty(dx - 1, 0) - WH], [R1.x, R1.y]], gableC);
      quad(g, [[tx(0, dy - 1) - eave, ty(0, dy - 1) - WH], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH], [R2.x, R2.y]], gableC);
      quad(g, [[R1.x, R1.y], [R2.x, R2.y], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH], [tx(dx - 1, 0) + eave, ty(dx - 1, 0) - WH]], roofL);
      quad(g, [[R2.x, R2.y], [tx(0, dy - 1) - eave, ty(0, dy - 1) - WH], [tx(dx - 1, dy - 1) + eave, ty(dx - 1, dy - 1) - WH]], roofD);
      g.strokeStyle = roofL;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(R1.x, R1.y);
      g.lineTo(R2.x, R2.y);
      g.stroke();
    }
    // shingle rows on front-left plane
    if (ridge) {
      var x0 = R1.x, x1 = R2.x;
      for (var i = 0; i < 3; i++) {
        var yTop = R1.y + 4 + i * 9;
        g.strokeStyle = 'rgba(0,0,0,0.18)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x0 - eave, yTop + (x0 - eave - x0) * 0.5);
        g.lineTo(x1 + eave, yTop + (x1 + eave - x0) * 0.5);
        g.stroke();
      }
    }
    c._ax = leftmost;
    c._ay = topmost;
    return c;
  }

  function cathedralExterior(dx, dy) {
    var W = (dx + dy) * TW / 2 + 30;
    var H = (dx + dy) * TH / 2 + WH + 96;
    var c = Util.makeCanvas(W, H);
    var g = c.getContext('2d');
    var leftmost = -(dy) * TW / 2 - 15;
    var topmost = -TH / 2 - WH - 92;
    var tx = function (x, y) { return (x - y) * TW / 2 - leftmost; };
    var ty = function (x, y) { return (x + y) * TH / 2 - topmost; };
    var roofC = '#4a4544';
    var roofL = TS.shade(roofC, 1.12);
    var roofD = TS.shade(roofC, 0.7);
    var ridgeY = ty(0, 0) - WH - 40;
    var R1 = { x: tx(0, 0), y: ridgeY };
    var R2 = { x: tx(dx - 1, 0), y: ridgeY };
    // gables
    quad(g, [[tx(0, 0) - 4, ty(0, 0) - WH], [tx(0, dy - 1) - 4, ty(0, dy - 1) - WH], [R1.x, R1.y]], '#5a5552');
    quad(g, [[tx(dx - 1, 0) + 4, ty(dx - 1, 0) - WH], [tx(dx - 1, dy - 1) + 4, ty(dx - 1, dy - 1) - WH], [R2.x, R2.y]], '#5a5552');
    quad(g, [[R1.x, R1.y], [R2.x, R2.y], [tx(dx - 1, dy - 1) + 4, ty(dx - 1, dy - 1) - WH], [tx(0, dy - 1) - 4, ty(0, dy - 1) - WH]], roofL);
    quad(g, [[R2.x, R2.y], [tx(dx - 1, 0) + 4, ty(dx - 1, 0) - WH], [tx(dx - 1, dy - 1) + 4, ty(dx - 1, dy - 1) - WH]], roofD);
    g.strokeStyle = roofL;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(R1.x, R1.y);
    g.lineTo(R2.x, R2.y);
    g.stroke();
    // rose window on front gable
    var gx = (tx(0, 0) + tx(0, dy - 1)) / 2;
    var gy = (ty(0, 0) + ty(0, dy - 1)) / 2 - WH / 2 - 10;
    g.fillStyle = '#2c2a30';
    g.beginPath();
    g.arc(gx, gy, 10, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a7f6a';
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(gx, gy, 10, 0, Math.PI * 2);
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      g.moveTo(gx, gy);
      g.lineTo(gx + Math.cos(a) * 10, gy + Math.sin(a) * 10);
    }
    g.stroke();
    // spire at west end
    var sx = R1.x + 6, sy = ridgeY;
    quad(g, [[sx - 10, sy], [sx + 10, sy], [sx, sy - 58]], '#55504d', '#2e2a28');
    g.strokeStyle = '#c9a24a';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(sx, sy - 58);
    g.lineTo(sx, sy - 66);
    g.moveTo(sx - 4, sy - 62);
    g.lineTo(sx + 4, sy - 62);
    g.stroke();
    // bell window
    g.fillStyle = '#191820';
    g.fillRect(sx - 4, sy - 40, 8, 12);
    c._ax = leftmost;
    c._ay = topmost;
    return c;
  }

  /* ---------- item icons ---------- */
  function itemIcon(kind) {
    var c = Util.makeCanvas(34, 34);
    var g = c.getContext('2d');
    var cx = 17, cy = 17;
    g.strokeStyle = 'rgba(0,0,0,0.55)';
    g.lineWidth = 1.4;
    switch (kind) {
      case 'sword':
        g.strokeStyle = '#c8ccd4';
        g.lineWidth = 3.4;
        g.beginPath();
        g.moveTo(8, 26);
        g.lineTo(25, 9);
        g.stroke();
        g.strokeStyle = '#aeb4bd';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(23.4, 7);
        g.lineTo(26.6, 10.2);
        g.stroke();
        g.fillStyle = '#8a6b32';
        g.beginPath();
        g.moveTo(6, 27);
        g.lineTo(11, 24);
        g.lineTo(12, 29);
        g.closePath();
        g.fill();
        break;
      case 'axe':
        g.fillStyle = '#8a6b45';
        g.fillRect(7, 10, 3.4, 18);
        g.fillStyle = '#9aa2ac';
        g.beginPath();
        g.moveTo(9, 12);
        g.quadraticCurveTo(19, 8, 22, 4);
        g.quadraticCurveTo(16, 9, 12, 10);
        g.closePath();
        g.fill();
        break;
      case 'mace':
        g.fillStyle = '#6a5a3e';
        g.fillRect(7, 14, 3.6, 14);
        g.fillStyle = '#8e939c';
        g.beginPath();
        g.arc(9, 11, 6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#5a5f68';
        for (var i = 0; i < 3; i++) {
          var a = i * Math.PI / 3 + 0.4;
          g.beginPath();
          g.moveTo(9 + Math.cos(a) * 5, 11 + Math.sin(a) * 5);
          g.lineTo(9 + Math.cos(a) * 7.4, 11 + Math.sin(a) * 7.4);
          g.stroke();
        }
        break;
      case 'dagger':
        g.strokeStyle = '#c8ccd4';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(12, 22);
        g.lineTo(23, 11);
        g.stroke();
        g.strokeStyle = '#b8bdc6';
        g.lineWidth = 4.4;
        g.beginPath();
        g.moveTo(22, 9);
        g.lineTo(25, 12);
        g.stroke();
        g.fillStyle = '#8a6b32';
        g.beginPath();
        g.moveTo(10, 23);
        g.lineTo(14, 21);
        g.lineTo(14.6, 25);
        g.closePath();
        g.fill();
        break;
      case 'staff':
        g.fillStyle = '#6a5232';
        g.fillRect(15, 6, 3, 22);
        g.fillStyle = '#7a5ad8';
        g.beginPath();
        g.arc(16.5, 7, 5.4, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.beginPath();
        g.arc(14.6, 5.4, 1.8, 0, Math.PI * 2);
        g.fill();
        break;
      case 'armor':
        g.fillStyle = '#7d8794';
        g.beginPath();
        g.moveTo(9, 10);
        g.lineTo(25, 10);
        g.lineTo(27, 16);
        g.quadraticCurveTo(17, 21, 7, 16);
        g.closePath();
        g.fill();
        g.fillStyle = '#6a7481';
        g.fillRect(8, 18, 18, 7);
        g.strokeStyle = '#4d5561';
        g.beginPath();
        g.moveTo(12, 18);
        g.lineTo(12, 25);
        g.moveTo(22, 18);
        g.lineTo(22, 25);
        g.stroke();
        break;
      case 'helm':
        g.fillStyle = '#8a939e';
        g.beginPath();
        g.arc(17, 16, 10, Math.PI * 0.95, Math.PI * 2.05);
        g.closePath();
        g.fill();
        g.fillStyle = '#6a7380';
        g.fillRect(6, 16, 22, 6);
        g.fillStyle = '#2a2e34';
        g.fillRect(12, 16, 10, 3);
        g.fillStyle = '#b9c1cc';
        g.fillRect(8, 10, 3, 10);
        break;
      case 'shield':
        g.fillStyle = '#7d8794';
        g.beginPath();
        g.moveTo(17, 6);
        g.lineTo(26, 9);
        g.lineTo(26, 18);
        g.quadraticCurveTo(26, 27, 17, 29);
        g.quadraticCurveTo(8, 27, 8, 18);
        g.lineTo(8, 9);
        g.closePath();
        g.fill();
        g.strokeStyle = '#555f6b';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(17, 8);
        g.lineTo(24, 10.5);
        g.lineTo(24, 18);
        g.quadraticCurveTo(24, 25, 17, 27);
        g.stroke();
        break;
      case 'ring':
        g.strokeStyle = '#d4b95c';
        g.lineWidth = 3.6;
        g.beginPath();
        g.arc(17, 17, 7, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = '#7a5ad8';
        g.beginPath();
        g.moveTo(17, 10);
        g.lineTo(19.4, 14);
        g.lineTo(17, 18);
        g.lineTo(14.6, 14);
        g.closePath();
        g.fill();
        break;
      case 'amulet':
        g.strokeStyle = '#c9b87a';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(17, 12, 7, Math.PI * 0.9, Math.PI * 2.1);
        g.stroke();
        g.fillStyle = '#5fd0a0';
        g.beginPath();
        g.moveTo(17, 14);
        g.lineTo(21, 20);
        g.lineTo(17, 26);
        g.lineTo(13, 20);
        g.closePath();
        g.fill();
        g.fillStyle = '#d4b95c';
        g.fillRect(16, 11, 2, 4);
        break;
      case 'potionH':
        g.fillStyle = 'rgba(200,60,60,0.9)';
        g.beginPath();
        g.moveTo(11, 6);
        g.lineTo(23, 6);
        g.lineTo(23, 10);
        g.quadraticCurveTo(25, 14, 24, 20);
        g.quadraticCurveTo(22, 28, 17, 28);
        g.quadraticCurveTo(12, 28, 10, 20);
        g.quadraticCurveTo(9, 14, 11, 10);
        g.closePath();
        g.fill();
        g.fillStyle = '#a84343';
        g.fillRect(11, 6, 12, 4);
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillRect(13, 12, 3, 10);
        break;
      case 'potionM':
        g.fillStyle = 'rgba(70,110,200,0.92)';
        g.beginPath();
        g.moveTo(11, 6);
        g.lineTo(23, 6);
        g.lineTo(23, 10);
        g.quadraticCurveTo(25, 14, 24, 20);
        g.quadraticCurveTo(22, 28, 17, 28);
        g.quadraticCurveTo(12, 28, 10, 20);
        g.quadraticCurveTo(9, 14, 11, 10);
        g.closePath();
        g.fill();
        g.fillStyle = '#33507d';
        g.fillRect(11, 6, 12, 4);
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillRect(13, 12, 3, 10);
        break;
      case 'gold':
        for (var i2 = 0; i2 < 6; i2++) {
          g.fillStyle = i2 % 2 ? '#d9b443' : '#b8912e';
          g.beginPath();
          g.ellipse(11 + i2 * 4.6, 22 - (i2 % 3) * 3, 4.6, 3, 0, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.beginPath();
        g.ellipse(12, 18, 3, 2, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case 'censer':
        g.fillStyle = '#c9a24a';
        g.beginPath();
        g.arc(17, 13, 6, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#e6cf7a';
        g.beginPath();
        g.arc(15, 11, 2.2, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#a5822e';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(17, 13, 6, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = '#c9a24a';
        g.beginPath();
        g.moveTo(14, 19);
        g.lineTo(20, 19);
        g.lineTo(17, 26);
        g.closePath();
        g.fill();
        break;
      case 'relic':
        g.fillStyle = '#8a8a96';
        g.beginPath();
        g.moveTo(12, 26);
        g.lineTo(17, 8);
        g.lineTo(22, 26);
        g.closePath();
        g.fill();
        g.strokeStyle = '#d4b95c';
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(13.4, 22);
        g.lineTo(20.6, 22);
        g.moveTo(14.8, 17);
        g.lineTo(19.2, 17);
        g.stroke();
        g.fillStyle = 'rgba(255,214,130,0.8)';
        g.beginPath();
        g.arc(17, 12, 2.4, 0, Math.PI * 2);
        g.fill();
        break;
      case 'scroll':
        g.fillStyle = '#d8cfae';
        g.fillRect(10, 8, 14, 18);
        g.fillStyle = '#b8ab82';
        g.fillRect(10, 8, 14, 3.4);
        g.fillRect(10, 23, 14, 3.4);
        g.strokeStyle = '#7a6c48';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(13, 12);
        g.lineTo(21, 12);
        g.moveTo(13, 15);
        g.lineTo(19, 15);
        g.stroke();
        break;
      default:
        g.fillStyle = '#8a8a96';
        g.fillRect(9, 9, 16, 16);
    }
    return c;
  }

  function abilityIcon(name) {
    var c = Util.makeCanvas(40, 40);
    var g = c.getContext('2d');
    var cx = 20, cy = 20;
    switch (name) {
      case 'firebolt':
        var grd = g.createRadialGradient(cx, cy + 4, 2, cx, cy + 4, 14);
        grd.addColorStop(0, '#ffdf80');
        grd.addColorStop(0.5, '#ff8c30');
        grd.addColorStop(1, 'rgba(200,50,20,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.arc(cx, cy + 4, 14, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#fff2c0';
        g.beginPath();
        g.moveTo(cx, cy - 8);
        g.quadraticCurveTo(cx + 5, cy - 4, cx + 3, cy + 3);
        g.quadraticCurveTo(cx, cy - 1, cx - 3, cy + 3);
        g.quadraticCurveTo(cx - 5, cy - 4, cx, cy - 8);
        g.closePath();
        g.fill();
        break;
      case 'nova':
        g.strokeStyle = '#ff9c40';
        g.lineWidth = 3;
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
          g.lineTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
          g.stroke();
        }
        g.fillStyle = '#ffd97a';
        g.beginPath();
        g.arc(cx, cy, 5.4, 0, Math.PI * 2);
        g.fill();
        break;
      case 'heal':
        g.strokeStyle = '#5fd0a0';
        g.lineWidth = 3.6;
        g.beginPath();
        g.arc(cx, cy, 13, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = '#8ff0c0';
        g.beginPath();
        g.moveTo(cx - 3, cy - 8);
        g.lineTo(cx + 3, cy - 8);
        g.lineTo(cx + 3, cy - 3);
        g.lineTo(cx + 8, cy - 3);
        g.lineTo(cx + 8, cy + 3);
        g.lineTo(cx + 3, cy + 3);
        g.lineTo(cx + 3, cy + 8);
        g.lineTo(cx - 3, cy + 8);
        g.lineTo(cx - 3, cy + 3);
        g.lineTo(cx - 8, cy + 3);
        g.lineTo(cx - 8, cy - 3);
        g.lineTo(cx - 3, cy - 3);
        g.closePath();
        g.fill();
        break;
      default:
        g.fillStyle = '#888';
        g.fillRect(6, 6, 28, 28);
    }
    return c;
  }

  var cache = {};
  function tree(variant) {
    var k = 'tree' + variant;
    if (!cache[k]) cache[k] = makeTree(variant);
    return cache[k];
  }
  function rock(variant) {
    var k = 'rock' + variant;
    if (!cache[k]) cache[k] = makeRock(variant);
    return cache[k];
  }
  function bush() { if (!cache.bush) cache.bush = makeBush(); return cache.bush; }
  function tombstone(variant) {
    var k = 'tomb' + variant;
    if (!cache[k]) cache[k] = makeTombstone(variant);
    return cache[k];
  }
  function pillar(variant) {
    var k = 'pillar' + variant;
    if (!cache[k]) cache[k] = makePillar(variant);
    return cache[k];
  }
  function brazier() { if (!cache.brazier) cache.brazier = makeBrazier(); return cache.brazier; }
  function torchSconce() { if (!cache.torchSconce) cache.torchSconce = makeTorchSconce(); return cache.torchSconce; }
  function altar() { if (!cache.altar) cache.altar = makeAltar(); return cache.altar; }
  function throne() { if (!cache.throne) cache.throne = makeThrone(); return cache.throne; }
  function fountain() { if (!cache.fountain) cache.fountain = makeFountain(); return cache.fountain; }
  function well() { if (!cache.well) cache.well = makeWell(); return cache.well; }
  function stall() { if (!cache.stall) cache.stall = makeStall(); return cache.stall; }
  function rubble() { if (!cache.rubble) cache.rubble = makeRubble(); return cache.rubble; }
  function shrine() { if (!cache.shrine) cache.shrine = makeShrine(); return cache.shrine; }
  function pew() { if (!cache.pew) cache.pew = makePew(); return cache.pew; }
  function sarc(variant) {
    var k = 'sarc' + (variant % 2);
    if (!cache[k]) cache[k] = makeSarc(variant % 2);
    return cache[k];
  }
  function bones() { if (!cache.bones) cache.bones = makeBones(); return cache.bones; }
  function torchFloor() { if (!cache.torchFloor) cache.torchFloor = makeTorchFloor(); return cache.torchFloor; }
  function anvil() { if (!cache.anvil) cache.anvil = makeAnvil(); return cache.anvil; }
  function barrel() { if (!cache.barrel) cache.barrel = makeBarrel(); return cache.barrel; }
  function hay() { if (!cache.hay) cache.hay = makeHay(); return cache.hay; }
  function cart() { if (!cache.cart) cache.cart = makeCart(); return cache.cart; }
  function gateBars(sealed) {
    var k = 'gatebars' + (sealed ? 1 : 0);
    if (!cache[k]) cache[k] = makeGateBars(sealed);
    return cache[k];
  }
  function house(dx, dy, style) {
    var k = 'house' + dx + 'x' + dy + '-' + (style && style.id ? style.id : 'a');
    if (!cache[k]) cache[k] = building(dx, dy, style);
    return cache[k];
  }
  function cathedral(dx, dy) {
    var k = 'cathedral' + dx + 'x' + dy;
    if (!cache[k]) cache[k] = cathedralExterior(dx, dy);
    return cache[k];
  }
  function icon(kind) {
    var k = 'icon' + kind;
    if (!cache[k]) cache[k] = itemIcon(kind);
    return cache[k];
  }
  function abiIcon(name) {
    var k = 'abi' + name;
    if (!cache[k]) cache[k] = abilityIcon(name);
    return cache[k];
  }
  function actor(opts) {
    // no caching for actors with unique options; cache by JSON key
    var k = 'act' + JSON.stringify(opts);
    if (!cache[k]) cache[k] = humanoid(opts);
    return cache[k];
  }
  function wolfActor(opts) {
    var k = 'wolf' + (opts.fur || '');
    if (!cache[k]) cache[k] = wolf(opts);
    return cache[k];
  }
  function corpseSpr(kind) {
    var k = 'corpse' + kind;
    if (!cache[k]) cache[k] = corpse(kind);
    return cache[k];
  }

  return {
    glow: glow, flames: flames,
    tree: tree, rock: rock, bush: bush, tombstone: tombstone, pillar: pillar,
    brazier: brazier, torchSconce: torchSconce, altar: altar, throne: throne,
    fountain: fountain, well: well, stall: stall, rubble: rubble, shrine: shrine,
    pew: pew, sarc: sarc, bones: bones, torchFloor: torchFloor, anvil: anvil,
    barrel: barrel, hay: hay, cart: cart,
    gateBars: gateBars, house: house, cathedral: cathedral,
    icon: icon, abiIcon: abiIcon, actor: actor, wolfActor: wolfActor, corpseSpr: corpseSpr
  };
})();

'use strict';
/* ============================================================
   Emberfall - 04_gen.js : world generation
   town (fixed), wilderness (per-run), cathedral/crypt mazes,
   boss arenas. All deterministic per area seed.
   ============================================================ */
var Gen = (function () {

  var T = CFG.T;

  /* ---------- transition pair table (spatial continuity) ---------- */
  var PAIRS = [
    { a: 'town', t: 'gateE', b: 'wild', u: 'gateW' },
    { a: 'town', t: 'gateS', b: 'wild', u: 'gateN' },
    { a: 'town', t: 'cathDoor', b: 'cath1', u: 'doorS' },
    { a: 'cath1', t: 'doorX', b: 'wild', u: 'chapelDoor' },
    { a: 'cath1', t: 'stairUp', b: 'cath2', u: 'stairDn' },
    { a: 'cath1', t: 'doorStairB1', b: 'b1', u: 'stairUp' },
    { a: 'cath2', t: 'stairUp', b: 'cath3', u: 'stairDn' },
    { a: 'b1', t: 'cave', b: 'wild', u: 'cave' },
    { a: 'b1', t: 'stairDn', b: 'b2', u: 'stairUp' },
    { a: 'b2', t: 'stairDn', b: 'b3', u: 'stairUp' },
    { a: 'b3', t: 'stairDn', b: 'b4', u: 'stairUp' }
  ];
  var PAIRMAP = {};
  for (var pi = 0; pi < PAIRS.length; pi++) {
    var P = PAIRS[pi];
    PAIRMAP[P.a + '.' + P.t] = { b: P.b, u: P.u };
    PAIRMAP[P.b + '.' + P.u] = { b: P.a, u: P.t };
  }

  /* ---------- helpers ---------- */
  function setF(a, x, y) {
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return;
    a.grid[y * a.w + x] = T.FLOOR;
  }
  function isF(a, x, y) {
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return false;
    return a.grid[y * a.w + x] === T.FLOOR;
  }
  function isW(a, x, y) {
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return true;
    return a.grid[y * a.w + x] === T.WALL;
  }
  function gridVal(a, x, y) {
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return T.WALL;
    return a.grid[y * a.w + x];
  }
  function propAt(a, x, y) {
    for (var i = 0; i < a.props.length; i++) {
      var p = a.props[i];
      if (p.block && p.x === x && p.y === y) return true;
    }
    return false;
  }
  function floorFree(a, x, y) {
    return isF(a, x, y) && !propAt(a, x, y);
  }
  function dist(x1, y1, x2, y2) {
    var dx = x1 - x2, dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* connect an isolated floor component to a DIFFERENT floor component */
  function connectCell(a, x, y) {
    var w = a.w, h = a.h;
    // 1. flood the start cell's own floor component
    var comp = new Uint8Array(w * h);
    var q = [[x, y]];
    comp[y * w + x] = 1;
    var head = 0;
    while (head < q.length) {
      var cur = q[head++];
      var cx = cur[0], cy = cur[1];
      var nbs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (var i = 0; i < 4; i++) {
        var nx = nbs[i][0], ny = nbs[i][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (comp[ny * w + nx]) continue;
        if (isF(a, nx, ny)) {
          comp[ny * w + nx] = 1;
          q.push([nx, ny]);
        }
      }
    }
    // 2. BFS through walls from the start until hitting a floor cell of another component
    var seen = new Uint8Array(w * h);
    var wq = [[x, y]];
    seen[y * w + x] = 1;
    var whead = 0, target = null;
    while (whead < wq.length) {
      var wc = wq[whead++];
      var wcx = wc[0], wcy = wc[1];
      var wnbs = [[wcx + 1, wcy], [wcx - 1, wcy], [wcx, wcy + 1], [wcx, wcy - 1]];
      for (var j = 0; j < 4; j++) {
        var nx2 = wnbs[j][0], ny2 = wnbs[j][1];
        if (nx2 < 0 || ny2 < 0 || nx2 >= w || ny2 >= h) continue;
        if (seen[ny2 * w + nx2]) continue;
        seen[ny2 * w + nx2] = 1;
        if (isF(a, nx2, ny2)) {
          if (!comp[ny2 * w + nx2]) { target = [nx2, ny2]; break; }
        } else {
          wq.push([nx2, ny2]);
        }
      }
      if (target) break;
    }
    if (!target) return;
    // 3. carve a straight-ish corridor from (x,y) toward target
    var tx = target[0], ty = target[1];
    var cx2 = x, cy2 = y;
    var guard = 0;
    while ((cx2 !== tx || cy2 !== ty) && guard++ < 400) {
      setF(a, cx2, cy2);
      if (cx2 !== tx && (Math.abs(cx2 - tx) >= Math.abs(cy2 - ty) || cy2 === ty)) {
        cx2 += cx2 < tx ? 1 : -1;
      } else {
        cy2 += cy2 < ty ? 1 : -1;
      }
    }
    setF(a, cx2, cy2);
  }

  function ensureConnected(a) {
    var w = a.w, h = a.h;
    // find first floor
    var start = null;
    for (var y = 0; y < h && !start; y++) {
      for (var x = 0; x < w; x++) {
        if (isF(a, x, y)) { start = [x, y]; break; }
      }
    }
    if (!start) return;
    var seen = new Uint8Array(w * h);
    var q = [start];
    seen[start[1] * w + start[0]] = 1;
    var head = 0;
    while (head < q.length) {
      var cur = q[head++];
      var cx = cur[0], cy = cur[1];
      var nbs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (var i = 0; i < 4; i++) {
        var nx = nbs[i][0], ny = nbs[i][1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (seen[ny * w + nx]) continue;
        if (isF(a, nx, ny)) {
          seen[ny * w + nx] = 1;
          q.push([nx, ny]);
        }
      }
    }
    // connect unreachable floor cells
    for (var y2 = 0; y2 < h; y2++) {
      for (var x2 = 0; x2 < w; x2++) {
        if (isF(a, x2, y2) && !seen[y2 * w + x2]) connectCell(a, x2, y2);
      }
    }
  }

  /* remove blocking props that would disconnect the walkable graph */
  function fixWalkable(a) {
    for (var iter = 0; iter < 80; iter++) {
      var w = a.w, h = a.h;
      var start = null;
      for (var y = 0; y < h && !start; y++) {
        for (var x = 0; x < w; x++) {
          if (!propAt(a, x, y) && gridVal(a, x, y) === T.FLOOR) { start = [x, y]; break; }
        }
      }
      if (!start) return;
      var seen = new Uint8Array(w * h);
      var q = [start];
      seen[start[1] * w + start[0]] = 1;
      var head = 0;
      while (head < q.length) {
        var cur = q[head++];
        var cx = cur[0], cy = cur[1];
        var nbs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (var i = 0; i < 4; i++) {
          var nx = nbs[i][0], ny = nbs[i][1];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (seen[ny * w + nx]) continue;
          if (!propAt(a, nx, ny) && gridVal(a, nx, ny) === T.FLOOR) {
            seen[ny * w + nx] = 1;
            q.push([nx, ny]);
          }
        }
      }
      // any blocking prop bordering an unreachable walkable cell? remove it
      var removed = false;
      for (var i2 = 0; i2 < a.props.length; i2++) {
        var p = a.props[i2];
        if (!p.block) continue;
        var nu = 0;
        var pnbs = [[p.x + 1, p.y], [p.x - 1, p.y], [p.x, p.y + 1], [p.x, p.y - 1]];
        for (var j = 0; j < 4; j++) {
          var nx2 = pnbs[j][0], ny2 = pnbs[j][1];
          if (nx2 < 0 || ny2 < 0 || nx2 >= w || ny2 >= h) continue;
          if (propAt(a, nx2, ny2)) continue;
          if (gridVal(a, nx2, ny2) !== T.FLOOR) continue;
          if (!seen[ny2 * w + nx2]) nu++;
        }
        if (nu > 0) {
          a.props.splice(i2, 1);
          removed = true;
          break;
        }
      }
      if (!removed) return;
    }
  }

  function addProp(a, type, x, y, opts) {
    opts = opts || {};
    var p = { type: type, x: x, y: y, block: !!opts.block, variant: opts.variant || 0 };
    if (opts.light) p.light = opts.light;
    if (opts.dx) p.dx = opts.dx;
    if (opts.dy) p.dy = opts.dy;
    if (opts.style) p.style = opts.style;
    a.props.push(p);
    if (p.light) a.lights.push({ x: x, y: y, color: p.light.color || 'torch', r: p.light.r || CFG.TORCH_R, flicker: !!p.light.flicker });
  }
  function clearPropAt(a, x, y) {
    for (var i = 0; i < a.props.length; i++) {
      var p = a.props[i];
      if (p.x === x && p.y === y) {
        a.props.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  function clearPropsNear(a, x, y, r) {
    for (var i = a.props.length - 1; i >= 0; i--) {
      var p = a.props[i];
      if (dist(p.x, p.y, x, y) < r) a.props.splice(i, 1);
    }
  }

  /* ---------- dungeon (cathedral / crypt) ---------- */
  function dungeon(a, opts) {
    var rng = new Util.RNG(a.seed);
    var w = a.w, h = a.h;
    a.grid.fill(T.WALL);
    for (var i = 0; i < w * h; i++) a.varr[i] = rng.range(0, 11);
    var x0 = rng.range(5, 11); if (x0 % 2) x0++;
    var y0 = rng.range(5, 11); if (y0 % 2) y0++;
    var x1 = w - 2 - rng.range(4, 10); if (x1 % 2) x1--;
    var y1 = h - 2 - rng.range(4, 10); if (y1 % 2) y1--;
    var rects = [[x0, y0, x1, y1]];
    // wings: rectilinear protrusions
    var wings = rng.range(2, 4);
    for (var wi = 0; wi < wings; wi++) {
      var side = rng.range(0, 3);
      if (side === 0) {
        var wx0 = rng.range(x0 + 2, x1 - 3), wx1 = Math.min(x1 - 1, wx0 + rng.range(2, 5));
        var wy0 = Math.max(1, y0 - 1 - rng.range(3, 6)), wy1 = y0 - 1;
        rects.push([wx0, wy0, wx1, wy1]);
      } else if (side === 1) {
        var sx0 = rng.range(x0 + 2, x1 - 3), sx1 = Math.min(x1 - 1, sx0 + rng.range(2, 5));
        var sy0 = y1 + 1, sy1 = Math.min(h - 2, y1 + 1 + rng.range(3, 6));
        rects.push([sx0, sy0, sx1, sy1]);
      } else if (side === 2) {
        var ex0 = x1 + 1, ex1 = Math.min(w - 2, x1 + 1 + rng.range(3, 6));
        var ey0 = rng.range(y0 + 2, y1 - 3), ey1 = Math.min(y1 - 1, ey0 + rng.range(2, 5));
        rects.push([ex0, ey0, ex1, ey1]);
      } else {
        var wx0b = Math.max(1, x0 - 1 - rng.range(3, 6)), wx1b = x0 - 1;
        var wy0b = rng.range(y0 + 2, y1 - 3), wy1b = Math.min(y1 - 1, wy0b + rng.range(2, 5));
        rects.push([wx0b, wy0b, wx1b, wy1b]);
      }
    }
    // notches: removed corner regions for irregular silhouette
    var notches = [];
    var nNotch = rng.range(1, 3);
    for (var ni = 0; ni < nNotch; ni++) {
      var corner = rng.range(0, 3);
      var nw = rng.range(4, 9), nh = rng.range(3, 7);
      if (corner === 0) notches.push([x0, y0, Math.min(x1, x0 + nw), Math.min(y1, y0 + nh)]);
      else if (corner === 1) notches.push([Math.max(x0, x1 - nw), y0, x1, Math.min(y1, y0 + nh)]);
      else if (corner === 2) notches.push([x0, Math.max(y0, y1 - nh), Math.min(x1, x0 + nw), y1]);
      else notches.push([Math.max(x0, x1 - nw), Math.max(y0, y1 - nh), x1, y1]);
    }
    var inFp = function (x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      for (var k = 0; k < notches.length; k++) {
        var N = notches[k];
        if (x >= N[0] && x <= N[2] && y >= N[1] && y <= N[3]) return false;
      }
      for (var r = 0; r < rects.length; r++) {
        var R = rects[r];
        if (x >= R[0] && x <= R[2] && y >= R[1] && y <= R[3]) return true;
      }
      return false;
    };
    // maze on odd cells (main rect); wings carved as small rooms
    var cells = [];
    for (var cy = y0 + 1; cy <= y1 - 1; cy += 2) {
      for (var cx = x0 + 1; cx <= x1 - 1; cx += 2) {
        if (inFp(cx, cy)) { setF(a, cx, cy); cells.push([cx, cy]); }
      }
    }
    for (var wj = 1; wj < rects.length; wj++) {
      var R = rects[wj];
      for (var ry = R[1] + 1; ry <= R[3] - 1; ry++) {
        for (var rx = R[0] + 1; rx <= R[2] - 1; rx++) {
          if (inFp(rx, ry)) setF(a, rx, ry);
        }
      }
    }
    // DFS maze carve
    Util.shuffle(cells, rng);
    var visited = {};
    var stack = [cells[0]];
    visited[cells[0][0] + ',' + cells[0][1]] = 1;
    var carved = 0;
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var cx = cur[0], cy = cur[1];
      var nbs = [];
      [[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(function (d) {
        var nx = cx + d[0], ny = cy + d[1];
        if (nx > x0 && nx < x1 && ny > y0 && ny < y1 && inFp(nx, ny) && !visited[nx + ',' + ny]) {
          nbs.push([nx, ny, d[0], d[1]]);
        }
      });
      if (nbs.length) {
        var nb = nbs[rng.range(0, nbs.length - 1)];
        setF(a, cx + nb[2] / 2, cy + nb[3] / 2);
        setF(a, nb[0], nb[1]);
        visited[nb[0] + ',' + nb[1]] = 1;
        stack.push([nb[0], nb[1]]);
        carved++;
      } else {
        stack.pop();
      }
    }
    // rooms
    var rooms = [];
    var nRooms = opts.rooms || (rng.range(3, 6) + (w >= 52 ? 1 : 0));
    for (var ri = 0; ri < nRooms; ri++) {
      var rw = rng.range(5, 9); if (rw % 2 === 0) rw++;
      var rh = rng.range(5, 7); if (rh % 2 === 0) rh++;
      var rx = 0, ry = 0, ok = false;
      for (var att = 0; att < 24; att++) {
        rx = rng.range(x0 + 1, Math.max(x0 + 2, x1 - rw - 2));
        ry = rng.range(y0 + 1, Math.max(y0 + 2, y1 - rh - 2));
        if (inFp(rx, ry) && inFp(rx + rw - 1, ry + rh - 1)) { ok = true; break; }
      }
      if (!ok) continue;
      var room = [rx, ry, rx + rw - 1, ry + rh - 1];
      for (var rr = ry; rr <= ry + rh - 1; rr++) {
        for (var cc = rx; cc <= rx + rw - 1; cc++) setF(a, cc, rr);
      }
      rooms.push(room);
    }
    // connect each room: corridor from a perimeter point to nearest floor outside room
    for (var ci = 0; ci < rooms.length; ci++) {
      var R2 = rooms[ci];
      var px = R2[0] + rng.range(1, R2[2] - R2[0] - 1);
      var py = R2[1] + rng.range(1, R2[3] - R2[1] - 1);
      // walk outward until floor outside room
      var dx = 0, dy = 0;
      if (rng.chance(0.5)) dx = rng.chance(0.5) ? 1 : -1; else dy = rng.chance(0.5) ? 1 : -1;
      var wx = px, wy = py;
      var found = false;
      for (var st = 0; st < 40; st++) {
        wx += dx; wy += dy;
        if (wx < x0 || wx > x1 || wy < y0 || wy > y1) break;
        if (isF(a, wx, wy) && (wx < R2[0] || wx > R2[2] || wy < R2[1] || wy > R2[3])) { found = true; break; }
        if (!inFp(wx, wy)) break;
      }
      if (found) {
        var lx = px, ly = py;
        var guard = 0;
        while ((lx !== wx || ly !== wy) && guard++ < 100) {
          setF(a, lx, ly);
          if (lx !== wx && (Math.abs(lx - wx) >= Math.abs(ly - wy) || ly === wy)) lx += lx < wx ? 1 : -1;
          else ly += ly < wy ? 1 : -1;
        }
      } else {
        connectCell(a, px, py);
      }
    }
    // loops: punch extra wall openings (kept sparse so corridors keep dead ends)
    for (var li = 0; li < 45; li++) {
      var lx2 = rng.range(x0 + 1, x1 - 1), ly2 = rng.range(y0 + 1, y1 - 1);
      if (!inFp(lx2, ly2) || !isW(a, lx2, ly2)) continue;
      var ew = isF(a, lx2 - 1, ly2) && isF(a, lx2 + 1, ly2);
      var ns = isF(a, lx2, ly2 - 1) && isF(a, lx2, ly2 + 1);
      if ((ew || ns) && rng.chance(0.15)) setF(a, lx2, ly2);
    }
    ensureConnected(a);

    /* --- transitions --- */
    a.doors = {};
    a.transitions = {};
    var placed = [];
    function placeOpen(id, kind, dir, opts2) {
      var best = null, bestScore = -1;
      for (var yy = y0 + 1; yy < y1; yy++) {
        for (var xx = x0 + 1; xx < x1; xx++) {
          if (!floorFree(a, xx, yy)) continue;
          var mind = 1e9;
          for (var k = 0; k < placed.length; k++) mind = Math.min(mind, dist(xx, yy, placed[k].x, placed[k].y));
          var score = Math.min(mind, 20);
          if (score > bestScore) { bestScore = score; best = [xx, yy]; }
        }
      }
      if (!best) best = [x0 + 2, y0 + 2];
      setF(a, best[0], best[1]);
      var tr = { id: id, kind: kind, x: best[0], y: best[1], dir: dir || 'down' };
      if (opts2) for (var k2 in opts2) tr[k2] = opts2[k2];
      a.transitions[id] = tr;
      placed.push({ x: best[0], y: best[1] });
      return tr;
    }
    function placeDoor(id, side, opts3) {
      var cands = [];
      if (side === 'south') {
        for (var xx = x0; xx <= x1; xx++) {
          if (isW(a, xx, y1) && inFp(xx, y1) && inFp(xx, y1 - 1)) cands.push([xx, y1]);
        }
      } else if (side === 'north') {
        for (var xx2 = x0; xx2 <= x1; xx2++) {
          if (isW(a, xx2, y0) && inFp(xx2, y0) && inFp(xx2, y0 + 1)) cands.push([xx2, y0]);
        }
      } else if (side === 'west') {
        for (var yy = y0; yy <= y1; yy++) {
          if (isW(a, x0, yy) && inFp(x0, yy) && inFp(x0 + 1, yy)) cands.push([x0, yy]);
        }
      } else {
        for (var yy2 = y0; yy2 <= y1; yy2++) {
          if (isW(a, x1, yy2) && inFp(x1, yy2) && inFp(x1 - 1, yy2)) cands.push([x1, yy2]);
        }
      }
      if (!cands.length) cands.push([x0 + 1, y0 + 1]);
      var bestC = null, bestScore = -1;
      for (var ci2 = 0; ci2 < cands.length; ci2++) {
        var c = cands[ci2];
        var mind = 1e9;
        for (var k3 = 0; k3 < placed.length; k3++) mind = Math.min(mind, dist(c[0], c[1], placed[k3].x, placed[k3].y));
        if (mind > bestScore) { bestScore = mind; bestC = c; }
      }
      var bx = bestC[0], by = bestC[1];
      // interior neighbor
      var ix = bx, iy = by;
      if (side === 'south') iy = by - 1; else if (side === 'north') iy = by + 1; else if (side === 'west') ix = bx + 1; else ix = bx - 1;
      var ox = bx - (ix - bx), oy = by - (iy - by);
      setF(a, ix, iy);
      connectCell(a, ix, iy);
      var did = opts3.id;
      a.doors[did] = {
        id: did, x: bx, y: by, open: false,
        in: { x: ix, y: iy }, out: { x: ox, y: oy },
        double: !!opts3.double, exterior: !!opts3.exterior, locked: !!opts3.locked,
        sealed: !!opts3.sealed, stairsBehind: !!opts3.stairsBehind, isInside: !!opts3.isInside
      };
      var tr = { id: did, kind: opts3.kind || 'door', x: bx, y: by, doorId: did, dir: side };
      a.transitions[did] = tr;
      placed.push({ x: bx, y: by });
      return tr;
    }
    var tcfg = opts.trans;
    for (var ti = 0; ti < tcfg.length; ti++) {
      var tc = tcfg[ti];
      if (tc.kind === 'stairs' || tc.kind === 'cave') placeOpen(tc.id, tc.kind, tc.dir, {});
      else if (tc.kind === 'doorstair') {
        var sidePick = tc.side || ['south', 'north', 'east', 'west'][rng.range(0, 3)];
        placeDoor(tc.id, sidePick, { id: tc.id, kind: 'door', stairsBehind: true, double: false });
      } else {
        placeDoor(tc.id, tc.side, { id: tc.id, kind: tc.kind, double: !!tc.double, exterior: !!tc.exterior, isInside: !!tc.isInside });
      }
    }

    /* --- decor --- */
    // pillars in big rooms
    for (var rm = 0; rm < rooms.length; rm++) {
      var RR = rooms[rm];
      if (RR[2] - RR[0] >= 6 && RR[3] - RR[1] >= 4) {
        var nP = rng.range(1, 2);
        for (var pp = 0; pp < nP; pp++) {
          var pxx = RR[0] + 2 + rng.range(0, RR[2] - RR[0] - 4);
          var pyy = RR[1] + 2 + rng.range(0, RR[3] - RR[1] - 4);
          if (floorFree(a, pxx, pyy)) addProp(a, 'pillar', pxx, pyy, { block: true, variant: rng.range(0, 2) });
        }
      }
      // sarcophagi / pews
      var deco = opts.deco === 'pew' ? 'pew' : 'sarc';
      var nD = rng.range(2, 5);
      for (var dd = 0; dd < nD; dd++) {
        var dxx = RR[0] + 1 + rng.range(0, RR[2] - RR[0] - 1);
        var dyy = RR[1] + 1 + rng.range(0, RR[3] - RR[1] - 1);
        if (floorFree(a, dxx, dyy)) {
          addProp(a, deco, dxx, dyy, { block: deco === 'sarc', variant: rng.range(0, 3) });
        }
      }
    }
    // wall torches + braziers
    var nLights = rng.range(6, 10);
    for (var lg = 0; lg < nLights * 3; lg++) {
      var lxx = rng.range(x0 + 1, x1 - 1), lyy = rng.range(y0 + 1, y1 - 1);
      if (!isF(a, lxx, lyy) || propAt(a, lxx, lyy)) continue;
      var nearWall = isW(a, lxx - 1, lyy) || isW(a, lxx + 1, lyy) || isW(a, lxx, lyy - 1) || isW(a, lxx, lyy + 1);
      if (nearWall && rng.chance(0.5)) {
        addProp(a, 'torch', lxx, lyy, { light: { color: 'torch', r: CFG.TORCH_R, flicker: true } });
        if (--nLights <= 0) break;
      }
    }
    // rubble / bones scatter
    for (var rb = 0; rb < rng.range(4, 9); rb++) {
      var rx3 = rng.range(x0 + 1, x1 - 1), ry3 = rng.range(y0 + 1, y1 - 1);
      if (floorFree(a, rx3, ry3) && !isNearTrans(a, rx3, ry3, 1.5)) {
        addProp(a, rng.chance(0.5) ? 'rubble' : 'bones', rx3, ry3, { block: false });
      }
    }
    // chests
    var nChest = opts.chests || rng.range(1, 3);
    var chestTries = 0;
    while (a.chests.length < nChest && chestTries++ < 200) {
      if (!rooms.length) break;
      var RR2 = rooms[rng.range(0, rooms.length - 1)];
      var cxx = RR2[0] + 1 + rng.range(0, RR2[2] - RR2[0] - 1);
      var cyy = RR2[1] + 1 + rng.range(0, RR2[3] - RR2[1] - 1);
      if (!floorFree(a, cxx, cyy)) continue;
      if (isNearTrans(a, cxx, cyy, 4)) continue;
      a.chests.push({ id: 'chest' + a.chests.length, x: cxx, y: cyy, open: false, seed: Util.hashStr(a.seed + ':chest' + a.chests.length) });
      addProp(a, 'chest', cxx, cyy, { block: true });
    }
    /* --- enemies --- */
    var spawnCounts = opts.enemies;
    var spawnCells = [];
    for (var sy = y0 + 1; sy < y1; sy++) {
      for (var sxx = x0 + 1; sxx < x1; sxx++) {
        if (!floorFree(a, sxx, sy)) continue;
        if (isNearTrans(a, sxx, sy, 8)) continue;
        spawnCells.push([sxx, sy]);
      }
    }
    Util.shuffle(spawnCells, rng);
    var si = 0;
    for (var e = 0; e < spawnCounts.length; e++) {
      for (var n2 = 0; n2 < spawnCounts[e].n; n2++) {
        if (si >= spawnCells.length) break;
        a.spawns.push({ type: spawnCounts[e].type, x: spawnCells[si][0], y: spawnCells[si][1] });
        si++;
      }
    }
    a.boss = opts.boss || null;
    fixWalkable(a);
  }

  function isNearTrans(a, x, y, r) {
    for (var id in a.transitions) {
      var t = a.transitions[id];
      if (dist(t.x, t.y, x, y) < r) return true;
    }
    return false;
  }

  /* ---------- cathedral high chancel (boss arena, cath3) ---------- */
  function chancel(a) {
    var rng = new Util.RNG(a.seed);
    a.grid.fill(T.WALL);
    for (var i = 0; i < a.w * a.h; i++) a.varr[i] = rng.range(0, 11);
    var x0 = 3, y0 = 3, x1 = a.w - 4, y1 = a.h - 4;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) setF(a, x, y);
    }
    // column aisles
    for (var cy = y0 + 3; cy < y1 - 1; cy += 5) {
      addProp(a, 'pillar', x0 + 4, cy, { block: true, variant: rng.range(0, 2) });
      addProp(a, 'pillar', x1 - 4, cy, { block: true, variant: rng.range(0, 2) });
    }
    // braziers ring
    var midx = (x0 + x1) / 2, midy = (y0 + y1) / 2;
    for (var b = 0; b < 8; b++) {
      var ang = b * Math.PI / 4;
      var bx = Math.round(midx + Math.cos(ang) * 8);
      var by = Math.round(midy + Math.sin(ang) * 4.5);
      if (isF(a, bx, by) && !propAt(a, bx, by)) {
        addProp(a, 'brazier', bx, by, { light: { color: 'torch', r: CFG.TORCH_R, flicker: true } });
      }
    }
    // altar north with censer
    var ax = Math.round(midx), ay = y0 + 2;
    addProp(a, 'altar', ax, ay, { block: true });
    a.altar = { x: ax, y: ay, taken: false, locked: true };
    // rubble decor
    for (var r = 0; r < 6; r++) {
      var rx = rng.range(x0 + 1, x1 - 1), ry = rng.range(y0 + 1, y1 - 1);
      if (isF(a, rx, ry) && !propAt(a, rx, ry)) addProp(a, 'rubble', rx, ry, { block: false });
    }
    // stairs down (from cath2) at south
    var stx = Math.round(midx), sty = y1 - 2;
    a.transitions = { stairDn: { id: 'stairDn', kind: 'stairs', x: stx, y: sty, dir: 'down' } };
    a.doors = {};
    a.boss = { type: 'cantor', x: Math.round(midx), y: Math.round(midy) };
  }

  /* ---------- charnel throne (boss arena, b4) ---------- */
  function throne(a) {
    var rng = new Util.RNG(a.seed);
    a.grid.fill(T.WALL);
    for (var i = 0; i < a.w * a.h; i++) a.varr[i] = rng.range(0, 11);
    var x0 = 3, y0 = 3, x1 = a.w - 4, y1 = a.h - 4;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) setF(a, x, y);
    }
    var midx = (x0 + x1) / 2, midy = (y0 + y1) / 2;
    // pillar ring
    for (var b = 0; b < 10; b++) {
      var ang = b * Math.PI / 5 + 0.3;
      var bx = Math.round(midx + Math.cos(ang) * 10);
      var by = Math.round(midy + Math.sin(ang) * 5);
      if (isF(a, bx, by)) addProp(a, 'pillar', bx, by, { block: true, variant: rng.range(0, 2) });
    }
    // braziers
    for (var b2 = 0; b2 < 6; b2++) {
      var ang2 = b2 * Math.PI / 3;
      var bx2 = Math.round(midx + Math.cos(ang2) * 13);
      var by2 = Math.round(midy + Math.sin(ang2) * 6.5);
      if (isF(a, bx2, by2) && !propAt(a, bx2, by2)) {
        addProp(a, 'brazier', bx2, by2, { light: { color: 'torch', r: CFG.TORCH_R, flicker: true } });
      }
    }
    // throne at north
    var thx = Math.round(midx), thy = y0 + 2;
    addProp(a, 'throne', thx, thy, { block: true });
    // vault behind north wall: gate on north wall, room beyond
    var gx = Math.round(midx), gy = y0; // north border row
    a.doors = {};
    a.doors.vault = {
      id: 'vault', x: gx, y: gy, open: false, sealed: true,
      in: { x: gx, y: gy - 1 }, out: { x: gx, y: gy + 1 }
    };
    // carve vault room north of the gate
    for (var vy = gy - 5; vy <= gy - 1; vy++) {
      for (var vx = gx - 3; vx <= gx + 3; vx++) setF(a, vx, vy);
    }
    a.chests.push({ id: 'vault0', x: gx - 2, y: gy - 3, open: false, seed: Util.hashStr(a.seed + ':vault0') });
    a.chests.push({ id: 'vault1', x: gx, y: gy - 3, open: false, seed: Util.hashStr(a.seed + ':vault1') });
    a.chests.push({ id: 'vault2', x: gx + 2, y: gy - 3, open: false, seed: Util.hashStr(a.seed + ':vault2') });
    addProp(a, 'chest', gx - 2, gy - 3, { block: true });
    addProp(a, 'chest', gx, gy - 3, { block: true });
    addProp(a, 'chest', gx + 2, gy - 3, { block: true });
    // bones decor
    for (var r = 0; r < 10; r++) {
      var rx = rng.range(x0 + 1, x1 - 1), ry = rng.range(y0 + 1, y1 - 1);
      if (isF(a, rx, ry) && !propAt(a, rx, ry)) addProp(a, 'bones', rx, ry, { block: false });
    }
    // stairs up (to b3) at south
    var stx = Math.round(midx), sty = y1 - 2;
    a.transitions = { stairUp: { id: 'stairUp', kind: 'stairs', x: stx, y: sty, dir: 'up' } };
    a.boss = { type: 'marrow', x: Math.round(midx), y: Math.round(midy + 2) };
  }

  /* ---------- wilderness ---------- */
  function wild(a) {
    var rng = new Util.RNG(a.seed);
    var w = a.w, h = a.h;
    a.grid.fill(T.FLOOR);
    for (var i = 0; i < w * h; i++) a.varr[i] = rng.range(0, 11);
    // fixed transition anchors
    var gateW = { x: 1, y: 34 };
    var gateN = { x: 34, y: 1 };
    var chapel = { x: 46, y: 22 };
    var cave = { x: 58, y: 52 };
    var graveyard = { x: 26, y: 44 };
    var shrinePt = { x: 16, y: 14 };
    // pond
    var pond = { x: 42, y: 44, rx: 6, ry: 4 };
    var pond2 = { x: 14, y: 52, rx: 4, ry: 3 };
    [pond, pond2].forEach(function (p) {
      for (var y = p.y - p.ry; y <= p.y + p.ry; y++) {
        for (var x = p.x - p.rx; x <= p.x + p.rx; x++) {
          if (x < 0 || y < 0 || x >= w || y >= h) continue;
          var d = Math.pow((x - p.x) / p.rx, 2) + Math.pow((y - p.y) / p.ry, 2);
          if (d <= 1 + rng.jitter(0, 0.15)) {
            a.grid[y * w + x] = T.WATER;
            a.floorTheme[y * w + x] = 0;
          }
        }
      }
    });
    // dirt roads: gateW -> chapel -> gateN, and chapel -> cave
    function road(from, to) {
      var cx = from.x, cy = from.y;
      var guard = 0;
      while ((cx !== to.x || cy !== to.y) && guard++ < 300) {
        for (var ddx = -1; ddx <= 1; ddx++) {
          for (var ddy = -1; ddy <= 1; ddy++) {
            var nx = cx + ddx, ny = cy + ddy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (a.grid[ny * w + nx] !== T.WATER) a.floorTheme[ny * w + nx] = 1; // dirt
          }
        }
        var dirs = [];
        if (cx < to.x) dirs.push([1, 0]); else if (cx > to.x) dirs.push([-1, 0]);
        if (cy < to.y) dirs.push([0, 1]); else if (cy > to.y) dirs.push([0, -1]);
        var d = dirs[rng.range(0, dirs.length - 1)];
        if (rng.chance(0.35)) d = dirs[rng.range(0, dirs.length - 1)];
        cx += d[0]; cy += d[1];
      }
    }
    road(gateW, chapel);
    road({ x: chapel.x - 2, y: chapel.y }, gateN);
    road({ x: chapel.x, y: chapel.y + 1 }, cave);
    // chapel ruin: free-standing wall with exterior door
    var cx = chapel.x, cy = chapel.y;
    a.grid[cy * w + cx] = T.WALL;
    a.grid[(cy - 1) * w + cx] = T.WALL;
    a.grid[(cy + 1) * w + cx] = T.WALL;
    a.floorTheme[cy * w + cx] = 0;
    a.doors = {};
    a.doors.chapelDoor = {
      id: 'chapelDoor', x: cx, y: cy, open: false, exterior: true, isInside: false,
      in: { x: cx + 1, y: cy }, out: { x: cx - 1, y: cy }
    };
    a.transitions = {};
    a.transitions.chapelDoor = { id: 'chapelDoor', kind: 'door', x: cx, y: cy, doorId: 'chapelDoor', dir: 'east' };
    // ruined wall stubs + rubble around chapel
    addProp(a, 'rubble', cx - 2, cy - 2, {});
    addProp(a, 'rubble', cx + 2, cy + 2, {});
    addProp(a, 'pillar', cx - 2, cy + 2, { block: true, variant: 1 });
    addProp(a, 'pillar', cx + 2, cy - 2, { block: true, variant: 1 });
    // cave: rocky bluff with opening on its north face
    var cvx = cave.x, cvy = cave.y;
    for (var yy = cvy - 1; yy <= cvy + 4; yy++) {
      for (var xx = cvx - 5; xx <= cvx + 5; xx++) {
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        var isMouth = (yy === cvy) && Math.abs(xx - cvx) <= 1;
        if (!isMouth) {
          a.grid[yy * w + xx] = T.WALL;
          a.floorTheme[yy * w + xx] = 0;
        } else {
          a.grid[yy * w + xx] = T.FLOOR;
          a.floorTheme[yy * w + xx] = 1;
        }
      }
    }
    a.transitions.cave = { id: 'cave', kind: 'cave', x: cvx, y: cvy, dir: 'down' };
    // gates
    a.transitions.gateW = { id: 'gateW', kind: 'gate', x: gateW.x, y: gateW.y, dir: 'west' };
    a.transitions.gateN = { id: 'gateN', kind: 'gate', x: gateN.x, y: gateN.y, dir: 'north' };
    // short fence/hedge near gates
    addProp(a, 'bush', gateW.x, gateW.y - 2, {});
    addProp(a, 'bush', gateW.x, gateW.y + 2, {});
    addProp(a, 'bush', gateN.x - 2, gateN.y, {});
    addProp(a, 'bush', gateN.x + 2, gateN.y, {});
    // trees in clumps (keep clear of roads & transitions)
    function nearFixed(x, y, r) {
      var pts = [gateW, gateN, { x: cx, y: cy }, { x: cvx, y: cvy }, graveyard, shrinePt];
      for (var i = 0; i < pts.length; i++) {
        if (dist(x, y, pts[i].x, pts[i].y) < r) return true;
      }
      return false;
    }
    function onRoad(x, y) { return a.floorTheme[y * w + x] === 1; }
    var clumps = rng.range(9, 13);
    for (var cl = 0; cl < clumps; cl++) {
      var cxx = rng.range(6, w - 7), cyy = rng.range(6, h - 7);
      var n = rng.range(4, 9);
      for (var t = 0; t < n; t++) {
        var tx2 = cxx + rng.range(-3, 3), ty2 = cyy + rng.range(-3, 3);
        if (tx2 < 2 || ty2 < 2 || tx2 >= w - 2 || ty2 >= h - 2) continue;
        if (a.grid[ty2 * w + tx2] !== T.FLOOR) continue;
        if (onRoad(tx2, ty2) || nearFixed(tx2, ty2, 3)) continue;
        if (propAt(a, tx2, ty2)) continue;
        addProp(a, 'tree', tx2, ty2, { block: true, variant: rng.range(0, 3) });
      }
    }
    // rocks, bushes
    for (var rc = 0; rc < rng.range(14, 20); rc++) {
      var rx = rng.range(3, w - 4), ry = rng.range(3, h - 4);
      if (a.grid[ry * w + rx] !== T.FLOOR || onRoad(rx, ry) || nearFixed(rx, ry, 2.5) || propAt(a, rx, ry)) continue;
      addProp(a, rng.chance(0.5) ? 'rock' : 'bush', rx, ry, { block: true, variant: rng.range(0, 3) });
    }
    // graveyard
    for (var g = 0; g < 9; g++) {
      var gx = graveyard.x + rng.range(-4, 4), gy2 = graveyard.y + rng.range(-3, 3);
      if (gx < 2 || gy2 < 2 || gx >= w - 2 || gy2 >= h - 2) continue;
      if (a.grid[gy2 * w + gx] !== T.FLOOR || propAt(a, gx, gy2)) continue;
      addProp(a, 'tombstone', gx, gy2, { block: true, variant: rng.range(0, 3) });
    }
    addProp(a, 'rubble', graveyard.x + 5, graveyard.y + 2, {});
    // shrine
    addProp(a, 'shrine', shrinePt.x, shrinePt.y, { block: true, light: { color: 'blue', r: 3, flicker: false } });
    addProp(a, 'pillar', shrinePt.x - 2, shrinePt.y, { block: true, variant: 0 });
    addProp(a, 'pillar', shrinePt.x + 2, shrinePt.y, { block: true, variant: 0 });
    // spawns
    a.spawns = [];
    function freeCellNear(px, py, r) {
      for (var att = 0; att < 120; att++) {
        var x2 = px + rng.range(-r, r), y2 = py + rng.range(-r, r);
        if (x2 < 2 || y2 < 2 || x2 >= w - 2 || y2 >= h - 2) continue;
        if (a.grid[y2 * w + x2] !== T.FLOOR || propAt(a, x2, y2)) continue;
        return [x2, y2];
      }
      return [px, py];
    }
    for (var s1 = 0; s1 < 5; s1++) {
      var c1 = freeCellNear(graveyard.x, graveyard.y, 6);
      a.spawns.push({ type: 'scavenger', x: c1[0], y: c1[1] });
    }
    for (var s2 = 0; s2 < 7; s2++) {
      var c2 = freeCellNear(rng.range(8, w - 9), rng.range(8, h - 9), 5);
      a.spawns.push({ type: 'wolf', x: c2[0], y: c2[1] });
    }
    a.boss = null;
  }

  /* ---------- town ---------- */
  var TOWN = {
    // building rects [x0,y0,x1,y1,style]
    cathedralR: [34, 8, 43, 16],
    cathDoor: { x: 37, y: 16 },
    houses: [
      [8, 8, 10, 10, 'b'], [14, 9, 17, 11, 'a'], [20, 8, 23, 10, 'b'], [26, 7, 28, 9, 'a'],
      [7, 14, 10, 16, 'a'], [12, 28, 14, 30, 'b'], [21, 30, 24, 33, 'a'], [30, 30, 32, 32, 'b'],
      [38, 28, 40, 30, 'a'], [6, 32, 8, 34, 'b'], [12, 36, 14, 38, 'a'], [26, 36, 28, 39, 'b'],
      [36, 36, 39, 38, 'a']
    ],
    npc: {
      orin: { x: 12, y: 26 },
      merith: { x: 9, y: 13 },
      ilsa: { x: 20, y: 27 },
      corvyn: { x: 26, y: 21 },
      rooke: { x: 41, y: 24 },
      marta: { x: 16, y: 34 },
      fenwick: { x: -1, y: -1 } // placed dynamically just inside cath1 door
    },
    gateE: { x: 47, y: 24 },
    gateS: { x: 24, y: 47 }
  };

  function town(a) {
    var rng = new Util.RNG(a.seed);
    var w = a.w, h = a.h;
    a.grid.fill(T.FLOOR);
    for (var i = 0; i < w * h; i++) {
      a.varr[i] = rng.range(0, 11);
      a.floorTheme[i] = 1; // grass
    }
    // cobble roads & plaza
    function cobble(x, y) { if (x >= 0 && y >= 0 && x < w && y < h) a.floorTheme[y * w + x] = 0; }
    for (var x = 0; x < w; x++) { cobble(x, 23); cobble(x, 24); }
    for (var y = 17; y <= 24; y++) { cobble(28, y); cobble(29, y); }
    for (var y2 = 0; y2 <= 17; y2++) { cobble(36, y2); cobble(37, y2); }
    // plaza area
    for (var py = 19; py <= 22; py++) for (var px = 24; px <= 32; px++) cobble(px, py);
    // cathedral
    var CR = TOWN.cathedralR;
    for (var cy = CR[1]; cy <= CR[3]; cy++) {
      for (var cx = CR[0]; cx <= CR[2]; cx++) {
        if (cx === TOWN.cathDoor.x && cy === TOWN.cathDoor.y) continue;
        a.grid[cy * w + cx] = T.WALL;
        a.floorTheme[cy * w + cx] = 0;
      }
    }
    // alcove behind the door (interior tile)
    a.grid[(TOWN.cathDoor.y - 1) * w + TOWN.cathDoor.x] = T.FLOOR;
    a.doors = {};
    a.doors.cathDoor = {
      id: 'cathDoor', x: TOWN.cathDoor.x, y: TOWN.cathDoor.y, open: false, double: true, isInside: false,
      in: { x: TOWN.cathDoor.x, y: TOWN.cathDoor.y - 1 },
      out: { x: TOWN.cathDoor.x, y: TOWN.cathDoor.y + 1 }
    };
    a.transitions = {};
    a.transitions.cathDoor = { id: 'cathDoor', kind: 'door', x: TOWN.cathDoor.x, y: TOWN.cathDoor.y, doorId: 'cathDoor', dir: 'south' };
    addProp(a, 'roof', CR[0], CR[1], { dx: CR[2] - CR[0] + 1, dy: CR[3] - CR[1] + 1, style: 'cathedral', block: false });
    // houses with locked doors + roofs
    for (var hi = 0; hi < TOWN.houses.length; hi++) {
      var H = TOWN.houses[hi];
      var hx0 = H[0], hy0 = H[1], hx1 = H[2], hy1 = H[3];
      for (var hy = hy0; hy <= hy1; hy++) {
        for (var hx = hx0; hx <= hx1; hx++) {
          a.grid[hy * w + hx] = T.WALL;
          a.floorTheme[hy * w + hx] = 0;
        }
      }
      // locked door on south wall, near middle
      var dxx = hx0 + Math.floor((hx1 - hx0) / 2);
      if (hx1 - hx0 >= 2 && hi % 2 === 0) dxx = hx0 + 1 + (hi % 3);
      var dyy = hy1;
      a.grid[dyy * w + dxx] = T.FLOOR;
      a.doors['house' + hi] = {
        id: 'house' + hi, x: dxx, y: dyy, open: false, locked: true,
        in: { x: dxx, y: dyy - 1 }, out: { x: dxx, y: dyy + 1 }
      };
      var styleId = H[4];
      var st = { id: styleId, wall: styleId === 'a' ? '#7a6f5a' : '#8a7a62', roof: styleId === 'a' ? '#4a4038' : '#5a3d2e' };
      addProp(a, 'roof', hx0, hy0, { dx: hx1 - hx0 + 1, dy: hy1 - hy0 + 1, style: st, block: false });
    }
    // fences around a yard
    for (var fx = 4; fx <= 11; fx++) { a.grid[12 * w + fx] = T.WALL; a.floorTheme[12 * w + fx] = 0; }
    for (var fy = 12; fy <= 18; fy++) { a.grid[fy * w + 4] = T.WALL; a.floorTheme[fy * w + 4] = 0; }
    // pond (SE)
    for (var yy = 40; yy <= 45; yy++) {
      for (var xx = 40; xx <= 45; xx++) {
        var d = Math.pow((xx - 42.5) / 3.4, 2) + Math.pow((yy - 42.5) / 3.4, 2);
        if (d <= 1.1) { a.grid[yy * w + xx] = T.WATER; a.floorTheme[yy * w + xx] = 0; }
      }
    }
    // gates
    a.grid[TOWN.gateE.y * w + TOWN.gateE.x] = T.FLOOR;
    a.transitions.gateE = { id: 'gateE', kind: 'gate', x: TOWN.gateE.x, y: TOWN.gateE.y, dir: 'east' };
    a.grid[TOWN.gateS.y * w + TOWN.gateS.x] = T.FLOOR;
    a.transitions.gateS = { id: 'gateS', kind: 'gate', x: TOWN.gateS.x, y: TOWN.gateS.y, dir: 'south' };
    // perimeter wall except gate tiles
    for (var wx = 0; wx < w; wx++) {
      if (wx !== TOWN.gateE.x) { a.grid[0 * w + wx] = T.WALL; a.floorTheme[0 * w + wx] = 0; }
      if (wx !== TOWN.gateS.x) { a.grid[(h - 1) * w + wx] = T.WALL; a.floorTheme[(h - 1) * w + wx] = 0; }
    }
    for (var wy = 0; wy < h; wy++) {
      if (wy !== TOWN.gateE.y) { a.grid[wy * w + (w - 1)] = T.WALL; a.floorTheme[wy * w + (w - 1)] = 0; }
      if (wy !== TOWN.gateS.y) { a.grid[wy * w + 0] = T.WALL; a.floorTheme[wy * w + 0] = 0; }
    }
    // decor
    addProp(a, 'fountain', 29, 20, { block: true, light: { color: 'blue', r: 3, flicker: false } });
    addProp(a, 'well', 15, 34, { block: true });
    addProp(a, 'stall', 21, 26, { block: true });
    addProp(a, 'anvil', 12, 27, { block: true, light: { color: 'torch', r: 2.5, flicker: true } });
    addProp(a, 'barrel', 10, 27, { block: true });
    addProp(a, 'barrel', 14, 28, { block: true });
    addProp(a, 'hay', 13, 24, { block: false });
    addProp(a, 'cart', 31, 23, { block: true });
    addProp(a, 'brazier', 44, 23, { light: { color: 'torch', r: 3, flicker: true } });
    addProp(a, 'brazier', 22, 46, { light: { color: 'torch', r: 3, flicker: true } });
    // trees + bushes
    var treePts = [[3, 20], [5, 24], [2, 28], [18, 14], [32, 5], [10, 4], [44, 6], [40, 18], [45, 34], [33, 42], [18, 43], [8, 42], [30, 10], [16, 31]];
    for (var tp = 0; tp < treePts.length; tp++) {
      addProp(a, 'tree', treePts[tp][0], treePts[tp][1], { block: true, variant: rng.range(0, 3) });
    }
    for (var bp = 0; bp < 8; bp++) {
      var bxx = rng.range(4, w - 5), byy = rng.range(4, h - 5);
      if (a.grid[byy * w + bxx] !== T.FLOOR || propAt(a, bxx, byy)) continue;
      if (a.floorTheme[byy * w + bxx] === 0) continue;
      addProp(a, 'bush', bxx, byy, { block: true });
    }
    a.spawns = [];
    a.boss = null;
    a.chests = [];
  }

  /* ---------- dispatch ---------- */
  function build(a) {
    switch (a.id) {
      case 'town': town(a); break;
      case 'wild': wild(a); fixWalkable(a); break;
      case 'cath1':
        dungeon(a, {
          trans: [
            { id: 'doorS', kind: 'door', side: 'south', double: true, isInside: true },
            { id: 'doorX', kind: 'door', side: 'west', exterior: true, isInside: true },
            { id: 'stairUp', kind: 'stairs', dir: 'up' },
            { id: 'doorStairB1', kind: 'doorstair', side: 'east', dir: 'down' }
          ],
          deco: 'pew', rooms: 5,
          enemies: [{ type: 'gargoyle', n: 7 }, { type: 'cultist', n: 6 }]
        });
        break;
      case 'cath2':
        dungeon(a, {
          trans: [
            { id: 'stairDn', kind: 'stairs', dir: 'down' },
            { id: 'stairUp', kind: 'stairs', dir: 'up' }
          ],
          deco: 'pew', rooms: 4,
          enemies: [{ type: 'gargoyle', n: 6 }, { type: 'cultist', n: 7 }, { type: 'wraith', n: 2 }]
        });
        break;
      case 'cath3': chancel(a); fixWalkable(a); break;
      case 'b1':
        dungeon(a, {
          trans: [
            { id: 'stairUp', kind: 'stairs', dir: 'up' },
            { id: 'cave', kind: 'cave', dir: 'up' },
            { id: 'stairDn', kind: 'stairs', dir: 'down' }
          ],
          deco: 'sarc', rooms: 4,
          enemies: [{ type: 'terror', n: 7 }, { type: 'wraith', n: 4 }]
        });
        break;
      case 'b2':
        dungeon(a, {
          trans: [
            { id: 'stairUp', kind: 'stairs', dir: 'up' },
            { id: 'stairDn', kind: 'stairs', dir: 'down' }
          ],
          deco: 'sarc', rooms: 5,
          enemies: [{ type: 'terror', n: 7 }, { type: 'wraith', n: 4 }, { type: 'brute', n: 2 }]
        });
        break;
      case 'b3':
        dungeon(a, {
          trans: [
            { id: 'stairUp', kind: 'stairs', dir: 'up' },
            { id: 'stairDn', kind: 'stairs', dir: 'down' }
          ],
          deco: 'sarc', rooms: 6,
          enemies: [{ type: 'wraith', n: 4 }, { type: 'brute', n: 6 }, { type: 'warden', n: 1 }]
        });
        break;
      case 'b4': throne(a); fixWalkable(a); break;
    }
  }

  return {
    build: build,
    TOWN: TOWN,
    PAIRS: PAIRS,
    PAIRMAP: PAIRMAP,
    isF: isF, isW: isW, gridVal: gridVal,
    dist: dist,
    ensureConnected: ensureConnected
  };
})();

'use strict';
/* ============================================================
   Emberfall - 05_area.js : area runtime state + world registry
   ============================================================ */
var World = (function () {

  var META = {
    town: { theme: 'town', w: 48, h: 48, sets: ['town', 'grass'] },
    wild: { theme: 'wild', w: 68, h: 68, sets: ['grass', 'dirt'] },
    cath1: { theme: 'cathedral', w: 56, h: 56, sets: ['cathedral'] },
    cath2: { theme: 'cathedral', w: 48, h: 48, sets: ['cathedral'] },
    cath3: { theme: 'cathedral', w: 40, h: 34, sets: ['cathedral'] },
    b1: { theme: 'crypt', w: 48, h: 48, sets: ['crypt'] },
    b2: { theme: 'crypt', w: 52, h: 52, sets: ['crypt'] },
    b3: { theme: 'crypt', w: 56, h: 56, sets: ['crypt'] },
    b4: { theme: 'boss', w: 42, h: 38, sets: ['boss'] }
  };

  var world = {
    runSeed: 1,
    areas: {},
    current: null,
    nextUid: 1,
    time: 0
  };

  function makeArea(id, seed) {
    var m = META[id];
    var a = {
      id: id, seed: seed, name: CFG.AREA_NAMES[id],
      theme: m.theme, w: m.w, h: m.h, sets: m.sets,
      type: id === 'town' ? 'town' : (id === 'wild' ? 'wild' : (id === 'cath3' || id === 'b4' ? 'boss' : 'dungeon')),
      grid: new Uint8Array(m.w * m.h),
      varr: new Uint8Array(m.w * m.h),
      floorTheme: new Uint8Array(m.w * m.h),
      explored: new Uint8Array(m.w * m.h),
      vis: new Uint8Array(m.w * m.h),
      visDirty: true,
      doors: {}, transitions: {}, props: [], lights: [],
      spawns: [], enemies: [], deadEnemies: {},
      boss: null, bossDead: false,
      loot: [], chests: [], altar: null, npcs: [],
      built: false,
      enemyIdle: []
    };
    return a;
  }

  function seedFor(id, runSeed) {
    if (id === 'town') return Util.hashStr('emberfall:town');
    return Util.hashStr('emberfall:' + id + ':' + runSeed);
  }

  function getArea(id) {
    if (!world.areas[id]) {
      var a = makeArea(id, seedFor(id, world.runSeed));
      world.areas[id] = a;
      Gen.build(a);
      a.built = true;
      if (typeof Enemies !== 'undefined') Enemies.spawnArea(a);
    }
    return world.areas[id];
  }

  function curArea() { return world.current; }

  /* ---------- blocking ---------- */
  function doorAt(a, x, y) {
    for (var id in a.doors) {
      var d = a.doors[id];
      if (d.x === x && d.y === y) return d;
    }
    return null;
  }
  function propBlockingAt(a, x, y) {
    for (var i = 0; i < a.props.length; i++) {
      var p = a.props[i];
      if (p.block && p.x === x && p.y === y) return true;
    }
    return false;
  }
  function blocked(a, x, y) {
    if (!a) return true;
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return true;
    var v = a.grid[y * a.w + x];
    if (v === CFG.T.WALL) {
      var d = doorAt(a, x, y);
      if (d && d.open) return false;
      return true;
    }
    if (v === CFG.T.WATER) return true;
    if (v === CFG.T.FLOOR) {
      var d2 = doorAt(a, x, y);
      if (d2 && !d2.open) return true;
      return propBlockingAt(a, x, y);
    }
    return true;
  }
  function walkable(a, x, y) { return !blocked(a, x, y); }

  function losBlocked(a, x, y) {
    if (!a) return true;
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return true;
    var v = a.grid[y * a.w + x];
    if (v === CFG.T.WALL) {
      var d = doorAt(a, x, y);
      if (d && d.open) return false;
      return true;
    }
    if (v === CFG.T.WATER) return false;
    return false;
  }

  /* ---------- transitions ---------- */
  function resolveArrival(fromAreaId, transId) {
    var pair = Gen.PAIRMAP[fromAreaId + '.' + transId];
    if (!pair) return null;
    var src = getArea(fromAreaId);
    var trans = src.transitions[transId];
    var dest = getArea(pair.b);
    var destTrans = dest.transitions[pair.u];
    if (!destTrans) return null;
    if (trans.kind === 'door') {
      var srcDoor = src.doors[trans.doorId];
      if (srcDoor && srcDoor.stairsBehind) {
        // door at top of a stairway: walking through it descends onto the
        // destination stairs themselves
        return { areaId: pair.b, x: destTrans.x, y: destTrans.y, grace: true };
      }
      var destDoor = dest.doors[destTrans.doorId];
      var inside = !!(srcDoor && srcDoor.isInside);
      if (!destDoor) return null;
      var tile = inside ? destDoor.out : destDoor.in;
      return { areaId: pair.b, x: tile.x, y: tile.y, grace: true, doorId: destTrans.doorId };
    }
    // open kinds: stairs, cave, gate, doorstair
    if (destTrans.kind === 'doorstair' || destTrans.kind === 'door') {
      // arriving at a door from behind (climbing up from below)
      var dd = dest.doors[destTrans.doorId];
      if (dd) dd.open = true;
      return { areaId: pair.b, x: destTrans.x, y: destTrans.y, grace: true, doorId: destTrans.doorId };
    }
    return { areaId: pair.b, x: destTrans.x, y: destTrans.y, grace: true };
  }

  /* ---------- entering areas ---------- */
  function enter(areaId, arrival, opts) {
    opts = opts || {};
    var a = getArea(areaId);
    world.current = a;
    if (typeof Player !== 'undefined') {
      Player.x = arrival.x + 0.5;
      Player.y = arrival.y + 0.5;
      Player.area = areaId;
      Player.grace = arrival.grace ? 0.9 : 0;
      Player.arrivalTile = { x: arrival.x, y: arrival.y };
      Player.targetEnemy = null;
      Player.pending = null;
      Player.path = null;
      Player.lastAttackTime = 0;
    }
    a.visDirty = true;
    if (typeof Render !== 'undefined') Render.onAreaEnter(a);
    if (typeof Quests !== 'undefined') Quests.onEnter(areaId);
    if (typeof UI !== 'undefined') UI.onAreaEnter(a);
    return a;
  }

  /* ---------- persistence ---------- */
  function serializeState() {
    var st = { runSeed: world.runSeed, nextUid: world.nextUid, areas: {} };
    for (var id in world.areas) {
      var a = world.areas[id];
      var doors = {};
      for (var did in a.doors) doors[did] = a.doors[did].open ? 1 : 0;
      var dead = [];
      for (var eid in a.deadEnemies) dead.push(eid);
      var chests = {};
      for (var c = 0; c < a.chests.length; c++) chests[a.chests[c].id] = a.chests[c].open ? 1 : 0;
      st.areas[id] = {
        explored: Util.b64FromBytes(a.explored),
        doors: doors,
        dead: dead,
        bossDead: a.bossDead ? 1 : 0,
        loot: a.loot,
        chests: chests,
        altar: a.altar ? { taken: a.altar.taken ? 1 : 0, locked: a.altar.locked ? 1 : 0 } : null
      };
    }
    return st;
  }

  function applyState(st) {
    world.runSeed = st.runSeed;
    world.nextUid = st.nextUid || 1;
    world.areas = {};
    for (var id in st.areas) {
      var a = getArea(id);
      var s = st.areas[id];
      if (s.explored) {
        var b = Util.bytesFromB64(s.explored);
        if (b.length === a.explored.length) a.explored.set(b);
      }
      for (var did in s.doors) {
        if (a.doors[did]) a.doors[did].open = !!s.doors[did];
      }
      if (s.dead) {
        for (var i = 0; i < s.dead.length; i++) a.deadEnemies[s.dead[i]] = true;
        Enemies.removeDead(a);
      }
      a.bossDead = !!s.bossDead;
      if (a.bossDead && a.boss) Enemies.removeEnemy(a, a.id + ':boss');
      if (s.loot) a.loot = s.loot;
      for (var cid in s.chests) {
        for (var c = 0; c < a.chests.length; c++) {
          if (a.chests[c].id === cid && s.chests[cid]) a.chests[c].open = true;
        }
      }
      if (s.altar && a.altar) {
        a.altar.taken = !!s.altar.taken;
        a.altar.locked = !!s.altar.locked;
      }
    }
  }

  /* ---------- helpers for other systems ---------- */
  function addLoot(a, entry) {
    entry.uid = world.nextUid++;
    a.loot.push(entry);
  }
  function removeLoot(a, uid) {
    for (var i = 0; i < a.loot.length; i++) {
      if (a.loot[i].uid === uid) { a.loot.splice(i, 1); return true; }
    }
    return false;
  }
  function transitionAt(a, x, y) {
    for (var id in a.transitions) {
      var t = a.transitions[id];
      if (t.x === x && t.y === y) return t;
    }
    return null;
  }
  function tileName(id) { return CFG.AREA_NAMES[id] || id; }

  return {
    world: world,
    getArea: getArea, curArea: curArea,
    blocked: blocked, walkable: walkable, losBlocked: losBlocked,
    doorAt: doorAt, propBlockingAt: propBlockingAt,
    resolveArrival: resolveArrival, enter: enter,
    serializeState: serializeState, applyState: applyState,
    addLoot: addLoot, removeLoot: removeLoot,
    transitionAt: transitionAt, tileName: tileName,
    makeArea: makeArea, seedFor: seedFor
  };
})();

'use strict';
/* ============================================================
   Emberfall - 06_items.js : items, inventory, loot, shops
   ============================================================ */
var Items = (function () {

  /* ---------- base definitions ---------- */
  var BASES = {
    sword_rusty: { name: 'Rusty Sword', type: 'weapon', icon: 'sword', dmg: 3, value: 15, lvl: 0 },
    sword_iron: { name: 'Iron Sword', type: 'weapon', icon: 'sword', dmg: 5, value: 60, lvl: 1 },
    axe_broad: { name: 'Broad Axe', type: 'weapon', icon: 'axe', dmg: 7, value: 110, lvl: 2 },
    mace_spiked: { name: 'Spiked Mace', type: 'weapon', icon: 'mace', dmg: 9, value: 170, lvl: 3 },
    sword_warden: { name: "Warden's Blade", type: 'weapon', icon: 'sword', dmg: 8, hp: 10, value: 240, lvl: 3, q: 'magic' },
    armor_leather: { name: 'Leather Vest', type: 'armor', icon: 'armor', armor: 2, value: 50, lvl: 0 },
    armor_ring: { name: 'Ringmail', type: 'armor', icon: 'armor', armor: 4, value: 95, lvl: 1 },
    armor_splint: { name: 'Splint Mail', type: 'armor', icon: 'armor', armor: 7, value: 180, lvl: 3 },
    helm_cap: { name: 'Leather Cap', type: 'helm', icon: 'helm', armor: 1, value: 25, lvl: 0 },
    helm_iron: { name: 'Iron Helm', type: 'helm', icon: 'helm', armor: 2, value: 60, lvl: 1 },
    helm_great: { name: 'Great Helm', type: 'helm', icon: 'helm', armor: 3, value: 120, lvl: 2 },
    shield_buckler: { name: 'Buckler', type: 'shield', icon: 'shield', armor: 1, value: 40, lvl: 0 },
    shield_kite: { name: 'Kite Shield', type: 'shield', icon: 'shield', armor: 2, value: 90, lvl: 1 },
    shield_tower: { name: 'Tower Shield', type: 'shield', icon: 'shield', armor: 3, value: 160, lvl: 2 },
    potion_h: { name: 'Health Potion', type: 'potionH', icon: 'potionH', heal: 40, value: 30, lvl: 0 },
    potion_h2: { name: 'Greater Health Potion', type: 'potionH', icon: 'potionH', heal: 90, value: 80, lvl: 2 },
    potion_m: { name: 'Mana Potion', type: 'potionM', icon: 'potionM', heal: 35, value: 45, lvl: 0 },
    potion_m2: { name: 'Greater Mana Potion', type: 'potionM', icon: 'potionM', heal: 75, value: 95, lvl: 2 },
    dagger_hex: { name: 'Hexed Dagger', type: 'weapon', icon: 'dagger', dmg: 4, mp: 10, value: 200, lvl: 2, q: 'magic' },
    amulet_wisp: { name: 'Wisp-Eye Charm', type: 'amulet', icon: 'amulet', mp: 15, value: 120, lvl: 1, q: 'magic' },
    amulet_shade: { name: 'Shade Amulet', type: 'amulet', icon: 'amulet', dmg: 2, value: 180, lvl: 2, q: 'magic' },
    ring_moon: { name: 'Moonglow Ring', type: 'ring', icon: 'ring', dmg: 1, armor: 1, value: 200, lvl: 2, q: 'magic' },
    ring_abbot: { name: "Abbot's Signet", type: 'ring', icon: 'ring', hp: 20, mp: 10, value: 260, lvl: 3, q: 'magic' },
    staff_dawn: { name: 'Dawnpiercer', type: 'weapon', icon: 'staff', dmg: 12, hp: 15, value: 420, lvl: 5, q: 'rare' },
    quest_censer: { name: 'Sunstone Censer', type: 'quest', icon: 'censer', value: 0, lvl: 0, q: 'quest' },
    quest_relic: { name: 'Reliquary of Ash', type: 'quest', icon: 'relic', value: 0, lvl: 0, q: 'quest' },
    val_garnet: { name: 'Garnet', type: 'valuable', icon: 'ring', value: 25, lvl: 0 },
    val_chalice: { name: 'Gilded Chalice', type: 'valuable', icon: 'relic', value: 40, lvl: 0 },
    val_crown: { name: 'Tarnished Crown', type: 'valuable', icon: 'helm', value: 65, lvl: 0 }
  };

  /* magic affix pool */
  var AFFIXES = [
    { bonus: { dmg: 1 }, prefix: 'Keen' },
    { bonus: { dmg: 2 }, prefix: 'Cruel' },
    { bonus: { dmg: 3 }, prefix: 'Vicious' },
    { bonus: { armor: 1 }, prefix: 'Sturdy' },
    { bonus: { armor: 2 }, prefix: 'Adamant' },
    { bonus: { hp: 12 }, prefix: 'Vital' },
    { bonus: { hp: 20 }, prefix: 'Stalwart' },
    { bonus: { mp: 8 }, prefix: 'Wisp' },
    { bonus: { mp: 15 }, prefix: 'Radiant' }
  ];

  function make(id, quality, rng) {
    var def = BASES[id];
    if (!def) return null;
    var it = {
      id: id, name: def.name, type: def.type, icon: def.icon,
      dmg: def.dmg || 0, armor: def.armor || 0, hp: def.hp || 0, mp: def.mp || 0,
      value: def.value || 0, lvl: def.lvl || 0, q: def.q || 'normal',
      heal: def.heal || 0, count: 1
    };
    if (!def.q && quality && quality !== 'normal') {
      it.q = quality;
      var r = rng || new Util.RNG(Util.hashStr(id + quality + Math.floor(Math.random() * 1e9)));
      var n = quality === 'rare' ? 2 : 1;
      var used = {};
      var picked = [];
      for (var i = 0; i < n; i++) {
        var af;
        var tries = 0;
        do {
          af = AFFIXES[r.range(0, AFFIXES.length - 1)];
          tries++;
        } while (used[af.prefix] && tries < 30);
        used[af.prefix] = true;
        picked.push(af);
      }
      for (var p = 0; p < picked.length; p++) {
        var b = picked[p].bonus;
        if (b.dmg) it.dmg += b.dmg;
        if (b.armor) it.armor += b.armor;
        if (b.hp) it.hp += b.hp;
        if (b.mp) it.mp += b.mp;
        it.name = (it.name.indexOf(picked[p].prefix) === 0 ? '' : picked[p].prefix + ' ') + it.name;
      }
      it.value = Math.round(it.value * 1.4 + 20);
    }
    return it;
  }

  function qualityColor(q) {
    switch (q) {
      case 'magic': return '#6ea8ff';
      case 'rare': return '#ffd54d';
      case 'quest': return '#c08aff';
      default: return '#d8d3c8';
    }
  }

  function slotOf(it) {
    switch (it.type) {
      case 'weapon': return 'weapon';
      case 'armor': return 'armor';
      case 'helm': return 'helm';
      case 'shield': return 'shield';
      case 'amulet': return 'amulet';
      case 'ring': return 'ring';
      default: return null;
    }
  }
  function isPotion(it) { return it.type === 'potionH' || it.type === 'potionM'; }

  /* ---------- inventory ---------- */
  var INV_SLOTS = 24;

  function invCount() {
    var n = 0;
    for (var i = 0; i < Player.inventory.length; i++) n += Player.inventory[i].qty;
    return n;
  }
  function addToInv(it, qty) {
    qty = qty || 1;
    if (isPotion(it)) {
      for (var i = 0; i < Player.inventory.length; i++) {
        var st = Player.inventory[i];
        if (st.it.id === it.id) { st.qty += qty; return true; }
      }
    }
    if (Player.inventory.length >= INV_SLOTS) return false;
    Player.inventory.push({ it: it, qty: qty });
    return true;
  }
  function removeFromInv(idx, qty) {
    var st = Player.inventory[idx];
    if (!st) return false;
    st.qty -= qty;
    if (st.qty <= 0) Player.inventory.splice(idx, 1);
    return true;
  }
  function countPotion(type) {
    var n = 0;
    for (var i = 0; i < Player.inventory.length; i++) {
      var st = Player.inventory[i];
      if (st.it.type === type) n += st.qty;
    }
    return n;
  }
  function findPotionStack(type) {
    for (var i = 0; i < Player.inventory.length; i++) {
      if (Player.inventory[i].it.type === type) return i;
    }
    return -1;
  }

  function usePotion(type) {
    var idx = findPotionStack(type);
    if (idx < 0) return false;
    var it = Player.inventory[idx].it;
    var amt = it.heal + Math.floor(Player.maxHp * (it.heal === 90 ? 0.15 : 0.1));
    if (type === 'potionH') Player.hp = Math.min(Player.maxHp, Player.hp + amt);
    else Player.mp = Math.min(Player.maxMp, Player.mp + amt);
    removeFromInv(idx, 1);
    return true;
  }

  function sellPrice(it) {
    return Math.max(1, Math.floor((it.value || 1) / 4));
  }

  /* ---------- shops ---------- */
  var SHOPS = {
    smith: ['sword_iron', 'axe_broad', 'mace_spiked', 'armor_leather', 'armor_ring', 'armor_splint',
      'helm_cap', 'helm_iron', 'helm_great', 'shield_buckler', 'shield_kite', 'shield_tower'],
    healer: ['potion_h', 'potion_h2', 'potion_m', 'potion_m2'],
    occult: ['potion_m', 'potion_m2', 'dagger_hex', 'amulet_wisp', 'amulet_shade', 'ring_moon']
  };
  var HEAL_COST = 25;

  /* ---------- loot ---------- */
  function rollChest(chest, area) {
    var rng = new Util.RNG(chest.seed);
    var entries = [];
    var mult = area.type === 'boss' ? 2.2 : (area.id === 'cath3' ? 1.6 : 1);
    var gold = Math.round(rng.range(18, 50) * mult);
    entries.push({ kind: 'gold', amount: gold });
    var nItems = rng.range(1, 2) + (area.type === 'boss' ? 1 : 0);
    for (var i = 0; i < nItems; i++) {
      entries.push({ kind: 'item', item: rollRandomItem(rng, area) });
    }
    return entries;
  }
  var DROP_BASES = ['sword_rusty', 'sword_iron', 'axe_broad', 'armor_leather', 'armor_ring', 'helm_cap', 'helm_iron', 'shield_buckler', 'shield_kite'];
  var RARE_BASES = ['mace_spiked', 'armor_splint', 'helm_great', 'shield_tower'];
  function rollRandomItem(rng, area) {
    var pool = DROP_BASES;
    if (area.id === 'b2' || area.id === 'b3' || area.type === 'boss') pool = pool.concat(RARE_BASES);
    var base = pool[rng.range(0, pool.length - 1)];
    var q = 'normal';
    if (rng.chance(0.22)) q = 'magic';
    if (rng.chance(0.06)) q = 'rare';
    return make(base, q, rng);
  }
  function rollEnemyLoot(etype, xp) {
    var out = [];
    if (Math.random() < 0.55) {
      out.push({ kind: 'gold', amount: Math.max(2, Math.round((xp || 10) / 3) + Math.floor(Math.random() * 5)) });
    }
    if (Math.random() < 0.16) out.push({ kind: 'item', item: rollRandomItem(new Util.RNG(Math.floor(Math.random() * 1e9)), World.curArea()) });
    if (Math.random() < 0.08) out.push({ kind: 'item', item: make(Math.random() < 0.5 ? 'potion_h' : 'potion_m') });
    return out;
  }

  function dropLoot(a, x, y, entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var off = i === 0 ? 0 : 0.4;
      World.addLoot(a, { kind: e.kind, x: x + off, y: y, amount: e.amount, item: e.item });
    }
  }

  return {
    BASES: BASES, AFFIXES: AFFIXES,
    make: make, qualityColor: qualityColor, slotOf: slotOf, isPotion: isPotion,
    INV_SLOTS: INV_SLOTS,
    addToInv: addToInv, removeFromInv: removeFromInv, countPotion: countPotion,
    findPotionStack: findPotionStack, usePotion: usePotion, sellPrice: sellPrice,
    SHOPS: SHOPS, HEAL_COST: HEAL_COST,
    rollChest: rollChest, rollRandomItem: rollRandomItem, rollEnemyLoot: rollEnemyLoot,
    dropLoot: dropLoot
  };
})();

'use strict';
/* ============================================================
   Emberfall - 07_player.js : player state, movement, combat,
   abilities, progression (single state+API object)
   ============================================================ */
var Player = (function () {

  var P = {
    area: 'town', x: 0, y: 0,
    level: 1, xp: 0, hp: 60, mp: 30, maxHp: 60, maxMp: 30,
    baseDmg: CFG.PLAYER.baseDmg, baseArmor: CFG.PLAYER.baseArmor,
    gold: CFG.PLAYER.startGold,
    inventory: [],
    equip: { weapon: null, armor: null, helm: null, shield: null, amulet: null, ring: null },
    path: null, pathIdx: 0, pathGoal: null,
    targetEnemy: null, pending: null,
    attackTimer: 0, swing: 0, swingDir: 1,
    abilityCd: { firebolt: 0, nova: 0, heal: 0 },
    potionCd: 0, hurtFlash: 0,
    grace: 0, arrivalTile: null,
    moving: false, facingX: 0, facingY: 1,
    repathTimer: 0,
    lastTileX: -99, lastTileY: -99,
    dead: false,

    reset: function () {
      P.level = 1; P.xp = 0;
      P.maxHp = CFG.PLAYER.baseHP; P.hp = P.maxHp;
      P.maxMp = CFG.PLAYER.baseMP; P.mp = P.maxMp;
      P.baseDmg = CFG.PLAYER.baseDmg; P.baseArmor = CFG.PLAYER.baseArmor;
      P.gold = CFG.PLAYER.startGold;
      P.inventory = [];
      P.equip = { weapon: null, armor: null, helm: null, shield: null, amulet: null, ring: null };
      P.path = null; P.targetEnemy = null; P.pending = null;
      P.attackTimer = 0; P.swing = 0; P.hurtFlash = 0;
      P.abilityCd = { firebolt: 0, nova: 0, heal: 0 };
      P.potionCd = 0; P.grace = 0; P.arrivalTile = null; P.dead = false;
      Items.addToInv(Items.make('sword_rusty'));
      Items.addToInv(Items.make('potion_h'), 2);
      Items.addToInv(Items.make('potion_m'), 1);
    },

    /* ---------- derived stats ---------- */
    equipBonus: function (field) {
      var t = 0;
      for (var s in P.equip) {
        var it = P.equip[s];
        if (it) t += it[field] || 0;
      }
      return t;
    },
    dmg: function () { return P.baseDmg + P.equipBonus('dmg'); },
    armor: function () { return P.baseArmor + P.equipBonus('armor'); },
    tileX: function () { return Math.floor(P.x); },
    tileY: function () { return Math.floor(P.y); },

    /* ---------- movement ---------- */
    setPath: function (path, goal) {
      P.path = path; P.pathIdx = 0; P.pathGoal = goal || null;
    },
    moveTo: function (tx, ty) {
      var a = World.curArea();
      var sx = P.tileX(), sy = P.tileY();
      var path = Util.findPath(a.w, a.h, function (x, y) { return World.blocked(a, x, y); }, sx, sy, tx, ty, 6000);
      if (!path || path.length === 0) {
        UI.toast('You cannot reach that.');
        return false;
      }
      P.setPath(path, { x: tx, y: ty });
      return true;
    },
    clearMove: function () {
      P.path = null; P.targetEnemy = null; P.pending = null; P.pathGoal = null;
    },

    update: function (dt) {
      var a = World.curArea();
      if (!a) return;
      P.hurtFlash = Math.max(0, P.hurtFlash - dt);
      P.swing = Math.max(0, P.swing - dt);
      P.grace = Math.max(0, P.grace - dt);
      for (var k in P.abilityCd) P.abilityCd[k] = Math.max(0, P.abilityCd[k] - dt);
      P.potionCd = Math.max(0, P.potionCd - dt);
      P.attackTimer = Math.max(0, P.attackTimer - dt);
      P.mp = Math.min(P.maxMp, P.mp + CFG.PLAYER.manaRegen * dt);

      // pending interaction
      if (P.pending) {
        var pd = P.pending;
        var d = Util.dist(P.x, P.y, pd.x + 0.5, pd.y + 0.5);
        if (d <= pd.range) {
          var fn = pd.fn;
          P.pending = null;
          if (fn) fn();
        } else if (!P.path || !P.pathGoal || P.pathGoal.x !== pd.x || P.pathGoal.y !== pd.y) {
          var bx = -1, by = -1, bd = 1e9;
          var nbs = [[pd.x + 1, pd.y], [pd.x - 1, pd.y], [pd.x, pd.y + 1], [pd.x, pd.y - 1]];
          for (var i = 0; i < 4; i++) {
            var nx = nbs[i][0], ny = nbs[i][1];
            if (!World.walkable(a, nx, ny)) continue;
            var dd = Util.dist(nx + 0.5, ny + 0.5, P.x, P.y);
            if (dd < bd) { bd = dd; bx = nx; by = ny; }
          }
          if (bx < 0) {
            UI.toast('You cannot reach that.');
            P.pending = null;
          } else {
            P.moveTo(bx, by);
          }
        }
      }

      // attack target
      if (P.targetEnemy) {
        var en = Enemies.get(a, P.targetEnemy);
        if (!en || en.hp <= 0 || en.dead) { P.targetEnemy = null; }
        else {
          var ed = Util.dist(P.x, P.y, en.x, en.y);
          if (ed <= CFG.PLAYER.meleeRange) {
            if (P.path) P.path = null;
            if (P.attackTimer <= 0) {
              P.doAttack(en);
              P.attackTimer = CFG.PLAYER.attackCd;
            }
          } else {
            if (!P.path || P.repathTimer <= 0) {
              P.repathTimer = 0.5;
              var ep = Util.findPath(a.w, a.h, function (x, y) { return World.blocked(a, x, y); }, P.tileX(), P.tileY(), Enemies.tileX(en), Enemies.tileY(en), 4000);
              if (ep && ep.length) P.setPath(ep, { x: Enemies.tileX(en), y: Enemies.tileY(en) });
              else P.targetEnemy = null;
            }
          }
        }
      }
      P.repathTimer = Math.max(0, P.repathTimer - dt);

      // follow path
      P.moving = false;
      if (P.path && P.pathIdx < P.path.length) {
        var wp = P.path[P.pathIdx];
        var wx = wp.x + 0.5, wy = wp.y + 0.5;
        var dx = wx - P.x, dy = wy - P.y;
        var dist2 = Math.sqrt(dx * dx + dy * dy);
        var step = CFG.PLAYER.speed * dt;
        if (dist2 < 0.03 || step >= dist2) {
          // snap onto the waypoint and advance
          P.x = wx; P.y = wy;
          P.pathIdx++;
          if (P.pathIdx >= P.path.length) P.path = null;
        } else {
          P.moving = true;
          var mx = dx / dist2, my = dy / dist2;
          var nxx = P.x + mx * step, nyy = P.y + my * step;
          if (!World.walkable(a, Math.floor(nxx), Math.floor(nyy))) {
            if (P.pathGoal) {
              var rp = Util.findPath(a.w, a.h, function (x, y) { return World.blocked(a, x, y); }, P.tileX(), P.tileY(), P.pathGoal.x, P.pathGoal.y, 4000);
              if (rp && rp.length) P.setPath(rp, P.pathGoal);
              else P.path = null;
            } else P.path = null;
          } else {
            P.x = nxx; P.y = nyy;
            P.facingX = mx; P.facingY = my;
          }
        }
      }

      // transition triggers (checked every frame so grace expiry is handled)
      var tx = P.tileX(), ty = P.tileY();
      if (P.lastTileX !== tx || P.lastTileY !== ty) {
        P.lastTileX = tx; P.lastTileY = ty;
        if (P.arrivalTile && (P.arrivalTile.x !== tx || P.arrivalTile.y !== ty)) P.arrivalTile = null;
      }
      var tr = World.transitionAt(a, tx, ty);
      if (tr && P.grace <= 0 && !P.arrivalTile) {
        if (tr.kind === 'door') {
          var door = a.doors[tr.doorId];
          if (door && door.open) P.triggerTransition(tr);
        } else {
          P.triggerTransition(tr);
        }
      }
    },

    triggerTransition: function (tr) {
      var a = World.curArea();
      var arr = World.resolveArrival(a.id, tr.id);
      if (!arr) return;
      Audio.sfx('stairs');
      World.enter(arr.areaId, arr);
    },

    /* ---------- combat ---------- */
    doAttack: function (en) {
      P.swing = 0.22;
      P.swingDir = (P.swingDir === 1 ? -1 : 1);
      var dm = P.dmg() + Math.floor(Math.random() * 3);
      var crit = Math.random() < 0.08;
      if (crit) dm = Math.round(dm * 1.5);
      en.takeDamage(dm, crit);
      P.facingX = en.x - P.x; P.facingY = en.y - P.y;
      var l = Math.sqrt(P.facingX * P.facingX + P.facingY * P.facingY) || 1;
      P.facingX /= l; P.facingY /= l;
    },

    takeDamage: function (amount) {
      if (P.dead) return;
      var red = Math.max(1, Math.round(amount - P.armor() * 0.7));
      P.hp -= red;
      P.hurtFlash = 0.35;
      Render.addText(P.x, P.y - 0.55, '-' + red, '#ff6a5a');
      Audio.sfx('hurt');
      Render.shakeScreen(2);
      if (P.hp <= 0) {
        P.hp = 0;
        P.die();
      }
    },
    die: function () {
      P.dead = true;
      var lost = Math.floor(P.gold * 0.1);
      P.gold -= lost;
      UI.toast('You fall... and awaken in Thornhollow, poorer by ' + lost + ' gold.');
      P.hp = P.maxHp; P.mp = P.maxMp;
      P.dead = false;
      P.targetEnemy = null; P.pending = null; P.path = null;
      World.enter('town', { x: 27, y: 22, grace: true });
    },

    attackTarget: function (en) {
      P.targetEnemy = en.id;
      P.pending = null;
    },

    /* ---------- abilities ---------- */
    cast: function (id) {
      var def = CFG.ABILITIES[id];
      if (!def) return;
      if (P.abilityCd[id] > 0) return;
      if (P.mp < def.mana) {
        UI.toast('Not enough mana.');
        return;
      }
      P.mp -= def.mana;
      P.abilityCd[id] = def.cd;
      var lvl = P.level;
      if (id === 'firebolt') {
        var aim = Input.aimWorld();
        var dx = aim.x - P.x, dy = aim.y - P.y;
        var l = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= l; dy /= l;
        P.facingX = dx; P.facingY = dy;
        Render.addProjectile({
          x: P.x + dx * 0.5, y: P.y + dy * 0.5,
          vx: dx * 7.5, vy: dy * 7.5,
          dmg: def.dmg(lvl), owner: 'player', kind: 'firebolt', life: 1.6
        });
        Audio.sfx('firebolt');
      } else if (id === 'nova') {
        var dmgv = def.dmg(lvl);
        var a = World.curArea();
        for (var i = 0; i < a.enemies.length; i++) {
          var en = a.enemies[i];
          if (en.dead) continue;
          if (Util.dist(en.x, en.y, P.x, P.y) <= 3.0) {
            en.takeDamage(dmgv, false);
            var ex = en.x - P.x, ey = en.y - P.y;
            var el = Math.sqrt(ex * ex + ey * ey) || 1;
            en.knockback(ex / el, ey / el, 1.2);
          }
        }
        Render.addNova(P.x, P.y);
        Audio.sfx('nova');
      } else if (id === 'heal') {
        var amt = def.amount(lvl);
        P.hp = Math.min(P.maxHp, P.hp + amt);
        Render.addText(P.x, P.y - 0.6, '+' + amt, '#7affa0');
        Render.addHealFx(P.x, P.y);
        Audio.sfx('heal');
      }
    },

    usePotionHot: function (type) {
      if (P.potionCd > 0) return;
      var t = type === 'potionH' ? 'potionH' : 'potionM';
      if (Items.countPotion(t) <= 0) {
        UI.toast(type === 'potionH' ? 'No health potions left.' : 'No mana potions left.');
        return;
      }
      P.potionCd = 0.9;
      if (Items.usePotion(t)) {
        Audio.sfx('potion');
        Render.addText(P.x, P.y - 0.6, type === 'potionH' ? 'Quaffed!' : 'Mana restored', '#8fd0ff');
        UI.refreshPanels();
      }
    },

    /* ---------- progression ---------- */
    gainXp: function (n) {
      P.xp += n;
      var leveled = false;
      while (P.xp >= CFG.xpNeeded(P.level)) {
        P.xp -= CFG.xpNeeded(P.level);
        P.level++;
        P.maxHp += CFG.PLAYER.hpPerLevel;
        P.maxMp += CFG.PLAYER.mpPerLevel;
        P.baseDmg += CFG.PLAYER.dmgPerLevel;
        P.baseArmor += CFG.PLAYER.armorPerLevel;
        leveled = true;
      }
      if (leveled) {
        P.hp = P.maxHp;
        P.mp = P.maxMp;
        Audio.sfx('levelup');
        UI.toast('You have reached level ' + P.level + '!');
        Render.addText(P.x, P.y - 0.8, 'LEVEL ' + P.level, '#ffd54d');
      }
    },

    /* ---------- interaction ---------- */
    setPending: function (type, x, y, range, fn) {
      P.pending = { type: type, x: x, y: y, range: range, fn: fn };
      P.targetEnemy = null;
      if (Util.dist(P.x, P.y, x + 0.5, y + 0.5) <= range) {
        P.pending = null;
        if (fn) fn();
      }
    },

    equipItem: function (invIdx) {
      var st = P.inventory[invIdx];
      if (!st) return;
      var slot = Items.slotOf(st.it);
      if (!slot) {
        if (Items.isPotion(st.it)) {
          if (P.potionCd > 0) return;
          P.potionCd = 0.9;
          Items.usePotion(st.it.type);
          Audio.sfx('potion');
          UI.refreshPanels();
        }
        return;
      }
      if (st.it.lvl > P.level) {
        UI.toast('You need level ' + st.it.lvl + ' to use that.');
        return;
      }
      var old = P.equip[slot];
      P.equip[slot] = st.it;
      P.inventory.splice(invIdx, 1);
      if (old) P.inventory.splice(Math.min(invIdx, P.inventory.length), 0, { it: old, qty: 1 });
      Audio.sfx('equip');
      UI.refreshPanels();
    },

    unequip: function (slot) {
      var it = P.equip[slot];
      if (!it) return;
      if (!Items.addToInv(it, 1)) {
        UI.toast('Inventory full.');
        return;
      }
      P.equip[slot] = null;
      Audio.sfx('equip');
      UI.refreshPanels();
    }
  };

  return P;
})();

'use strict';
/* ============================================================
   Emberfall - 08_enemies.js : enemy types, AI, corpses, bosses
   ============================================================ */
var Enemies = (function () {

  var TYPES = {
    scavenger: {
      name: 'Scavenger', hp: 16, dmg: 3, dvar: 2, speed: 2.4, xp: 8, aggro: 7,
      melee: true, attackCd: 1.1, corpse: 'robed', scale: 1,
      sprite: { robe: '#5a5240', trim: '#6d6250', hood: true, weapon: 'club' }
    },
    wolf: {
      name: 'Thornwolf', hp: 22, dmg: 4, dvar: 2, speed: 3.6, xp: 12, aggro: 8,
      melee: true, attackCd: 0.9, corpse: 'wolf', scale: 1, quadruped: true,
      sprite: { fur: '#5a5c50' }
    },
    gargoyle: {
      name: 'Flesh Gargoyle', hp: 26, dmg: 6, dvar: 2, speed: 3.0, xp: 16, aggro: 7,
      melee: true, attackCd: 0.95, corpse: 'robed', scale: 1,
      sprite: { robe: '#4e4e58', trim: '#5c5c68', horn: true, skin: '#9a9a94' }
    },
    cultist: {
      name: 'Raven Cultist', hp: 30, dmg: 6, dvar: 2, speed: 2.3, xp: 18, aggro: 8,
      melee: false, range: 5.5, attackCd: 2.0, corpse: 'robed', scale: 1,
      sprite: { robe: '#4a2430', trim: '#6d3a46', hood: true, weapon: 'staff', staffOrb: '#a34a6a' }
    },
    terror: {
      name: 'Crypt Terror', hp: 34, dmg: 6, dvar: 3, speed: 2.4, xp: 20, aggro: 7,
      melee: true, attackCd: 1.0, corpse: 'skeleton', scale: 1,
      sprite: { robe: '#3a3a40', trim: '#4a4a52', skull: true, weapon: 'sword' }
    },
    wraith: {
      name: 'Rotwraith', hp: 24, dmg: 6, dvar: 2, speed: 2.2, xp: 22, aggro: 8,
      melee: false, range: 5.0, attackCd: 2.2, corpse: 'wraith', scale: 1, ghost: true,
      sprite: { robe: '#5a6a80', trim: '#6d8098', skull: true }
    },
    brute: {
      name: 'Bone Brute', hp: 70, dmg: 9, dvar: 4, speed: 2.0, xp: 34, aggro: 6,
      melee: true, attackCd: 1.3, corpse: 'brute', scale: 1.25,
      sprite: { robe: '#464038', trim: '#57504a', skull: true, weapon: 'club' }
    },
    warden: {
      name: 'Grave Warden', hp: 110, dmg: 10, dvar: 4, speed: 2.1, xp: 60, aggro: 8,
      melee: true, attackCd: 1.15, corpse: 'skeleton', scale: 1.3, elite: true,
      sprite: { robe: '#3d3d46', trim: '#6a5a3a', skull: true, weapon: 'axe', crown: true }
    },
    cantor: {
      name: 'High Cantor Vash', hp: 260, dmg: 12, dvar: 4, speed: 2.0, xp: 300, aggro: 9,
      melee: false, range: 6.5, attackCd: 2.2, corpse: 'robed', scale: 1.45, boss: true, bossId: 'cantor',
      sprite: { robe: '#5e2430', trim: '#c9a24a', hood: true, weapon: 'staff', staffOrb: '#c95a7a', crown: true, cape: '#3a1620' }
    },
    marrow: {
      name: 'Marrow, the Hollow King', hp: 420, dmg: 14, dvar: 6, speed: 2.2, xp: 500, aggro: 9,
      melee: true, attackCd: 1.25, corpse: 'king', scale: 1.6, boss: true, bossId: 'marrow',
      sprite: { robe: '#3c3430', trim: '#c9a24a', skull: true, weapon: 'sword', crown: true, cape: '#2a1c24' }
    }
  };

  function make(type, id, x, y) {
    var def = TYPES[type];
    if (!def) return null;
    var e = {
      id: id, type: type, def: def,
      x: x + 0.5, y: y + 0.5,
      hp: def.hp, maxHp: def.hp,
      dead: false, corpseT: 0,
      state: 'idle', aggro: false,
      homeX: x + 0.5, homeY: y + 0.5,
      path: null, pathIdx: 0,
      repathT: 0, attackT: Math.random() * 0.6, wanderT: Math.random() * 2,
      lunge: 0, hitFlash: 0, barShow: 0,
      kvx: 0, kvy: 0,
      scale: def.scale || 1,
      boltT: 0, chargeT: 6, novaUsed: false,
      wanderX: x + 0.5, wanderY: y + 0.5
    };
    e.takeDamage = function (dmgv, crit) { Enemies.takeDamage(e, dmgv, crit); };
    e.knockback = function (dx, dy, amt) {
      e.kvx += dx * amt * 3;
      e.kvy += dy * amt * 3;
    };
    return e;
  }

  function get(area, id) {
    if (typeof id === 'object') return id;
    for (var i = 0; i < area.enemies.length; i++) {
      if (area.enemies[i].id === id) return area.enemies[i];
    }
    return null;
  }

  function spawnArea(area) {
    area.enemies = [];
    for (var i = 0; i < area.spawns.length; i++) {
      var s = area.spawns[i];
      var id = area.id + ':e' + i;
      if (area.deadEnemies[id]) continue;
      area.enemies.push(make(s.type, id, s.x, s.y));
    }
    if (area.boss && !area.bossDead) {
      var bid = area.id + ':boss';
      if (!area.deadEnemies[bid]) {
        area.enemies.push(make(area.boss.type, bid, area.boss.x, area.boss.y));
      }
    }
  }

  function removeDead(area) {
    for (var i = area.enemies.length - 1; i >= 0; i--) {
      if (area.deadEnemies[area.enemies[i].id]) area.enemies.splice(i, 1);
    }
  }
  function removeEnemy(area, id) {
    for (var i = 0; i < area.enemies.length; i++) {
      if (area.enemies[i].id === id) { area.enemies.splice(i, 1); return; }
    }
  }

  function tileX(e) { return Math.floor(e.x); }
  function tileY(e) { return Math.floor(e.y); }

  function hasLOS(e, px, py) {
    var a = World.curArea();
    return Util.lineLOS(tileX(e), tileY(e), Math.floor(px), Math.floor(py), function (x, y) {
      return World.losBlocked(a, x, y);
    }, 40);
  }

  function update(e, dt, a) {
    if (e.dead) {
      e.corpseT -= dt;
      return;
    }
    var px = Player.x, py = Player.y;
    var d = Util.dist(e.x, e.y, px, py);
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.lunge = Math.max(0, e.lunge - dt);
    e.barShow = Math.max(0, e.barShow - dt);

    // knockback
    if (e.kvx || e.kvy) {
      var nx = e.x + e.kvx * dt, ny = e.y + e.kvy * dt;
      if (World.walkable(a, Math.floor(nx), Math.floor(ny))) { e.x = nx; e.y = ny; }
      e.kvx *= Math.pow(0.02, dt); e.kvy *= Math.pow(0.02, dt);
      if (Math.abs(e.kvx) < 0.05) e.kvx = 0;
      if (Math.abs(e.kvy) < 0.05) e.kvy = 0;
    }

    // aggro
    if (!e.aggro) {
      if (d <= e.def.aggro && hasLOS(e, px, py)) {
        e.aggro = true;
        e.barShow = 6;
        if (e.def.boss) {
          UI.bossBarShow(e.def.name, e.hp, e.maxHp);
          Audio.sfx('roar');
        }
      }
    }
    if (e.aggro) {
      e.barShow = Math.max(e.barShow, 1.5);
      if (e.def.boss) UI.bossBarUpdate(e.hp, e.maxHp);
      // leash: return home
      if (d > 16) {
        e.aggro = false;
        if (e.def.boss) UI.bossBarHide();
        var hp = Util.findPath(a.w, a.h, function (x, y) { return World.blocked(a, x, y); }, tileX(e), tileY(e), Math.floor(e.homeX), Math.floor(e.homeY), 3000);
        if (hp && hp.length) { e.path = hp; e.pathIdx = 0; }
        return;
      }
      // ranged logic
      if (!e.def.melee) {
        var boltCd = e.def.attackCd;
        if (e.def.boss) {
          // cantor: 3-bolt spread + nova when player close
          if (d <= 3.2 && e.chargeT <= 0) {
            e.chargeT = 7;
            novaBurst(e, 16, 3.4);
            return;
          }
          boltCd = 2.4;
        }
        if (d <= e.def.range && hasLOS(e, px, py)) {
          e.attackT -= dt;
          if (e.attackT <= 0) {
            e.attackT = boltCd;
            e.lunge = 0.3;
            shoot(e, px, py);
          }
          return; // stand and cast
        }
      } else {
        // melee
        if (d <= 1.2) {
          e.attackT -= dt;
          if (e.attackT <= 0) {
            e.attackT = e.def.attackCd;
            e.lunge = 0.28;
            var dm = e.def.dmg + Math.floor(Math.random() * (e.def.dvar + 1));
            Player.takeDamage(dm);
            Audio.sfx('hit');
          }
          return;
        }
        // boss charge / nova
        if (e.def.boss) {
          if (d <= 2.6 && e.chargeT <= 0) {
            e.chargeT = 6.5;
            novaBurst(e, 18, 3.0);
            return;
          }
          if (e.hp < e.maxHp * 0.5 && !e.novaUsed) {
            e.novaUsed = true;
            novaBurst(e, 22, 4.0);
            UI.toast('Marrow unleashes the Charnel Howl!');
            return;
          }
        }
      }
      e.chargeT = Math.max(0, (e.chargeT || 0) - dt);
      // chase
      e.repathT -= dt;
      if (e.repathT <= 0 || !e.path || e.pathIdx >= e.path.length) {
        e.repathT = 0.55 + Math.random() * 0.25;
        var pp = Util.findPath(a.w, a.h, function (x, y) { return World.blocked(a, x, y); }, tileX(e), tileY(e), Math.floor(px), Math.floor(py), 2500);
        if (pp && pp.length >= 2) { e.path = pp; e.pathIdx = 1; }
        else e.path = null;
      }
      if (e.path && e.pathIdx < e.path.length) {
        var wp = e.path[e.pathIdx];
        var wx = wp.x + 0.5, wy = wp.y + 0.5;
        var dx = wx - e.x, dy = wy - e.y;
        var dl = Math.sqrt(dx * dx + dy * dy);
        var sp = e.def.speed * dt;
        if (dl < 0.08 || sp >= dl) {
          e.x = wx; e.y = wy;
          e.pathIdx++;
        } else {
          var mx = dx / dl * sp, my = dy / dl * sp;
          var nx2 = e.x + mx, ny2 = e.y + my;
          if (World.walkable(a, Math.floor(nx2), Math.floor(ny2))) {
            e.x = nx2; e.y = ny2;
          } else {
            e.pathIdx++;
          }
        }
      }
    } else {
      // idle wander
      e.wanderT -= dt;
      if (e.wanderT <= 0) {
        e.wanderT = 1.5 + Math.random() * 2.5;
        if (Math.random() < 0.6) {
          var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
          var dd2 = dirs[Math.floor(Math.random() * 4)];
          var wnx = tileX(e) + dd2[0], wny = tileY(e) + dd2[1];
          if (World.walkable(a, wnx, wny)) { e.wanderX = wnx + 0.5; e.wanderY = wny + 0.5; }
        }
      }
      var wdx = e.wanderX - e.x, wdy = e.wanderY - e.y;
      var wdl = Math.sqrt(wdx * wdx + wdy * wdy);
      if (wdl > 0.2) {
        var wsp = e.def.speed * 0.35 * dt;
        e.x += wdx / wdl * wsp;
        e.y += wdy / wdl * wsp;
      }
    }
  }

  function shoot(e, tx, ty) {
    var dx = tx - e.x, dy = ty - e.y;
    var l = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= l; dy /= l;
    var dm = e.def.dmg + Math.floor(Math.random() * (e.def.dvar + 1));
    Render.addProjectile({
      x: e.x + dx * 0.4, y: e.y + dy * 0.4,
      vx: dx * 5.2, vy: dy * 5.2,
      dmg: dm, owner: 'enemy', kind: 'bolt', life: 1.8
    });
    Audio.sfx('bolt');
  }
  function novaBurst(e, dmgv, radius) {
    var d = Util.dist(e.x, e.y, Player.x, Player.y);
    if (d <= radius) Player.takeDamage(dmgv);
    Render.addNova(e.x, e.y);
    Audio.sfx('nova');
  }

  function takeDamage(e, dmgv, crit) {
    if (e.dead) return;
    e.hp -= dmgv;
    e.hitFlash = 0.18;
    e.barShow = 4;
    Render.addText(e.x, e.y - 0.75, (crit ? 'CRIT ' : '') + dmgv, crit ? '#ffd54d' : '#f0e6d0');
    if (!e.aggro) {
      e.aggro = true;
      if (e.def.boss) UI.bossBarShow(e.def.name, e.hp, e.maxHp);
    }
    if (e.hp <= 0) kill(e);
  }

  function kill(e) {
    e.dead = true;
    e.corpseT = e.def.boss ? 99999 : 6.5;
    e.aggro = false;
    var a = World.curArea();
    a.deadEnemies[e.id] = true;
    Audio.sfx('death');
    // loot
    if (e.def.boss) {
      var entries = [
        { kind: 'gold', amount: 120 + Math.floor(Math.random() * 60) },
        { kind: 'item', item: Items.rollRandomItem(new Util.RNG(Math.floor(Math.random() * 1e9)), a) }
      ];
      if (e.def.bossId === 'marrow') {
        entries.push({ kind: 'item', item: Items.make('quest_relic') });
        a.doors.vault.open = true;
        UI.toast('The sealed gate grinds open...');
        Audio.sfx('gate');
      }
      if (e.def.bossId === 'cantor') {
        a.altar.locked = false;
        UI.toast('The censer is unsealed!');
      }
      a.bossDead = true;
      Items.dropLoot(a, Math.floor(e.x), Math.floor(e.y), entries);
      UI.bossBarHide();
      Quests.onBossKill(e.def.bossId);
      Game.autosave();
      return;
    }
    var loot = Items.rollEnemyLoot(e.type, e.def.xp);
    Items.dropLoot(a, Math.floor(e.x), Math.floor(e.y), loot);
    Player.gainXp(e.def.xp);
    Quests.onKill(e.type);
  }

  return {
    TYPES: TYPES,
    make: make, get: get,
    spawnArea: spawnArea, removeDead: removeDead, removeEnemy: removeEnemy,
    update: update, takeDamage: takeDamage, kill: kill,
    tileX: tileX, tileY: tileY
  };
})();

'use strict';
/* ============================================================
   Emberfall - 09_quests.js : quest definitions, state, journal
   ============================================================ */
var Quests = (function () {

  var DEFS = {
    scavengers: {
      id: 'scavengers', title: 'Vermin in the Ruins', giver: 'rooke',
      desc: 'Cull the scavengers prowling the outskirts of Thornhollow.',
      lore: 'The Constable has seen dark shapes skulking among the old graves beyond the east gate. They pry at the tombs and gnaw on whatever they drag out. If they are left to breed, the roads will not be safe for anyone.',
      objective: { type: 'killType', enemy: 'scavenger', count: 4, text: 'Slay scavengers in the Grimmoor Wilds' },
      reward: { gold: 70, xp: 60, items: [{ id: 'potion_h', qty: 2 }] }
    },
    wolves: {
      id: 'wolves', title: 'Thorns on the Prowl', giver: 'orin',
      desc: 'Thornwolves are harrying the trade road. Thin their pack.',
      lore: 'Orin\'s last shipment of ore never reached the smithy. The wain was found overturned near the treeline, its guards run through with brambles. Thornwolves, he swears \u2014 and wolves with a taste for men do not forget it.',
      objective: { type: 'killType', enemy: 'wolf', count: 5, text: 'Slay thornwolves in the Grimmoor Wilds' },
      reward: { gold: 60, xp: 50, items: [{ id: 'sword_warden' }] }
    },
    relic: {
      id: 'relic', title: 'The Lost Censer', giver: 'fenwick',
      desc: 'Recover the Sunstone Censer from the High Chancel of the cathedral.',
      lore: 'Before the shadow fell, the Sunstone Censer burned night and day upon the high altar. Its light kept the lower vaults sealed. When the choir fell silent and the censer went dark, the seals below began to weaken. Bring it back, and something of the old wards may be restored.',
      objective: { type: 'relic', text: 'Defeat the High Cantor and recover the Sunstone Censer' },
      reward: { gold: 150, xp: 120, items: [{ id: 'ring_abbot' }] }
    },
    reachB2: {
      id: 'reachB2', title: 'The Sealed Depths', giver: 'corvyn',
      desc: 'Descend beneath the cathedral and reach the second crypt level.',
      lore: 'The old charts show two levels of charnel halls beneath the choir, sealed after the plague years. Elderman Corvyn wants proof that the deep doors still hold \u2014 or news of what has broken loose, if they do not.',
      objective: { type: 'reachArea', area: 'b2', text: 'Reach B2F of the catacombs' },
      reward: { gold: 80, xp: 70 }
    },
    terrors: {
      id: 'terrors', title: 'Cleanse the Catacombs', giver: 'ilsa',
      desc: 'Destroy the crypt terrors that stir beneath the cathedral.',
      lore: 'Ilsa\'s lanterns burn blue when the dead walk close. Lately they burn blue every night. The crypts below the old cathedral are waking, and the terrors within them are only the first. Cull them before they find the stairs.',
      objective: { type: 'killType', enemy: 'terror', count: 8, text: 'Destroy crypt terrors in the catacombs' },
      reward: { gold: 100, xp: 90, items: [{ id: 'potion_m', qty: 3 }] }
    },
    hollowking: {
      id: 'hollowking', title: 'The Hollow King', giver: 'corvyn',
      desc: 'Descend to the Charnel Throne and destroy Marrow, the Hollow King.',
      lore: 'The deepest hall was never a tomb. It is a throne room, and something still sits upon the throne \u2014 a king whose bones were hollowed out and filled with malice. While Marrow wears his crown of ash, the catacombs will never sleep. End him, and bring back his reliquary as proof.',
      objective: { type: 'defeatBoss', boss: 'marrow', text: 'Defeat Marrow, the Hollow King, on B4F' },
      reward: { gold: 300, xp: 250, items: [{ id: 'staff_dawn' }] },
      prereq: 'reachB2'
    }
  };

  var Q = {}; // player quest state: {id: {state, progress}}
  var relicBossDead = false;
  var relicItemTaken = false;

  function reset() {
    Q = {};
    relicBossDead = false;
    relicItemTaken = false;
  }

  function state(id) { return Q[id] ? Q[id].state : null; }
  function isActive(id) { return state(id) === 'active'; }
  function isReady(id) { return state(id) === 'ready'; }
  function isCompleted(id) { return state(id) === 'completed'; }

  function accept(id) {
    if (Q[id]) return;
    Q[id] = { state: 'active', progress: 0 };
    Audio.sfx('quest');
    UI.toast('Quest accepted: ' + DEFS[id].title);
    UI.refreshPanels();
  }
  function decline(id) {
    Audio.sfx('click');
  }

  function canOffer(npcId) {
    var out = [];
    for (var id in DEFS) {
      var d = DEFS[id];
      if (d.giver !== npcId) continue;
      if (Q[id]) continue;
      if (d.prereq) {
        var pr = Q[d.prereq];
        if (!pr || (pr.state !== 'ready' && pr.state !== 'completed')) continue;
      }
      out.push(id);
    }
    return out;
  }
  function readyFor(npcId) {
    var out = [];
    for (var id in Q) {
      if (Q[id].state === 'ready' && DEFS[id].giver === npcId) out.push(id);
    }
    return out;
  }

  function progressText(id) {
    var d = DEFS[id];
    var q = Q[id] || { progress: 0 };
    var o = d.objective;
    switch (o.type) {
      case 'killType':
        return 'Objective: ' + Math.min(q.progress, o.count) + ' / ' + o.count + ' ' + Enemies.TYPES[o.enemy].name + 's';
      case 'reachArea':
        return 'Objective: ' + (q.progress ? 'Reached \u2014 ' : 'Travel to ') + World.tileName(o.area);
      case 'defeatBoss':
        return 'Objective: ' + (q.progress ? 'Defeated' : 'Slay ') + ' ' + Enemies.TYPES[o.boss].name;
      case 'relic':
        return 'Objective: ' + (relicBossDead ? (relicItemTaken ? 'Censer recovered' : 'Censer recovered \u2014 take it from the altar') : 'Defeat the High Cantor');
      default:
        return 'Objective: ' + o.text;
    }
  }
  function rewardText(id) {
    var r = DEFS[id].reward;
    var parts = [];
    if (r.gold) parts.push(r.gold + ' gold');
    if (r.xp) parts.push(r.xp + ' XP');
    if (r.items && r.items.length) {
      for (var i = 0; i < r.items.length; i++) {
        var it = Items.make(r.items[i].id);
        if (it) parts.push((r.items[i].qty > 1 ? r.items[i].qty + 'x ' : '') + it.name);
      }
    }
    return 'Reward: ' + parts.join(', ');
  }

  /* ---------- hooks ---------- */
  function onKill(type) {
    for (var id in Q) {
      if (Q[id].state !== 'active') continue;
      var o = DEFS[id].objective;
      if (o.type === 'killType' && o.enemy === type) {
        Q[id].progress = Math.min(o.count, (Q[id].progress || 0) + 1);
        if (Q[id].progress >= o.count) {
          Q[id].state = 'ready';
          UI.toast('Quest complete: ' + DEFS[id].title + ' \u2014 return to your patron!');
          Audio.sfx('quest');
        } else {
          UI.questPulse(id);
        }
        UI.refreshPanels();
      }
    }
  }
  function onEnter(areaId) {
    for (var id in Q) {
      if (Q[id].state !== 'active') continue;
      var o = DEFS[id].objective;
      if (o.type === 'reachArea' && o.area === areaId) {
        Q[id].progress = 1;
        Q[id].state = 'ready';
        UI.toast('Quest complete: ' + DEFS[id].title + ' \u2014 return to your patron!');
        Audio.sfx('quest');
        UI.refreshPanels();
      }
    }
  }
  function onBossKill(bossId) {
    if (bossId === 'cantor') relicBossDead = true;
    for (var id in Q) {
      if (Q[id].state !== 'active') continue;
      var o = DEFS[id].objective;
      if (o.type === 'defeatBoss' && o.boss === bossId) {
        Q[id].progress = 1;
        Q[id].state = 'ready';
        UI.toast('Quest complete: ' + DEFS[id].title + ' \u2014 return to your patron!');
        Audio.sfx('quest');
        UI.refreshPanels();
      }
      if (o.type === 'relic' && bossId === 'cantor') {
        if (relicBossDead && relicItemTaken) {
          Q[id].progress = 1;
          Q[id].state = 'ready';
          UI.refreshPanels();
        }
      }
    }
  }
  function onPickupItem(itemId) {
    if (itemId === 'quest_censer' && Q.relic && Q.relic.state === 'active') {
      relicItemTaken = true;
      if (relicBossDead) {
        Q.relic.progress = 1;
        Q.relic.state = 'ready';
        UI.toast('Quest complete: ' + DEFS.relic.title + ' \u2014 return to your patron!');
        Audio.sfx('quest');
      } else {
        UI.toast('The censer is cold and heavy... it resists your touch.');
      }
      UI.refreshPanels();
    }
  }

  function turnIn(id) {
    var d = DEFS[id];
    if (!isReady(id)) return;
    Q[id].state = 'completed';
    Player.gold += d.reward.gold || 0;
    if (d.reward.xp) Player.gainXp(d.reward.xp);
    if (d.reward.items) {
      for (var i = 0; i < d.reward.items.length; i++) {
        var r = d.reward.items[i];
        var it = Items.make(r.id);
        if (!Items.addToInv(it, r.qty || 1)) {
          var a = World.curArea();
          World.addLoot(a, { kind: 'item', x: Player.x, y: Player.y, item: it });
          UI.toast('Your pack is full \u2014 ' + it.name + ' dropped at your feet.');
        }
      }
    }
    Audio.sfx('reward');
    UI.toast('Quest complete: ' + d.title + '!');
    Game.autosave();
    UI.refreshPanels();
  }

  function list() {
    var out = [];
    for (var id in DEFS) {
      if (Q[id]) out.push({ def: DEFS[id], st: Q[id] });
    }
    return out;
  }

  function serialize() {
    var out = {};
    for (var id in Q) out[id] = Q[id];
    return { quests: out, relicBossDead: relicBossDead ? 1 : 0, relicItemTaken: relicItemTaken ? 1 : 0 };
  }
  function deserialize(s) {
    Q = {};
    if (s.quests) for (var id in s.quests) Q[id] = { state: s.quests[id].state, progress: s.quests[id].progress };
    relicBossDead = !!s.relicBossDead;
    relicItemTaken = !!s.relicItemTaken;
  }

  return {
    DEFS: DEFS,
    reset: reset, accept: accept, decline: decline,
    state: state, isActive: isActive, isReady: isReady, isCompleted: isCompleted,
    canOffer: canOffer, readyFor: readyFor,
    progressText: progressText, rewardText: rewardText,
    onKill: onKill, onEnter: onEnter, onBossKill: onBossKill, onPickupItem: onPickupItem,
    turnIn: turnIn, list: list,
    serialize: serialize, deserialize: deserialize
  };
})();

'use strict';
/* ============================================================
   Emberfall - 10_npcs.js : NPCs, dialogue engine, shops
   ============================================================ */
var NPC = (function () {

  var NPCS = {
    orin: {
      id: 'orin', name: 'Orin Vane', role: 'Blacksmith', area: 'town', shop: 'smith',
      sprite: { robe: '#5a4634', trim: '#8a6f4a', hair: '#3a2a1a', beard: '#4a3a28', weapon: 'none' },
      idle: 'Orin Vane, at your service. Steel for your back, nails for your roof \u2014 or just a warm fire and a colder ale. What\'ll it be?',
      offer: {
        wolves: 'A word, friend. My last ore wain came back empty and painted red. The guards were run through with brambles \u2014 thornwolves, bold as bandits. If you can thin that pack, the road opens again.'
      },
      done: {
        wolves: 'Ha! The wolves have gone to ground and the wains are rolling again. You swing a clean blade. I\'ve something better for your hand \u2014 on the house, as they say.'
      },
      after: 'Come by if your blade needs weight behind it.'
    },
    merith: {
      id: 'merith', name: 'Sister Merith', role: 'Healer', area: 'town', shop: 'healer', heal: true,
      sprite: { robe: '#8a8478', trim: '#5f6a4a', hair: '#a89a7a' },
      idle: 'Rest when you can, wayfarer. The shadows outside drink a body\'s strength like well water. I can tend your hurts, and my shelves hold what a traveler needs.',
      after: 'The Abbot keeps the cathedral doors. Say a kind word for me if you find him.'
    },
    ilsa: {
      id: 'ilsa', name: 'Ilsa Wisp-Eye', role: 'Occult Peddler', area: 'town', shop: 'occult',
      sprite: { robe: '#3d2a4a', trim: '#7a5ad8', hair: '#2a1a3a', hood: true, weapon: 'staff', staffOrb: '#7a5ad8' },
      idle: 'Lanterns, charms, tonics, talismans. All of it works \u2014 more or less. The less it works, the cheaper it is. Have a look.',
      offer: {
        terrors: 'My lamps burn blue when the dead walk close, and lately they burn blue every night. The crypts beneath the old cathedral are waking, and the terrors within are only the first of it. Cull them before they find the stairs \u2014 I would rather not board my own door shut.'
      },
      done: {
        terrors: 'The blue has gone out of my lamps. Lovely. Simply lovely. Here \u2014 a few drops of something stronger, and my thanks with them.'
      },
      after: 'If you go deeper, mind the wraiths. They were people once, and they remember being cold.'
    },
    corvyn: {
      id: 'corvyn', name: 'Elderman Corvyn', role: 'Scholar', area: 'town',
      sprite: { robe: '#4a4a58', trim: '#8a8a9a', hair: '#c9c9c9', beard: '#c9c9c9' },
      idle: 'Thornhollow is built on older stones \u2014 a cathedral over a shrine, a shrine over a barrow. I study them. Occasionally, I suspect they study me back.',
      offer: {
        reachB2: 'The charters speak of two levels of charnel halls beneath the choir, sealed after the plague years. Two levels \u2014 then the Throne. I need to know whether the deep doors still hold. Will you descend to B2F and return with what you see?',
        hollowking: 'So the second level held. Then listen: the deepest hall was never a tomb. It is a throne room, and something still sits upon the throne \u2014 a king whose bones were hollowed out and filled with malice. While Marrow wears his crown of ash, the catacombs will never sleep. End him. Bring back his reliquary as proof.'
      },
      done: {
        reachB2: 'You reached B2F and came back whole! The seals are weaker than I hoped and stronger than I feared. You have earned your fee, and my attention \u2014 I will want your account of the lower halls.',
        hollowking: 'Marrow is ended. A century of prayer could not do what you did in an afternoon. The reliquary\u2026 yes, that is it. Take this staff \u2014 it was forged to break things like him.'
      },
      after: 'History keeps its receipts, wayfarer. So do I.'
    },
    rooke: {
      id: 'rooke', name: 'Constable Rooke', role: 'Town Guard', area: 'town',
      sprite: { robe: '#3a3f4a', trim: '#8a8a9a', hair: '#2a2a30', weapon: 'sword' },
      idle: 'Keep to the road, and if you don\'t \u2014 carry something sharp. The wilds past the gate are no garden.',
      offer: {
        scavengers: 'Grave-robbers, or worse. Dark shapes out beyond the east gate, prying at the old graves and gnawing at whatever they drag out. If they breed, no road will be safe. Four of them \u2014 cull four and the message will be clear.'
      },
      done: {
        scavengers: 'Four fewer shadows at the graveyard. Good, clean work. The dead can keep their shrouds, and the living can keep their roads.'
      },
      after: 'If you head for the wilds, the old shrine is a fair landmark. The cave past it \u2014 that one is not.'
    },
    marta: {
      id: 'marta', name: 'Old Marta', role: 'Townswoman', area: 'town',
      sprite: { robe: '#6a5a48', trim: '#8a7a60', hair: '#9a9a9a' },
      idle: 'When I was a girl, the cathedral bell rang the hours \u2014 you could set a kettle by it. It hasn\'t rung in forty years. Funny, the sounds you end up missing.',
      after: 'The well water\'s still sweet. The wilds keep their wolves, and the crypts keep their dead \u2014 mostly. That\'s the whole catechism of Thornhollow.'
    },
    fenwick: {
      id: 'fenwick', name: 'Abbot Fenwick', role: 'Keeper of the Cathedral', area: 'cath1',
      sprite: { robe: '#6a6a78', trim: '#c9a24a', hair: '#b8b8c4', weapon: 'staff', staffOrb: '#ffd97a' },
      idle: 'This was a house of light once. Now the only light that comes through these doors is what you bring in with you.',
      offer: {
        relic: 'Before the shadow fell, the Sunstone Censer burned night and day upon the high altar, and its light kept the lower vaults sealed. When the choir fell silent, the censer went dark \u2014 and something has since taken the High Chancel for its own. Climb to 3F, defeat the High Cantor, and bring the censer back to me.'
      },
      done: {
        relic: 'The censer\u2026 it is warm again. Dim, but it burns. The old wards may yet be rekindled. Blessings on your road, wayfarer \u2014 take this signet. It belonged to better days.'
      },
      after: 'Guard the flame you carry. It is older than either of us.'
    }
  };

  var buybacks = {}; // npcId -> [item...]

  function get(id) { return NPCS[id]; }

  function placeAll() {
    for (var aid in World.world.areas) {
      World.world.areas[aid].npcs = [];
    }
    var town = World.getArea('town');
    town.npcs = [];
    for (var id in NPCS) {
      var npc = NPCS[id];
      if (npc.area === 'town') {
        var t = Gen.TOWN.npc[id];
        town.npcs.push({ id: id, x: t.x, y: t.y });
      } else if (npc.area === 'cath1') {
        var c1 = World.getArea('cath1');
        var d = c1.doors.doorS;
        c1.npcs.push({ id: id, x: d.in.x, y: d.in.y });
      }
    }
  }

  function npcAt(area, x, y) {
    for (var i = 0; i < area.npcs.length; i++) {
      var n = area.npcs[i];
      if (n.x === x && n.y === y) return n;
    }
    return null;
  }

  function nearMerchant(x, y) {
    var a = World.curArea();
    if (!a) return null;
    for (var i = 0; i < a.npcs.length; i++) {
      var n = a.npcs[i];
      var def = NPCS[n.id];
      if (!def || !def.shop) continue;
      if (Util.dist(x, y, n.x + 0.5, n.y + 0.5) <= CFG.PLAYER.merchantRange) return def;
    }
    return null;
  }

  /* ---------- dialogue ---------- */
  function talk(npcId) {
    var npc = NPCS[npcId];
    if (!npc) return null;
    var buttons = [];
    var ready = Quests.readyFor(npcId);
    var text;
    if (ready.length) {
      text = npc.done[ready[0]];
      for (var i = 0; i < ready.length; i++) {
        (function (qid) {
          buttons.push({ label: 'Turn In: ' + Quests.DEFS[qid].title, fn: function () {
            Quests.turnIn(qid);
            UI.openDialogue(npcId);
          } });
        })(ready[i]);
      }
    } else {
      var offers = Quests.canOffer(npcId);
      if (offers.length) {
        var qid = offers[0];
        var q = Quests.DEFS[qid];
        text = npc.offer[qid] + '\n\n' + q.title + '\n' + q.desc + '\n' + Quests.progressText(qid).replace('Objective: ', '') + '\n' + Quests.rewardText(qid);
        buttons.push({ label: 'Accept', fn: function () {
          Quests.accept(qid);
          Audio.sfx('quest');
          UI.openDialogue(npcId);
        } });
        buttons.push({ label: 'Decline', fn: function () {
          Quests.decline(qid);
          UI.closeDialogue();
        } });
      } else {
        var doneAny = false;
        for (var d in npc.done) {
          if (Quests.isCompleted(d)) { text = npc.after; doneAny = true; break; }
        }
        if (!doneAny) text = npc.idle;
      }
    }
    if (npc.shop) {
      buttons.push({ label: 'Trade', fn: function () {
        UI.closeDialogue();
        UI.openShop(npcId);
      } });
    }
    if (npc.heal) {
      buttons.push({ label: 'Heal (' + Items.HEAL_COST + ' gold)', fn: function () {
        if (Player.gold < Items.HEAL_COST) { UI.toast('Not enough gold.'); return; }
        if (Player.hp >= Player.maxHp) { UI.toast('You are already hale.'); return; }
        Player.gold -= Items.HEAL_COST;
        Player.hp = Player.maxHp;
        Audio.sfx('heal');
        Render.addHealFx(Player.x, Player.y);
        UI.toast('Sister Merith tends your wounds.');
        UI.closeDialogue();
      } });
    }
    buttons.push({ label: 'Dismiss', fn: function () { UI.closeDialogue(); } });
    return { npc: npc, text: text, buttons: buttons };
  }

  /* ---------- buying / selling ---------- */
  function buy(npcId, baseId) {
    var npc = NPCS[npcId];
    var it = Items.make(baseId);
    if (!it) return;
    if (Player.gold < it.value) { UI.toast('Not enough gold.'); Audio.sfx('deny'); return; }
    if (!Items.addToInv(it, 1)) { UI.toast('Your pack is full.'); Audio.sfx('deny'); return; }
    Player.gold -= it.value;
    Audio.sfx('buy');
    UI.toast('Bought ' + it.name + '.');
    UI.refreshPanels();
  }

  function sellFromInventory(invIdx) {
    var def = nearMerchant(Player.x, Player.y);
    if (!def) {
      UI.toast('You must be near a merchant to sell.');
      Audio.sfx('deny');
      return;
    }
    var st = Player.inventory[invIdx];
    if (!st) return;
    if (st.it.type === 'quest') {
      UI.toast('No merchant would touch that.');
      return;
    }
    var price = Items.sellPrice(st.it);
    Player.gold += price;
    Items.removeFromInv(invIdx, 1);
    if (!buybacks[def.id]) buybacks[def.id] = [];
    var list = buybacks[def.id];
    list.unshift(st.it);
    if (list.length > 12) list.pop();
    Audio.sfx('sell');
    UI.toast('Sold ' + st.it.name + ' for ' + price + ' gold.');
    UI.refreshPanels();
  }

  function buyBack(npcId, idx) {
    var list = buybacks[npcId] || [];
    var it = list[idx];
    if (!it) return;
    var price = Items.sellPrice(it);
    if (Player.gold < price) { UI.toast('Not enough gold.'); return; }
    if (!Items.addToInv(it, 1)) { UI.toast('Your pack is full.'); return; }
    list.splice(idx, 1);
    Player.gold -= price;
    Audio.sfx('buy');
    UI.toast('Bought back ' + it.name + '.');
    UI.refreshPanels();
  }

  function buybackList(npcId) { return buybacks[npcId] || []; }

  function serialize() {
    return { buybacks: buybacks };
  }
  function deserialize(s) {
    buybacks = (s && s.buybacks) ? s.buybacks : {};
  }

  return {
    NPCS: NPCS,
    get: get, placeAll: placeAll, npcAt: npcAt,
    nearMerchant: nearMerchant, talk: talk,
    buy: buy, sellFromInventory: sellFromInventory,
    buyBack: buyBack, buybackList: buybackList,
    serialize: serialize, deserialize: deserialize
  };
})();

'use strict';
/* ============================================================
   Emberfall - 11_input.js : mouse & keyboard
   ============================================================ */
var Input = (function () {

  var mouseX = 0, mouseY = 0;
  var dragging = false;
  var lastDragTile = null;
  var lastDragTime = 0;

  function bind(canvas) {
    canvas.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (e.button === 2) return;
      var rect = canvas.getBoundingClientRect();
      var sx = e.clientX - rect.left;
      var sy = e.clientY - rect.top;
      mouseX = sx; mouseY = sy;
      if (UI.modalOpen()) { UI.closeTopModal(); return; }
      onDown(sx, sy);
    });
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (dragging) {
        var now = Util.now();
        if (now - lastDragTime > 55) {
          lastDragTime = now;
          dragStep();
        }
      }
    });
    window.addEventListener('mouseup', function () {
      dragging = false;
      lastDragTile = null;
    });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.repeat) return;
    var k = e.key;
    var handled = true;
    switch (k) {
      case 'Escape':
        if (UI.modalOpen()) UI.closeTopModal();
        else UI.togglePause();
        break;
      case 'i': case 'I': UI.togglePanel('inventory'); break;
      case 'j': case 'J': UI.togglePanel('journal'); break;
      case 'c': case 'C': UI.togglePanel('character'); break;
      case 'm': case 'M': UI.togglePanel('automap'); break;
      case '1': Player.cast('firebolt'); break;
      case '2': Player.cast('nova'); break;
      case '3': Player.cast('heal'); break;
      case 'q': case 'Q': Player.usePotionHot('potionH'); break;
      case 'w': case 'W': Player.usePotionHot('potionM'); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  }

  function tileAtScreen(sx, sy) {
    var w = Render.screenToWorld(sx, sy);
    if (!w) return null;
    // diamond hit test over candidate tiles
    var TW = CFG.TILE_W, TH = CFG.TILE_H;
    var fx = w.x / (TW / 2), fy = w.y / (TH / 2);
    var tx = (fx + fy) / 2, ty = (fy - fx) / 2;
    var cx = Math.round(tx), cy = Math.round(ty);
    for (var r = 0; r < 6; r++) {
      var x0 = cx - r, x1 = cx + r, y0 = cy - r, y1 = cy + r;
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          if (x !== x0 && x !== x1 && y !== y0 && y !== y1) continue;
          var cxs = (x - y) * TW / 2, cys = (x + y) * TH / 2;
          var half = Math.abs(w.x - cxs) / (TW / 2) + Math.abs(w.y - cys) / (TH / 2);
          var topH = 0;
          var d = World.doorAt(World.curArea(), x, y);
          if (d && d.open) topH = 0;
          if (half <= 1.02 && w.y >= cys - CFG.WALL_H && w.y <= cys + TH / 2) {
            return { x: x, y: y };
          }
        }
      }
    }
    return null;
  }

  function onDown(sx, sy) {
    var a = World.curArea();
    if (!a) return;
    var tile = tileAtScreen(sx, sy);
    if (!tile) return;
    var tx = tile.x, ty = tile.y;
    // NPC
    var npc = NPC.npcAt(a, tx, ty);
    if (npc) {
      Player.setPending('npc', tx, ty, CFG.PLAYER.npcRange, function () {
        Audio.sfx('click');
        UI.openDialogue(npc.id);
      });
      return;
    }
    // chest
    var chest = null;
    for (var c = 0; c < a.chests.length; c++) {
      if (a.chests[c].x === tx && a.chests[c].y === ty) { chest = a.chests[c]; break; }
    }
    if (chest) {
      Player.setPending('chest', tx, ty, CFG.PLAYER.interactRange, function () { openChest(chest); });
      return;
    }
    // altar
    if (a.altar && a.altar.x === tx && a.altar.y === ty) {
      Player.setPending('altar', tx, ty, 1.9, function () { touchAltar(); });
      return;
    }
    // door
    var door = World.doorAt(a, tx, ty);
    if (door) {
      if (!door.open) {
        Player.setPending('door', tx, ty, 1.6, function () { openDoor(door); });
      } else {
        Player.moveTo(tx, ty);
      }
      return;
    }
    // loot
    var loot = null;
    for (var l = 0; l < a.loot.length; l++) {
      var e = a.loot[l];
      if (Util.dist(tx + 0.5, ty + 0.5, e.x, e.y) < 1.1) { loot = e; break; }
    }
    if (loot) {
      Player.setPending('loot', Math.floor(loot.x), Math.floor(loot.y), CFG.PLAYER.pickupRange, function () { pickupLoot(loot); });
      return;
    }
    // enemy
    var en = enemyAt(tx, ty);
    if (en) {
      Player.attackTarget(en);
      dragging = true;
      lastDragTile = tile;
      lastDragTime = Util.now();
      return;
    }
    // transition (stairs/cave/gate or open door tile) or plain ground
    Player.moveTo(tx, ty);
    dragging = true;
    lastDragTile = tile;
    lastDragTime = Util.now();
  }

  function dragStep() {
    var a = World.curArea();
    if (!a) return;
    var tile = tileAtScreen(mouseX, mouseY);
    if (!tile || (lastDragTile && tile.x === lastDragTile.x && tile.y === lastDragTile.y)) return;
    lastDragTile = tile;
    var en = enemyAt(tile.x, tile.y);
    if (en) { Player.attackTarget(en); return; }
    var door = World.doorAt(a, tile.x, tile.y);
    if (door && !door.open) return;
    if (!World.walkable(a, tile.x, tile.y)) return;
    Player.moveTo(tile.x, tile.y);
  }

  function enemyAt(tx, ty) {
    var a = World.curArea();
    var best = null, bd = 0.9;
    for (var i = 0; i < a.enemies.length; i++) {
      var en = a.enemies[i];
      if (en.dead) continue;
      var d = Util.dist(tx + 0.5, ty + 0.5, en.x, en.y);
      if (d < bd) { bd = d; best = en; }
    }
    return best;
  }

  function openDoor(door) {
    if (door.locked) {
      UI.toast('The door is locked.');
      Audio.sfx('deny');
      return;
    }
    if (door.sealed) {
      UI.toast('Sealed by a dark power...');
      Audio.sfx('deny');
      return;
    }
    door.open = true;
    World.curArea().visDirty = true;
    Audio.sfx('door');
    UI.toast(door.exterior ? 'The door swings open \u2014 daylight spills in.' : 'The door creaks open.');
  }

  function openChest(chest) {
    if (chest.open) { UI.toast('It is already open.'); return; }
    chest.open = true;
    var a = World.curArea();
    var entries = Items.rollChest(chest, a);
    Items.dropLoot(a, chest.x, chest.y, entries);
    Audio.sfx('chest');
    UI.toast('You pry open the chest.');
    Render.addText(chest.x + 0.5, chest.y - 0.4, 'Loot!', '#ffd54d');
  }

  function touchAltar() {
    var a = World.curArea();
    if (!a.altar) return;
    if (a.altar.locked) {
      UI.toast('A fell presence seals the censer to the altar.');
      Audio.sfx('deny');
      return;
    }
    if (a.altar.taken) {
      UI.toast('Only a scorch mark remains on the stone.');
      return;
    }
    var it = Items.make('quest_censer');
    if (!Items.addToInv(it, 1)) {
      UI.toast('Your pack is full \u2014 make room for the censer.');
      return;
    }
    a.altar.taken = true;
    Audio.sfx('reward');
    UI.toast('You lift the Sunstone Censer. It is warm in your hands.');
    Quests.onPickupItem('quest_censer');
    Game.autosave();
  }

  function pickupLoot(loot) {
    var a = World.curArea();
    if (loot.kind === 'gold') {
      Player.gold += loot.amount;
      Render.addText(loot.x, loot.y - 0.4, '+' + loot.amount + ' gold', '#ffd97a');
      Audio.sfx('gold');
    } else {
      if (!Items.addToInv(loot.item, 1)) {
        UI.toast('Your pack is full.');
        Audio.sfx('deny');
        return;
      }
      Render.addText(loot.x, loot.y - 0.4, loot.item.name, Items.qualityColor(loot.item.q));
      Audio.sfx('pickup');
      if (loot.item.type === 'quest') Quests.onPickupItem(loot.item.id);
    }
    World.removeLoot(a, loot.uid);
    UI.refreshPanels();
  }

  function aimWorld() {
    return Render.screenToWorld(mouseX, mouseY) || { x: Player.x, y: Player.y + 1 };
  }

  function hoverTile() {
    return tileAtScreen(mouseX, mouseY);
  }

  /* ---------- simulation hooks (used by tests) ---------- */
  function simDown(sx, sy) {
    mouseX = sx; mouseY = sy;
    if (UI.modalOpen()) { UI.closeTopModal(); return; }
    onDown(sx, sy);
  }
  function simUp() {
    dragging = false;
    lastDragTile = null;
  }
  function simKey(k) {
    onKey({ key: k, repeat: false, preventDefault: function () { } });
  }

  return {
    bind: bind,
    aimWorld: aimWorld,
    hoverTile: hoverTile,
    mouseX: function () { return mouseX; },
    mouseY: function () { return mouseY; },
    openDoor: openDoor, openChest: openChest, touchAltar: touchAltar,
    pickupLoot: pickupLoot,
    simDown: simDown, simUp: simUp, simKey: simKey
  };
})();

'use strict';
/* ============================================================
   Emberfall - 12_render.js : camera, world rendering, fog of
   war, dynamic lights, FX
   ============================================================ */
var Render = (function () {

  var TW = CFG.TILE_W, TH = CFG.TILE_H, WH = CFG.WALL_H;
  var cv = null, ctx = null, W = 0, H = 0;
  var camX = 0, camY = 0;
  var time = 0;
  var visTimer = 0;
  var lastVisX = -99, lastVisY = -99;
  var fogCanvas = null, fogCtx = null, fogArea = null;
  var fogOffX = 0, fogOffY = 0;
  var projectiles = [], particles = [], texts = [], rings = [];
  var tsCache = {};
  var shake = 0;

  function init(canvas) {
    cv = canvas;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize() {
    W = cv.width = Math.max(800, window.innerWidth);
    H = cv.height = Math.max(600, window.innerHeight);
  }

  function tsFor(set) {
    if (!tsCache[set]) tsCache[set] = TS.get(set);
    return tsCache[set];
  }

  /* ---------- coordinates ---------- */
  function worldToScreen(wx, wy) { return { x: wx + camX, y: wy + camY }; }
  function screenToWorld(sx, sy) { return { x: sx - camX, y: sy - camY }; }
  function tileScreen(x, y) { return { x: (x - y) * TW / 2 + camX, y: (x + y) * TH / 2 + camY }; }

  function onAreaEnter(area) {
    fogArea = area;
    fogCanvas = Util.makeCanvas((area.w + area.h) * TW / 2 + 8, (area.w + area.h) * TH / 2 + WH + 16);
    fogCtx = fogCanvas.getContext('2d');
    fogOffX = -(area.h) * TW / 2 - 4;
    fogOffY = -TH / 2 - WH - 8;
    snapCamera();
    area.visDirty = true;
    computeVis(area, true);
    redrawFog(area);
  }
  function snapCamera() {
    camX = W / 2 - (Player.x - Player.y) * TW / 2;
    camY = H / 2 - (Player.x + Player.y) * TH / 2;
  }

  /* ---------- visibility / fog ---------- */
  function computeVis(a, force) {
    var px = Player.tileX(), py = Player.tileY();
    var R = CFG.VIEW_R;
    a.vis.fill(0);
    if (a.id === 'town') {
      // the town is a safe, well-lit hub: fully explored & visible
      a.explored.fill(1);
      a.vis.fill(1);
      a.visDirty = true;
      return;
    }
    var los = function (x, y) { return World.losBlocked(a, x, y); };
    for (var y = py - R; y <= py + R; y++) {
      for (var x = px - R; x <= px + R; x++) {
        if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue;
        if (Math.abs(x - px) + Math.abs(y - py) > R + 1) continue;
        if (!Util.lineLOS(px, py, x, y, los, 24)) continue;
        a.vis[y * a.w + x] = 1;
        a.explored[y * a.w + x] = 1;
      }
    }
    // light sources reveal + explore their surroundings
    for (var i = 0; i < a.lights.length; i++) {
      var L = a.lights[i];
      if (Util.dist(L.x, L.y, Player.x, Player.y) > 16) continue;
      var lr = L.r || CFG.TORCH_R;
      for (var ly = L.y - lr; ly <= L.y + lr; ly++) {
        for (var lx = L.x - lr; lx <= L.x + lr; lx++) {
          if (lx < 0 || ly < 0 || lx >= a.w || ly >= a.h) continue;
          if (Util.dist(lx, ly, L.x, L.y) > lr) continue;
          if (!Util.lineLOS(L.x, L.y, lx, ly, los, 16)) continue;
          a.vis[ly * a.w + lx] = 1;
          a.explored[ly * a.w + lx] = 1;
        }
      }
    }
    // walls adjacent to visible/explored floor become explored
    for (var y2 = 0; y2 < a.h; y2++) {
      for (var x2 = 0; x2 < a.w; x2++) {
        if (a.grid[y2 * a.w + x2] !== CFG.T.WALL) continue;
        var i2 = y2 * a.w + x2;
        if (a.explored[i2]) continue;
        var nb = false;
        if (x2 > 0 && a.explored[y2 * a.w + x2 - 1]) nb = true;
        else if (x2 < a.w - 1 && a.explored[y2 * a.w + x2 + 1]) nb = true;
        else if (y2 > 0 && a.explored[(y2 - 1) * a.w + x2]) nb = true;
        else if (y2 < a.h - 1 && a.explored[(y2 + 1) * a.w + x2]) nb = true;
        if (nb) a.explored[i2] = 1;
      }
    }
    a.visDirty = true;
  }

  function fogWorldRect(x, y, visState) {
    // visState: 0 unexplored, 1 explored-dim, 2 visible
    var g = fogCtx;
    var a = fogArea;
    var v = x < 0 || y < 0 || x >= a.w || y >= a.h ? CFG.T.WALL : a.grid[y * a.w + x];
    var sx = (x - y) * TW / 2 - fogOffX, sy = (x + y) * TH / 2 - fogOffY;
    var dim = 'rgba(4,4,10,0.55)';
    var black = 'rgba(3,3,8,0.985)';
    var col = visState === 0 ? black : dim;
    var d = World.doorAt(a, x, y);
    var doorOpen = d && d.open;
    if (v === CFG.T.WALL && !doorOpen) {
      // silhouette: top diamond + visible faces (exact quads, no spill)
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(sx, sy - TH / 2 - WH);
      g.lineTo(sx + TW / 2, sy - WH);
      g.lineTo(sx, sy + TH / 2 - WH);
      g.lineTo(sx - TW / 2, sy - WH);
      g.closePath();
      g.fill();
      var hasSW = (y + 1 < a.h && a.grid[(y + 1) * a.w + x] !== CFG.T.WALL);
      var hasSE = (x + 1 < a.w && a.grid[y * a.w + x + 1] !== CFG.T.WALL);
      if (hasSW) {
        g.beginPath();
        g.moveTo(sx - TW / 2, sy - WH);
        g.lineTo(sx, sy - WH + TH / 2);
        g.lineTo(sx, sy + TH / 2);
        g.lineTo(sx - TW / 2, sy);
        g.closePath();
        g.fill();
      }
      if (hasSE) {
        g.beginPath();
        g.moveTo(sx, sy - WH + TH / 2);
        g.lineTo(sx + TW / 2, sy - WH);
        g.lineTo(sx + TW / 2, sy);
        g.lineTo(sx, sy + TH / 2);
        g.closePath();
        g.fill();
      }
      if (!hasSW && !hasSE) {
        // back faces if viewed from behind
        g.beginPath();
        g.moveTo(sx - TW / 2, sy - WH);
        g.lineTo(sx, sy - WH + TH / 2);
        g.lineTo(sx, sy + TH / 2);
        g.lineTo(sx - TW / 2, sy);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(sx, sy - WH + TH / 2);
        g.lineTo(sx + TW / 2, sy - WH);
        g.lineTo(sx + TW / 2, sy);
        g.lineTo(sx, sy + TH / 2);
        g.closePath();
        g.fill();
      }
      return;
    }
    // floor-like (incl. open door tiles): diamond
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(sx, sy - TH / 2);
    g.lineTo(sx + TW / 2, sy);
    g.lineTo(sx, sy + TH / 2);
    g.lineTo(sx - TW / 2, sy);
    g.closePath();
    g.fill();
  }

  function redrawFog(a) {
    if (!fogCtx || fogArea !== a) return;
    fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
    for (var y = 0; y < a.h; y++) {
      for (var x = 0; x < a.w; x++) {
        var idx = y * a.w + x;
        if (a.vis[idx]) continue;
        fogWorldRect(x, y, a.explored[idx] ? 1 : 0);
      }
    }
    a.visDirty = false;
  }

  /* ---------- FX ---------- */
  function addText(x, y, text, color) {
    if (texts.length > 60) texts.shift();
    texts.push({ x: x, y: y, text: text, color: color, age: 0, life: 1.15 });
  }
  function addNova(x, y) {
    rings.push({ x: x, y: y, age: 0 });
  }
  function addProjectile(p) {
    p.age = 0;
    projectiles.push(p);
  }
  function burst(x, y, color, n, speed) {
    for (var i = 0; i < n; i++) {
      if (particles.length > 220) particles.shift();
      var a = Math.random() * Math.PI * 2;
      var sp = (0.5 + Math.random()) * (speed || 2);
      particles.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        age: 0, life: 0.3 + Math.random() * 0.3, color: color, size: 1.5 + Math.random() * 2
      });
    }
  }
  function addHealFx(x, y) {
    burst(x, y, '#7affa0', 14, 1.6);
    rings.push({ x: x, y: y, age: 0, color: '#7affa0' });
  }

  function updateFx(dt) {
    var a = World.curArea();
    for (var i = projectiles.length - 1; i >= 0; i--) {
      var p = projectiles[i];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.age > p.life || !World.walkable(a, Math.floor(p.x), Math.floor(p.y))) {
        if (!World.walkable(a, Math.floor(p.x), Math.floor(p.y))) burst(p.x, p.y, p.kind === 'firebolt' ? '#ff9c40' : '#7ab8ff', 6, 1.5);
        projectiles.splice(i, 1);
        continue;
      }
      if (p.owner === 'player') {
        var hit = null;
        for (var e = 0; e < a.enemies.length; e++) {
          var en = a.enemies[e];
          if (en.dead) continue;
          if (Util.dist(en.x, en.y, p.x, p.y) < 0.75) { hit = en; break; }
        }
        if (hit) {
          for (var e2 = 0; e2 < a.enemies.length; e2++) {
            var en2 = a.enemies[e2];
            if (en2.dead) continue;
            if (Util.dist(en2.x, en2.y, p.x, p.y) < 1.0) en2.takeDamage(p.dmg, false);
          }
          burst(p.x, p.y, '#ff9c40', 10, 2.4);
          Audio.sfx('firehit');
          projectiles.splice(i, 1);
        }
      } else {
        if (Util.dist(Player.x, Player.y, p.x, p.y) < 0.55) {
          Player.takeDamage(p.dmg);
          burst(p.x, p.y, '#7ab8ff', 6, 1.5);
          projectiles.splice(i, 1);
        }
      }
    }
    for (var i2 = particles.length - 1; i2 >= 0; i2--) {
      var pt = particles[i2];
      pt.age += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.08, dt);
      pt.vy *= Math.pow(0.08, dt);
      if (pt.age > pt.life) particles.splice(i2, 1);
    }
    for (var i3 = texts.length - 1; i3 >= 0; i3--) {
      var t = texts[i3];
      t.age += dt;
      t.y -= 0.35 * dt;
      if (t.age > t.life) texts.splice(i3, 1);
    }
    for (var i4 = rings.length - 1; i4 >= 0; i4--) {
      rings[i4].age += dt;
      if (rings[i4].age > 0.5) rings.splice(i4, 1);
    }
  }

  /* ---------- main update ---------- */
  function update(dt) {
    time += dt;
    shake = Math.max(0, shake - dt * 3);
    // camera follow
    var tx = W / 2 - (Player.x - Player.y) * TW / 2;
    var ty = H / 2 - (Player.x + Player.y) * TH / 2;
    var k = Math.min(1, dt * 8);
    camX += (tx - camX) * k;
    camY += (ty - camY) * k;
    var a = World.curArea();
    // recompute visibility only when the player enters a new tile
    if (a && (a.visDirty || Player.tileX() !== lastVisX || Player.tileY() !== lastVisY)) {
      lastVisX = Player.tileX();
      lastVisY = Player.tileY();
      computeVis(a);
    }
    if (a && a.visDirty) redrawFog(a);
    updateFx(dt);
  }

  /* ---------- drawing ---------- */
  function isWallLike(a, x, y) {
    if (x < 0 || y < 0 || x >= a.w || y >= a.h) return true;
    if (a.grid[y * a.w + x] === CFG.T.WALL) {
      var d = World.doorAt(a, x, y);
      if (d && d.open) return false;
      return true;
    }
    return false;
  }

  function drawTile(a, x, y) {
    var v = a.grid[y * a.w + x];
    var idx = y * a.w + x;
    var s = tileScreen(x, y);
    var sx = s.x, sy = s.y;
    var d = World.doorAt(a, x, y);
    var openDoor = d && d.open;
    if (v === CFG.T.WATER) {
      var wf = tsFor(a.theme === 'town' ? 'grass' : a.sets[0]).water[(time * 1.6) % 2 | 0];
      ctx.drawImage(wf, sx - TW / 2, sy - TH / 2);
      return;
    }
    if (v === CFG.T.FLOOR || openDoor) {
      var set = a.sets[a.floorTheme[idx]] || a.theme;
      var ts = tsFor(set);
      var fl = ts.floor[a.varr[idx] % ts.floor.length];
      ctx.drawImage(fl, sx - TW / 2, sy - TH / 2);
      if (openDoor) {
        drawDoorArt(a, d, sx, sy);
      } else {
        var tr = World.transitionAt(a, x, y);
        if (tr) {
          if (tr.kind === 'stairs') ctx.drawImage(tr.dir === 'up' ? ts.stairUp : ts.stairDown, sx - TW / 2 - 1, sy - CFG.DOOR_H);
          else if (tr.kind === 'cave') ctx.drawImage(ts.cave, sx - TW / 2 - 1, sy - CFG.DOOR_H - 1);
          else if (tr.kind === 'gate') ctx.drawImage(ts.gateOpen, sx - TW / 2 - 1, sy - CFG.DOOR_H - 4);
        }
      }
      return;
    }
    // wall
    var dW = World.doorAt(a, x, y);
    if (dW && !dW.open) {
      // draw normal faces then door over
    }
    var nSW = !isWallLike(a, x, y + 1);
    var nSE = !isWallLike(a, x + 1, y);
    var nNE = !isWallLike(a, x, y - 1);
    var nNW = !isWallLike(a, x - 1, y);
    var ts = tsFor(a.theme);
    if (nSW) ctx.drawImage(ts.faceSW, sx - TW / 2, sy - WH);
    if (nSE) ctx.drawImage(ts.faceSE, sx, sy - WH);
    if (!nSW && !nSE && (nNW || nNE)) {
      // viewed from behind: draw darker back faces
      ctx.drawImage(ts.faceSE, sx, sy - WH);
      ctx.drawImage(ts.faceSW, sx - TW / 2, sy - WH);
    }
    if (nSW || nSE || nNW || nNE) {
      var wt = ts.wallTop[a.varr[idx] % ts.wallTop.length];
      ctx.drawImage(wt, sx - TW / 2, sy - TH / 2 - WH);
    }
    if (dW) drawDoorArt(a, dW, sx, sy);
  }

  function drawDoorArt(a, d, sx, sy) {
    var ts = tsFor(a.theme);
    var X = sx - TW / 2 - 1, Y = sy - CFG.DOOR_H;
    if (!d.open) {
      var img;
      if (d.double) img = d.exterior ? ts.doubleX : ts.double;
      else img = d.exterior ? ts.doorX : ts.door;
      if (d.sealed) img = SPR.gateBars(true);
      ctx.drawImage(img, X, Y);
    } else {
      if (d.sealed) { ctx.drawImage(SPR.gateBars(false), X, Y); return; }
      if (d.stairsBehind) {
        ctx.drawImage(ts.stairDown, X, Y);
        ctx.drawImage(d.double ? ts.doubleOpenH : ts.doorOpenH, X, Y);
      } else {
        var img2;
        if (d.double) img2 = d.exterior ? ts.doubleXOpen : ts.doubleOpen;
        else img2 = d.exterior ? ts.doorXOpen : ts.doorOpen;
        ctx.drawImage(img2, X, Y);
      }
    }
  }

  function propSprite(p) {
    switch (p.type) {
      case 'tree': return { c: SPR.tree(p.variant || 0), baseH: 14, flame: null };
      case 'rock': return { c: SPR.rock(p.variant || 0), baseH: 5, flame: null };
      case 'bush': return { c: SPR.bush(), baseH: 5, flame: null };
      case 'tombstone': return { c: SPR.tombstone(p.variant || 0), baseH: 4, flame: null };
      case 'pillar': return { c: SPR.pillar(p.variant || 0), baseH: 7, flame: null };
      case 'brazier': return { c: SPR.brazier(), baseH: 26, flame: { ox: 0, oy: 10 } };
      case 'torch': return { c: SPR.torchFloor(), baseH: 26, flame: { ox: 0, oy: 2 } };
      case 'altar': return { c: SPR.altar(), baseH: 12, flame: null };
      case 'throne': return { c: SPR.throne(), baseH: 20, flame: null };
      case 'fountain': return { c: SPR.fountain(), baseH: 10, flame: null };
      case 'well': return { c: SPR.well(), baseH: 12, flame: null };
      case 'stall': return { c: SPR.stall(), baseH: 16, flame: null };
      case 'rubble': return { c: SPR.rubble(), baseH: 6, flame: null };
      case 'shrine': return { c: SPR.shrine(), baseH: 10, flame: null };
      case 'pew': return { c: SPR.pew(), baseH: 10, flame: null };
      case 'sarc': return { c: SPR.sarc(p.variant || 0), baseH: 20, flame: null };
      case 'bones': return { c: SPR.bones(), baseH: 4, flame: null };
      case 'anvil': return { c: SPR.anvil(), baseH: 8, flame: null };
      case 'barrel': return { c: SPR.barrel(), baseH: 4, flame: null };
      case 'hay': return { c: SPR.hay(), baseH: 5, flame: null };
      case 'cart': return { c: SPR.cart(), baseH: 16, flame: null };
      case 'chest': return { c: chestSprite(p), baseH: 6, flame: null };
      default: return null;
    }
  }
  function chestSprite(p) {
    var a = World.curArea();
    for (var i = 0; i < a.chests.length; i++) {
      var ch = a.chests[i];
      if (ch.x === p.x && ch.y === p.y) {
        return ch.open ? TS.get(a.theme).chestOpen : TS.get(a.theme).chestClosed;
      }
    }
    return TS.get(a.theme).chestClosed;
  }

  function draw() {
    if (!ctx) return;
    var a = World.curArea();
    if (!a) return;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake * 4, (Math.random() - 0.5) * shake * 4);
    }
    var hw = W / 2 + TW, hh = H / 2 + WH + 140;
    var wy0 = -camY - hh, wy1 = -camY + hh;
    var wx0 = -camX - hw, wx1 = -camX + hw;
    var t1min = wx0 / (TW / 2), t1max = wx1 / (TW / 2);
    var t2min = wy0 / (TH / 2), t2max = wy1 / (TH / 2);
    var xMin = Util.clamp(Math.floor((t1min + t2min) / 2) - 1, 0, a.w - 1);
    var xMax = Util.clamp(Math.ceil((t1max + t2max) / 2) + 1, 0, a.w - 1);
    var yMin = Util.clamp(Math.floor((t2min - t1max) / 2) - 1, 0, a.h - 1);
    var yMax = Util.clamp(Math.ceil((t2max - t1min) / 2) + 1, 0, a.h - 1);

    /* tiles */
    for (var y = yMin; y <= yMax; y++) {
      for (var x = xMin; x <= xMax; x++) {
        drawTile(a, x, y);
      }
    }
    /* props (except roofs) sorted by depth */
    var drawList = [];
    for (var pi = 0; pi < a.props.length; pi++) {
      var p = a.props[pi];
      if (p.x < xMin - 2 || p.x > xMax + 2 || p.y < yMin - 2 || p.y > yMax + 2) continue;
      if (p.type === 'roof') continue;
      if (!a.explored[p.y * a.w + p.x] && !a.vis[p.y * a.w + p.x]) continue;
      drawList.push(p);
    }
    drawList.sort(function (p1, p2) {
      var d1 = p1.x + p1.y + (p1.type === 'torch' || p1.type === 'brazier' ? 0.35 : 0.2);
      var d2 = p2.x + p2.y + (p2.type === 'torch' || p2.type === 'brazier' ? 0.35 : 0.2);
      return d1 - d2;
    });
    for (var pj = 0; pj < drawList.length; pj++) {
      drawProp(drawList[pj]);
    }
    /* entities */
    var ents = [];
    for (var ni = 0; ni < a.npcs.length; ni++) {
      var n = a.npcs[ni];
      if (!a.vis[n.y * a.w + n.x] && !a.explored[n.y * a.w + n.x]) continue;
      ents.push({ kind: 'npc', d: n.x + n.y + 0.5, o: n });
    }
    for (var ei = 0; ei < a.enemies.length; ei++) {
      var e = a.enemies[ei];
      var ex2 = Math.floor(e.x), ey2 = Math.floor(e.y);
      if (!a.vis[ey2 * a.w + ex2] && !a.explored[ey2 * a.w + ex2]) continue;
      ents.push({ kind: 'enemy', d: e.x + e.y + 0.5, o: e });
    }
    ents.push({ kind: 'player', d: Player.x + Player.y + 0.5, o: null });
    ents.sort(function (q1, q2) { return q1.d - q2.d; });
    for (var q = 0; q < ents.length; q++) {
      var ent = ents[q];
      if (ent.kind === 'player') drawPlayer();
      else if (ent.kind === 'enemy') drawEnemy(ent.o);
      else drawNpc(ent.o);
    }
    /* loot */
    var ts0 = tsFor(a.theme);
    for (var li = 0; li < a.loot.length; li++) {
      var l = a.loot[li];
      var lx = Math.floor(l.x), ly = Math.floor(l.y);
      if (!a.vis[ly * a.w + lx] && !a.explored[ly * a.w + lx]) continue;
      var ls = tileScreen(l.x, l.y);
      var jit = (l.uid % 3 - 1) * 0.16;
      var bob = Math.sin(time * 3 + l.uid) * 1.6;
      ctx.drawImage(SPR.glow('warm'), ls.x - 26 + jit * TW, ls.y - 30 + bob, 52, 52);
      if (l.kind === 'gold') {
        ctx.drawImage(SPR.icon('gold'), ls.x - 17 + jit * TW, ls.y - 15 + bob);
      } else {
        ctx.drawImage(SPR.icon(l.item.icon), ls.x - 17 + jit * TW, ls.y - 15 + bob);
      }
    }
    /* roofs */
    var roofList = [];
    for (var rj = 0; rj < a.props.length; rj++) {
      var rp = a.props[rj];
      if (rp.type !== 'roof') continue;
      if (rp.x < xMin - 4 || rp.x > xMax + 4 || rp.y < yMin - 4 || rp.y > yMax + 4) continue;
      roofList.push(rp);
    }
    roofList.sort(function (r1, r2) { return (r1.x + r1.y) - (r2.x + r2.y); });
    for (var rk = 0; rk < roofList.length; rk++) drawRoof(roofList[rk]);

    /* projectiles / particles */
    for (var pr = 0; pr < projectiles.length; pr++) {
      var pj2 = projectiles[pr];
      var ps = tileScreen(pj2.x, pj2.y);
      var gl = pj2.kind === 'firebolt' ? 'torch' : 'blue';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(SPR.glow(gl), ps.x - 16, ps.y - 16, 32, 32);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = pj2.kind === 'firebolt' ? '#ffd97a' : '#9cc4ff';
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (var pt2 = 0; pt2 < particles.length; pt2++) {
      var pa = particles[pt2];
      var ps2 = tileScreen(pa.x, pa.y);
      var al = 1 - pa.age / pa.life;
      ctx.globalAlpha = al;
      ctx.fillStyle = pa.color;
      ctx.fillRect(ps2.x - pa.size / 2, ps2.y - pa.size / 2, pa.size, pa.size);
    }
    ctx.globalAlpha = 1;

    /* lights (additive) */
    ctx.globalCompositeOperation = 'lighter';
    var pgl = SPR.glow('warm');
    var psc = tileScreen(Player.x, Player.y);
    var flick = 0.9 + Math.sin(time * 9) * 0.1;
    ctx.globalAlpha = 0.85 * flick;
    ctx.drawImage(pgl, psc.x - 95, psc.y - 60, 190, 120);
    ctx.globalAlpha = 1;
    for (var lg2 = 0; lg2 < a.lights.length; lg2++) {
      var L = a.lights[lg2];
      var ls2 = tileScreen(L.x + 0.5, L.y + 0.5);
      if (ls2.x < -120 || ls2.y < -120 || ls2.x > W + 120 || ls2.y > H + 120) continue;
      var lgl = SPR.glow(L.color || 'torch');
      var lr = (L.r || 3) * 26;
      var fl2 = 0.75 + Math.sin(time * 7.3 + L.x * 2.1 + L.y * 1.3) * 0.16;
      if (L.color === 'blue') fl2 = 0.65 + Math.sin(time * 2.2 + L.x) * 0.08;
      ctx.globalAlpha = fl2;
      ctx.drawImage(lgl, ls2.x - lr, ls2.y - lr * 0.8, lr * 2, lr * 1.6);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    /* flames */
    for (var fl3 = 0; fl3 < drawList.length; fl3++) {
      var fp = drawList[fl3];
      var spr = propSprite(fp);
      if (!spr || !spr.flame) continue;
      var fs = tileScreen(fp.x + 0.5, fp.y + 0.5);
      var frames = SPR.flames(fp.type === 'shrine' ? 'blue' : 'orange');
      var frm = frames[(time * 6 + fp.x * 3 + fp.y) % 3 | 0];
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(frm, fs.x - 13, fs.y - spr.flame.oy - 46 + 8, 26, 44);
      ctx.globalCompositeOperation = 'source-over';
    }

    /* fog */
    if (fogCanvas && fogArea === a) {
      ctx.drawImage(fogCanvas, camX + fogOffX, camY + fogOffY);
    }

    /* nova rings */
    for (var rg = 0; rg < rings.length; rg++) {
      var ring = rings[rg];
      var rs = tileScreen(ring.x, ring.y);
      var prog = ring.age / 0.5;
      ctx.strokeStyle = ring.color || 'rgba(255,156,64,';
      ctx.globalAlpha = (1 - prog) * 0.9;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(rs.x, rs.y, 10 + prog * 62, (10 + prog * 62) * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* hover highlight */
    var hover = Input.hoverTile();
    if (hover && !UI.modalOpen()) {
      var a2 = World.curArea();
      if (a2 && hover.x >= 0 && hover.y >= 0 && hover.x < a2.w && hover.y < a2.h) {
        var hs = tileScreen(hover.x, hover.y);
        ctx.strokeStyle = 'rgba(255,240,200,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hs.x, hs.y - TH / 2);
        ctx.lineTo(hs.x + TW / 2, hs.y);
        ctx.lineTo(hs.x, hs.y + TH / 2);
        ctx.lineTo(hs.x - TW / 2, hs.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    /* floating texts */
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    for (var ft = 0; ft < texts.length; ft++) {
      var t = texts[ft];
      var ts2 = tileScreen(t.x, t.y);
      var al2 = 1 - t.age / t.life;
      ctx.globalAlpha = al2;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(t.text, ts2.x + 1, ts2.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, ts2.x, ts2.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawProp(p) {
    var spr = propSprite(p);
    if (!spr) return;
    var s = tileScreen(p.x + 0.5, p.y + 0.5);
    ctx.drawImage(spr.c, s.x - spr.c.width / 2, s.y - spr.c.height + spr.baseH);
  }

  function drawRoof(p) {
    var s = tileScreen(p.x, p.y);
    var c;
    if (p.style === 'cathedral') c = SPR.cathedral(p.dx, p.dy);
    else c = SPR.house(p.dx, p.dy, p.style);
    var under = Player.x >= p.x && Player.x < p.x + p.dx && Player.y >= p.y && Player.y < p.y + p.dy;
    if (under) ctx.globalAlpha = 0.3;
    ctx.drawImage(c, s.x - c._ax, s.y - c._ay);
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    var s = tileScreen(Player.x, Player.y);
    var spr = SPR.actor({ robe: '#3d4452', trim: '#c9a24a', hood: true, weapon: 'sword', cape: '#2a2f3a' });
    var cw = spr.width, ch = spr.height;
    var lunge = Player.swing > 0 ? Math.sin((0.22 - Player.swing) / 0.22 * Math.PI) * 4 : 0;
    var bob = Player.moving ? Math.sin(time * 11) * 1.4 : Math.sin(time * 2.2) * 0.8;
    ctx.drawImage(spr, s.x - cw / 2 + lunge * Player.facingX, s.y - (ch - 8) + bob, cw, ch);
    if (Player.swing > 0) {
      // slash arc
      var prog2 = 1 - Player.swing / 0.22;
      ctx.save();
      ctx.translate(s.x, s.y - 30);
      ctx.rotate(Math.atan2(Player.facingY, Player.facingX) + Player.swingDir * prog2 * 1.8);
      ctx.strokeStyle = 'rgba(240,240,255,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(8, 0, 22, -0.9, 0.9);
      ctx.stroke();
      ctx.restore();
    }
    if (Player.hurtFlash > 0) {
      ctx.globalAlpha = Player.hurtFlash * 1.4;
      ctx.fillStyle = '#ff4040';
      ctx.beginPath();
      ctx.arc(s.x, s.y - 34, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // target ring
    if (Player.targetEnemy) {
      var en = Enemies.get(World.curArea(), Player.targetEnemy);
      if (en && !en.dead) {
        var es = tileScreen(en.x, en.y);
        ctx.strokeStyle = 'rgba(255,80,60,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(es.x, es.y + 2, 15, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawNpc(n) {
    var def = NPC.get(n.id);
    if (!def) return;
    var s = tileScreen(n.x + 0.5, n.y + 0.5);
    var spr = SPR.actor(def.sprite);
    var bob = Math.sin(time * 2.2 + n.x) * 0.8;
    ctx.drawImage(spr, s.x - spr.width / 2, s.y - (spr.height - 8) + bob);
    // name tag
    ctx.font = '11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(s.x - 40, s.y - (spr.height - 8) - 22, 80, 14);
    ctx.fillStyle = '#e8d9a8';
    ctx.fillText(def.name, s.x, s.y - (spr.height - 8) - 11);
  }

  function drawEnemy(e) {
    var s = tileScreen(e.x, e.y);
    var def = e.def;
    var spr = def.quadruped ? SPR.wolfActor(def.sprite) : SPR.actor(def.sprite);
    var sc = e.scale || 1;
    var cw = spr.width * sc, ch = spr.height * sc;
    if (e.dead) {
      var alpha = Math.min(1, e.corpseT / 1.5);
      ctx.globalAlpha = alpha;
      var cs = SPR.corpseSpr(def.corpse);
      ctx.drawImage(cs, s.x - cs.width / 2, s.y - (cs.height - 4));
      ctx.globalAlpha = 1;
      return;
    }
    var lunge = e.lunge > 0 ? Math.sin((1 - e.lunge / 0.3) * Math.PI) * 5 : 0;
    var bob = Math.sin(time * (def.speed * 3) + e.x * 7 + e.y * 13) * (e.aggro ? 1.6 : 0.7);
    var dx = Player.x - e.x, dy = Player.y - e.y;
    var dl = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= dl; dy /= dl;
    ctx.drawImage(spr, s.x - cw / 2 + lunge * dx, s.y - (ch - 8 * sc) + bob, cw, ch);
    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.75;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(spr, s.x - cw / 2, s.y - (ch - 8 * sc), cw, ch);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    // health bar while alive & engaged
    if (e.barShow > 0 && e.hp < e.maxHp) {
      var bw = 30, bh = 4;
      var bx = s.x - bw / 2, by = s.y - ch + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = '#3a1010';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#d43a2a';
      ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), bh);
    }
  }

  function shakeScreen(amt) { shake = Math.max(shake, amt); }

  return {
    init: init, update: update, draw: draw,
    screenToWorld: screenToWorld, worldToScreen: worldToScreen, tileScreen: tileScreen,
    onAreaEnter: onAreaEnter, snapCamera: snapCamera,
    addText: addText, addNova: addNova, addProjectile: addProjectile,
    addHealFx: addHealFx, burst: burst, shakeScreen: shakeScreen,
    computeVis: computeVis,
    width: function () { return W; }, height: function () { return H; },
    cam: function () { return { x: camX, y: camY }; }
  };
})();

'use strict';
/* ============================================================
   Emberfall - 13_ui.js : HUD (orbs, abilities), panels
   (inventory, character, journal, automap, shop), dialogue,
   boss bar, menus, toasts
   ============================================================ */
var UI = (function () {

  var root = null;
  var open = { dialogue: false, shop: false, inventory: false, character: false, journal: false, automap: false, pause: false, title: false };
  var shopNpcId = null;
  var toasts = [];
  var tooltipEl = null, tooltipItem = null;
  var invEl = null, charEl = null, shopEl = null, journalEl = null, mapEl = null, diaEl = null;
  var trackerEl = null;
  var hpOrb, mpOrb, hpCtx, mpCtx;
  var abilityEls = {};
  var bossBarEl = null, bossNameEl = null, bossFillEl = null;
  var floorLabel = null, goldLabel = null, xpBarEl = null, lvlLabel = null;
  var potionEls = { potionH: null, potionM: null };
  var helpEl = null;
  var storyEl = null, pauseEl = null, titleEl = null;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function iconCanvas(kind, w, h) {
    var c = Util.makeCanvas(w || 34, h || 34);
    var g = c.getContext('2d');
    g.drawImage(SPR.icon(kind), 0, 0);
    return c;
  }
  function abiCanvas(name) {
    var c = Util.makeCanvas(40, 40);
    var g = c.getContext('2d');
    g.drawImage(SPR.abiIcon(name), 0, 0);
    return c;
  }

  /* ================= init ================= */
  function init(container) {
    root = container;

    /* --- bottom HUD --- */
    var hud = el('div', 'hud', root);
    var left = el('div', 'hud-left', hud);
    hpOrb = el('canvas', 'orb', left);
    hpOrb.width = 112; hpOrb.height = 112;
    hpCtx = hpOrb.getContext('2d');
    mpOrb = el('canvas', 'orb', left);
    mpOrb.width = 112; mpOrb.height = 112;
    mpCtx = mpOrb.getContext('2d');
    var mid = el('div', 'hud-mid', hud);
    var abiRow = el('div', 'abi-row', mid);
    var abis = [['firebolt', '1'], ['nova', '2'], ['heal', '3']];
    for (var i = 0; i < abis.length; i++) {
      (function (pair) {
        var slot = el('div', 'abi-slot', abiRow);
        slot.appendChild(abiCanvas(pair[0]));
        var key = el('div', 'abi-key', slot);
        key.textContent = pair[1];
        var cd = el('div', 'abi-cd', slot);
        slot.addEventListener('click', function () { Player.cast(pair[0]); });
        abilityEls[pair[0]] = { slot: slot, cd: cd };
      })(abis[i]);
    }
    var potRow = el('div', 'pot-row', mid);
    var pots = [['potionH', 'Q', 'potionH'], ['potionM', 'W', 'potionM']];
    for (var p = 0; p < pots.length; p++) {
      (function (pdef) {
        var slot = el('div', 'pot-slot', potRow);
        slot.appendChild(iconCanvas(pdef[2]));
        var key = el('div', 'abi-key', slot);
        key.textContent = pdef[1];
        var cnt = el('div', 'pot-count', slot);
        cnt.textContent = '0';
        slot.addEventListener('click', function () { Player.usePotionHot(pdef[0]); });
        potionEls[pdef[0]] = cnt;
      })(pots[p]);
    }
    var right = el('div', 'hud-right', hud);
    floorLabel = el('div', 'floor-label', right);
    floorLabel.textContent = 'Town of Thornhollow';
    var goldRow = el('div', 'gold-row', right);
    var goldIcon = el('canvas', null, goldRow);
    goldIcon.width = 24; goldIcon.height = 24;
    goldIcon.getContext('2d').drawImage(SPR.icon('gold'), 0, 0, 24, 24);
    goldLabel = el('div', 'gold-label', goldRow);
    goldLabel.textContent = '0';
    var xpWrap = el('div', 'xp-wrap', right);
    lvlLabel = el('div', 'lvl-label', xpWrap);
    lvlLabel.textContent = 'Lv 1';
    xpBarEl = el('div', 'xp-bar', xpWrap);

    /* --- quest tracker --- */
    trackerEl = el('div', 'quest-tracker', root);

    /* --- controls help --- */
    helpEl = el('div', 'controls-help', root);
    helpEl.innerHTML = '<b>Controls</b><br>LMB move / attack &middot; hold to steer<br>RMB sell (near merchant)<br>1-3 spells &middot; Q/W potions<br>I inventory &middot; J journal &middot; C character &middot; M map &middot; Esc menu';

    /* --- boss bar --- */
    var bossBar = el('div', 'boss-bar', root);
    bossNameEl = el('div', 'boss-name', bossBar);
    bossNameEl.textContent = '';
    bossFillEl = el('div', 'boss-fill', bossBar);
    bossBarEl = bossBar;
    bossBar.style.display = 'none';

    /* --- toasts --- */
    var toastWrap = el('div', 'toast-wrap', root);

    /* --- tooltip --- */
    tooltipEl = el('div', 'tooltip', root);
    tooltipEl.style.display = 'none';

    /* --- dialogue --- */
    diaEl = el('div', 'modal dialogue', root);
    diaEl.style.display = 'none';

    /* --- shop --- */
    shopEl = el('div', 'modal shop', root);
    shopEl.style.display = 'none';

    /* --- inventory --- */
    invEl = el('div', 'modal inventory', root);
    invEl.style.display = 'none';

    /* --- character --- */
    charEl = el('div', 'modal character', root);
    charEl.style.display = 'none';

    /* --- journal --- */
    journalEl = el('div', 'modal journal', root);
    journalEl.style.display = 'none';

    /* --- automap --- */
    mapEl = el('div', 'modal automap', root);
    mapEl.style.display = 'none';

    /* --- pause --- */
    pauseEl = el('div', 'modal pause', root);
    pauseEl.style.display = 'none';

    /* --- title --- */
    titleEl = el('div', 'title-screen', root);

    window.addEventListener('mousemove', function (e) {
      if (tooltipEl && tooltipEl.style.display !== 'none') {
        tooltipEl.style.left = Math.min(e.clientX + 16, window.innerWidth - 260) + 'px';
        tooltipEl.style.top = Math.min(e.clientY + 14, window.innerHeight - 140) + 'px';
      }
    });
    document.addEventListener('mousedown', function (e) {
      if (tooltipEl) { tooltipEl.style.display = 'none'; tooltipItem = null; }
    });
  }

  function toast(text) {
    if (!root) return;
    var t = el('div', 'toast', root.querySelector('.toast-wrap'));
    t.textContent = text;
    toasts.push(t);
    while (toasts.length > 4) {
      var old = toasts.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
    setTimeout(function () {
      if (t.parentNode) {
        t.style.opacity = '0';
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 500);
      }
    }, 3000);
  }

  /* ================= modal management ================= */
  function modalOpen() {
    return open.dialogue || open.shop || open.inventory || open.character || open.journal || open.automap || open.pause || open.title;
  }
  function closeAllModals() {
    open.dialogue = open.shop = open.inventory = open.character = open.journal = open.automap = false;
    applyModalState();
  }
  function closeTopModal() {
    if (open.dialogue) { closeDialogue(); return; }
    if (open.shop) { closeShop(); return; }
    if (open.automap) { open.automap = false; applyModalState(); return; }
    if (open.journal) { open.journal = false; applyModalState(); return; }
    if (open.character) { open.character = false; applyModalState(); return; }
    if (open.inventory) { open.inventory = false; applyModalState(); return; }
    if (open.pause) { closePause(); return; }
  }
  function applyModalState() {
    if (!invEl) return;
    invEl.style.display = open.inventory ? 'flex' : 'none';
    charEl.style.display = open.character ? 'flex' : 'none';
    journalEl.style.display = open.journal ? 'flex' : 'none';
    mapEl.style.display = open.automap ? 'flex' : 'none';
    shopEl.style.display = open.shop ? 'flex' : 'none';
    diaEl.style.display = open.dialogue ? 'flex' : 'none';
    pauseEl.style.display = open.pause ? 'flex' : 'none';
  }

  function togglePanel(name) {
    if (open.pause || open.title) return;
    if (open.dialogue) closeDialogue();
    if (open.shop && name !== 'inventory') closeShop();
    if (name === 'inventory') {
      open.inventory = !open.inventory;
      if (open.inventory) { open.character = open.journal = open.automap = false; }
    } else if (name === 'character') {
      open.character = !open.character;
      if (open.character) { open.inventory = false; open.journal = open.automap = false; }
    } else if (name === 'journal') {
      open.journal = !open.journal;
      if (open.journal) { open.character = open.inventory = open.automap = false; }
    } else if (name === 'automap') {
      open.automap = !open.automap;
      if (open.automap) { open.character = open.journal = open.inventory = false; }
    }
    applyModalState();
    refreshPanels();
  }

  /* ================= dialogue ================= */
  function openDialogue(npcId) {
    var talk = NPC.talk(npcId);
    if (!talk) return;
    open.dialogue = true;
    closeAllModalsExcept();
    open.dialogue = true;
    applyModalState();
    diaEl.innerHTML = '';
    var row = el('div', 'dia-row', diaEl);
    var port = el('canvas', 'dia-portrait', row);
    port.width = 108; port.height = 130;
    var pg = port.getContext('2d');
    var spr = SPR.actor(talk.npc.sprite);
    pg.drawImage(spr, 12, 26, spr.width, spr.height);
    var body = el('div', 'dia-body', row);
    var nameEl = el('div', 'dia-name', body);
    nameEl.textContent = talk.npc.name + ' \u2014 ' + talk.npc.role;
    var textEl = el('div', 'dia-text', body);
    textEl.textContent = talk.text;
    var btns = el('div', 'dia-buttons', body);
    for (var i = 0; i < talk.buttons.length; i++) {
      (function (b) {
        var btn = el('button', 'btn', btns);
        btn.textContent = b.label;
        btn.addEventListener('click', function () { b.fn(); });
      })(talk.buttons[i]);
    }
    Audio.sfx('click');
  }
  function closeDialogue() {
    open.dialogue = false;
    applyModalState();
  }
  function closeAllModalsExcept() {
    open.inventory = open.character = open.journal = open.automap = false;
    if (open.shop) { open.shop = false; }
  }

  /* ================= shop ================= */
  function openShop(npcId) {
    shopNpcId = npcId;
    var npc = NPC.get(npcId);
    open.shop = true;
    open.dialogue = false;
    applyModalState();
    renderShop();
  }
  function closeShop() {
    open.shop = false;
    shopNpcId = null;
    applyModalState();
  }
  function renderShop() {
    if (!shopEl) return;
    var npc = NPC.get(shopNpcId);
    if (!npc) return;
    shopEl.innerHTML = '';
    var head = el('div', 'shop-head', shopEl);
    head.textContent = npc.name + ' \u2014 ' + npc.role;
    var note = el('div', 'shop-note', shopEl);
    note.textContent = 'Left-click to buy. Right-click items in your inventory (I) to sell \u2014 while standing near the merchant.';
    var stock = el('div', 'shop-section', shopEl);
    el('div', 'shop-sub', stock).textContent = 'Wares';
    var grid = el('div', 'shop-grid', stock);
    var list = Items.SHOPS[npc.shop] || [];
    for (var i = 0; i < list.length; i++) {
      (function (baseId) {
        var it = Items.make(baseId);
        var cell = el('div', 'shop-cell', grid);
        cell.appendChild(iconCanvas(it.icon));
        var nm = el('div', 'shop-item-name', cell);
        nm.textContent = it.name;
        var pr = el('div', 'shop-item-price', cell);
        pr.textContent = it.value + 'g';
        cell.addEventListener('click', function () { NPC.buy(shopNpcId, baseId); });
        cell.addEventListener('mouseenter', function () { showTooltip(it, cell, 'Left-click to buy.'); });
        cell.addEventListener('mouseleave', hideTooltip);
      })(list[i]);
    }
    var bb = el('div', 'shop-section', shopEl);
    el('div', 'shop-sub', bb).textContent = 'Buyback (recently sold)';
    var bbg = el('div', 'shop-grid', bb);
    var bl = NPC.buybackList(npc.id);
    if (!bl.length) {
      el('div', 'shop-empty', bbg).textContent = 'Nothing here yet.';
    }
    for (var b = 0; b < bl.length; b++) {
      (function (idx) {
        var it2 = bl[idx];
        var cell2 = el('div', 'shop-cell', bbg);
        cell2.appendChild(iconCanvas(it2.icon));
        var nm2 = el('div', 'shop-item-name', cell2);
        nm2.textContent = it2.name;
        nm2.style.color = Items.qualityColor(it2.q);
        var pr2 = el('div', 'shop-item-price', cell2);
        pr2.textContent = Items.sellPrice(it2) + 'g';
        cell2.addEventListener('click', function () { NPC.buyBack(shopNpcId, idx); });
        cell2.addEventListener('mouseenter', function () { showTooltip(it2, cell2, 'Left-click to buy back.'); });
        cell2.addEventListener('mouseleave', hideTooltip);
      })(b);
    }
    var close = el('button', 'btn shop-close', shopEl);
    close.textContent = 'Close';
    close.addEventListener('click', closeShop);
  }

  /* ================= inventory / character ================= */
  function renderInventory() {
    if (!invEl) return;
    invEl.innerHTML = '';
    var head = el('div', 'panel-head', invEl);
    head.textContent = 'Inventory';
    var grid = el('div', 'inv-grid', invEl);
    for (var i = 0; i < Items.INV_SLOTS; i++) {
      var cell = el('div', 'inv-cell', grid);
      var st = Player.inventory[i];
      if (st) {
        cell.appendChild(iconCanvas(st.it.icon));
        if (st.qty > 1) {
          var q = el('div', 'inv-qty', cell);
          q.textContent = st.qty;
        }
        (function (idx) {
          cell.addEventListener('click', function () {
            if (idx >= Player.inventory.length) return;
            if (Items.isPotion(Player.inventory[idx].it)) {
              Player.potionCd = 0;
              Items.usePotion(Player.inventory[idx].it.type);
              Audio.sfx('potion');
            } else {
              Player.equipItem(idx);
            }
          });
          cell.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            if (idx >= Player.inventory.length) return;
            NPC.sellFromInventory(idx);
          });
          cell.addEventListener('mouseenter', function () {
            if (idx < Player.inventory.length) {
              showTooltip(Player.inventory[idx].it, cell, 'Left-click: equip / use\u00b7 Right-click near merchant: sell');
            }
          });
          cell.addEventListener('mouseleave', hideTooltip);
        })(i);
      }
    }
    var foot = el('div', 'panel-foot', invEl);
    foot.textContent = 'Gold: ' + Util.fmtSep(Player.gold);
  }
  function renderCharacter() {
    if (!charEl) return;
    charEl.innerHTML = '';
    el('div', 'panel-head', charEl).textContent = 'Character';
    var cols = el('div', 'char-cols', charEl);
    var left = el('div', 'char-left', cols);
    var stats = [
      ['Level', String(Player.level)],
      ['Experience', Player.xp + ' / ' + CFG.xpNeeded(Player.level)],
      ['Damage', String(Player.dmg())],
      ['Armor', String(Player.armor())],
      ['Health', Player.hp + ' / ' + Player.maxHp],
      ['Mana', Math.floor(Player.mp) + ' / ' + Player.maxMp],
      ['Gold', Util.fmtSep(Player.gold)]
    ];
    for (var i = 0; i < stats.length; i++) {
      var rowEl = el('div', 'stat-row', left);
      el('span', 'stat-key', rowEl).textContent = stats[i][0];
      el('span', 'stat-val', rowEl).textContent = stats[i][1];
    }
    var right = el('div', 'char-right', cols);
    var slots = [
      ['weapon', 'Weapon'], ['armor', 'Armor'], ['helm', 'Helm'], ['shield', 'Shield'], ['amulet', 'Amulet'], ['ring', 'Ring']
    ];
    for (var s = 0; s < slots.length; s++) {
      (function (pair) {
        var slot = pair[0];
        var rowEl2 = el('div', 'equip-row', right);
        var lab = el('div', 'equip-label', rowEl2);
        lab.textContent = pair[1];
        var it = Player.equip[slot];
        if (it) {
          rowEl2.appendChild(iconCanvas(it.icon, 28, 28));
          var nm = el('div', 'equip-name', rowEl2);
          nm.textContent = it.name;
          nm.style.color = Items.qualityColor(it.q);
          rowEl2.addEventListener('click', function () { Player.unequip(slot); });
          rowEl2.addEventListener('mouseenter', function () { showTooltip(it, rowEl2, 'Left-click to remove.'); });
          rowEl2.addEventListener('mouseleave', hideTooltip);
        } else {
          var nm2 = el('div', 'equip-name empty', rowEl2);
          nm2.textContent = '\u2014';
        }
      })(slots[s]);
    }
  }

  /* ================= journal ================= */
  function renderJournal() {
    if (!journalEl) return;
    journalEl.innerHTML = '';
    el('div', 'panel-head', journalEl).textContent = 'Quest Journal';
    var list = Quests.list();
    var active = [], done = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].st.state === 'completed') done.push(list[i]);
      else active.push(list[i]);
    }
    var actWrap = el('div', 'journal-scroll', journalEl);
    if (!active.length) el('div', 'journal-empty', actWrap).textContent = 'No active quests. Speak with the townsfolk.';
    for (var a = 0; a < active.length; a++) {
      var card = el('div', 'quest-card' + (active[a].st.state === 'ready' ? ' ready' : ''), actWrap);
      var title = el('div', 'quest-title', card);
      title.textContent = active[a].def.title;
      if (active[a].st.state === 'ready') {
        var badge = el('span', 'quest-badge', title);
        badge.textContent = 'READY TO TURN IN';
      }
      el('div', 'quest-desc', card).textContent = active[a].def.desc;
      el('div', 'quest-obj', card).textContent = Quests.progressText(active[a].def.id);
      el('div', 'quest-reward', card).textContent = Quests.rewardText(active[a].def.id);
    }
    if (done.length) {
      el('div', 'journal-sub', actWrap).textContent = '\u2014 Completed \u2014';
      for (var d2 = 0; d2 < done.length; d2++) {
        var card2 = el('div', 'quest-card done', actWrap);
        var title2 = el('div', 'quest-title', card2);
        title2.textContent = done[d2].def.title;
        el('div', 'quest-desc', card2).textContent = done[d2].def.desc;
      }
    }
  }

  /* ================= automap ================= */
  function renderAutomap() {
    if (!mapEl) return;
    mapEl.innerHTML = '';
    var a = World.curArea();
    el('div', 'panel-head', mapEl).textContent = 'Automap \u2014 ' + a.name;
    var cv = el('canvas', 'map-canvas', mapEl);
    var scale = 6;
    cv.width = a.w * scale + 12;
    cv.height = a.h * scale + 12;
    var g = cv.getContext('2d');
    g.fillStyle = '#05050a';
    g.fillRect(0, 0, cv.width, cv.height);
    for (var y = 0; y < a.h; y++) {
      for (var x = 0; x < a.w; x++) {
        var idx = y * a.w + x;
        if (!a.explored[idx]) continue;
        var v = a.grid[idx];
        g.fillStyle = v === CFG.T.WALL ? '#41454e' : (v === CFG.T.WATER ? '#26415c' : '#2a2d34');
        g.fillRect(6 + x * scale, 6 + y * scale, scale, scale);
      }
    }
    // transitions
    for (var tid in a.transitions) {
      var t = a.transitions[tid];
      if (!a.explored[t.y * a.w + t.x] && !(t.kind === 'door')) {
        var dd = World.doorAt(a, t.x, t.y);
        if (!dd) continue;
      }
      var px = 6 + t.x * scale + scale / 2, py = 6 + t.y * scale + scale / 2;
      if (t.kind === 'stairs') {
        g.fillStyle = '#d4a94a';
        g.beginPath();
        g.moveTo(px, py - 2.6);
        g.lineTo(px + 2.6, py + 2.6);
        g.lineTo(px - 2.6, py + 2.6);
        g.closePath();
        g.fill();
      } else if (t.kind === 'door') {
        g.fillStyle = '#e8e2d0';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      } else if (t.kind === 'cave') {
        g.fillStyle = '#8a5ad8';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      } else if (t.kind === 'gate') {
        g.fillStyle = '#7a8a5a';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      }
    }
    // player
    var ppx = 6 + Player.x * scale, ppy = 6 + Player.y * scale;
    g.fillStyle = '#ffd54d';
    g.beginPath();
    g.arc(ppx, ppy, 3.4, 0, Math.PI * 2);
    g.fill();
    var legend = el('div', 'map-legend', mapEl);
    legend.innerHTML = '<span style="color:#d4a94a">\u25b2 stairs</span> <span style="color:#e8e2d0">\u25a0 door</span> <span style="color:#8a5ad8">\u25a0 cave</span> <span style="color:#7a8a5a">\u25a0 gate</span> <span style="color:#ffd54d">\u25cf you</span>';
    var close = el('button', 'btn', mapEl);
    close.textContent = 'Close';
    close.addEventListener('click', function () { open.automap = false; applyModalState(); });
  }

  /* ================= refresh ================= */
  function refreshPanels() {
    if (open.inventory) renderInventory();
    if (open.character) renderCharacter();
    if (open.journal) renderJournal();
    if (open.automap) renderAutomap();
    if (open.shop) renderShop();
    updateHudStatic();
    renderTracker();
  }

  function updateHudStatic() {
    if (!goldLabel) return;
    goldLabel.textContent = Util.fmtSep(Player.gold);
    lvlLabel.textContent = 'Lv ' + Player.level;
    xpBarEl.style.width = Math.round(100 * Player.xp / CFG.xpNeeded(Player.level)) + '%';
    potionEls.potionH.textContent = Items.countPotion('potionH');
    potionEls.potionM.textContent = Items.countPotion('potionM');
  }

  function renderTracker() {
    if (!trackerEl) return;
    trackerEl.innerHTML = '';
    var list = Quests.list();
    for (var i = 0; i < list.length; i++) {
      var st = list[i].st;
      if (st.state === 'completed') continue;
      var line = el('div', 'tracker-line' + (st.state === 'ready' ? ' ready' : ''), trackerEl);
      line.textContent = (st.state === 'ready' ? '\u2605 ' : '') + list[i].def.title + ' \u2014 ' +
        Quests.progressText(list[i].def.id).replace('Objective: ', '');
    }
  }

  function questPulse(id) {
    if (!trackerEl) return;
    var lines = trackerEl.querySelectorAll('.tracker-line');
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].textContent.indexOf(Quests.DEFS[id] ? Quests.DEFS[id].title : '') === 0) {
        lines[i].style.color = '#ffd54d';
        setTimeout(function (n) {
          return function () { if (n.parentNode) n.style.color = ''; };
        }(lines[i]), 400);
      }
    }
  }

  /* ================= tooltip ================= */
  function showTooltip(it, anchor, hint) {
    if (!tooltipEl) return;
    tooltipItem = it;
    var html = '<div class="tt-name" style="color:' + Items.qualityColor(it.q) + '">' + it.name + '</div>';
    var lines = [];
    var typeNames = {
      weapon: 'One-handed weapon', armor: 'Chest armor', helm: 'Helm', shield: 'Shield',
      amulet: 'Amulet', ring: 'Ring', potionH: 'Health potion', potionM: 'Mana potion',
      quest: 'Quest item', valuable: 'Valuable'
    };
    lines.push(typeNames[it.type] || it.type);
    if (it.dmg) lines.push('Damage: +' + it.dmg);
    if (it.armor) lines.push('Armor: +' + it.armor);
    if (it.hp) lines.push('Health: +' + it.hp);
    if (it.mp) lines.push('Mana: +' + it.mp);
    if (it.heal) lines.push(it.type === 'potionH' ? 'Restores ' + it.heal + ' health' : 'Restores ' + it.heal + ' mana');
    lines.push('Value: ' + it.value + ' gold');
    if (it.lvl > 1) lines.push('Requires level ' + it.lvl);
    if (hint) lines.push(hint);
    html += '<div class="tt-line">' + lines.join('</div><div class="tt-line">') + '</div>';
    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    var r = anchor.getBoundingClientRect();
    tooltipEl.style.left = Math.min(r.right + 10, window.innerWidth - 250) + 'px';
    tooltipEl.style.top = Math.min(r.top, window.innerHeight - 150) + 'px';
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
    tooltipItem = null;
  }

  /* ================= boss bar ================= */
  var bossVisible = false;
  function bossBarShow(name, hp, max) {
    bossVisible = true;
    if (!bossBarEl) return;
    bossNameEl.textContent = name;
    bossBarEl.style.display = 'block';
    bossBarUpdate(hp, max);
  }
  function bossBarUpdate(hp, max) {
    if (!bossBarEl || bossBarEl.style.display === 'none') return;
    bossFillEl.style.width = Math.max(0, Math.round(100 * hp / max)) + '%';
  }
  function bossBarHide() {
    bossVisible = false;
    if (!bossBarEl) return;
    bossBarEl.style.display = 'none';
  }

  /* ================= orbs ================= */
  function drawOrb(g, ratio, main, deep, glowC, t) {
    var cx = 56, cy = 56, R = 47;
    g.clearRect(0, 0, 112, 112);
    // outer metal ring
    var rg = g.createRadialGradient(cx, cy, R - 10, cx, cy, R + 3);
    rg.addColorStop(0, '#2a2c33');
    rg.addColorStop(0.7, '#121317');
    rg.addColorStop(1, '#3d4048');
    g.fillStyle = rg;
    g.beginPath();
    g.arc(cx, cy, R + 3, 0, Math.PI * 2);
    g.fill();
    // vessel interior
    g.fillStyle = 'rgba(8,10,16,0.92)';
    g.beginPath();
    g.arc(cx, cy, R - 4, 0, Math.PI * 2);
    g.fill();
    // liquid
    if (ratio > 0.005) {
      g.save();
      g.beginPath();
      g.arc(cx, cy, R - 6, 0, Math.PI * 2);
      g.clip();
      var topY = cy + (R - 6) - ratio * (2 * (R - 6));
      var lg = g.createLinearGradient(0, topY, 0, cy + R);
      lg.addColorStop(0, main);
      lg.addColorStop(1, deep);
      g.fillStyle = lg;
      g.beginPath();
      g.moveTo(cx - (R - 6), topY + 2);
      for (var x = -1; x <= 1.05; x += 0.05) {
        var wx = cx + x * (R - 6);
        var wave = Math.sin(x * 4.2 + t * 2.1) * 1.6 + Math.sin(x * 9 + t * 3.3) * 0.7;
        g.lineTo(wx, topY + wave);
      }
      g.lineTo(cx + (R - 6), cy + R);
      g.lineTo(cx - (R - 6), cy + R);
      g.closePath();
      g.fill();
      // surface highlight line
      g.strokeStyle = 'rgba(255,255,255,0.28)';
      g.lineWidth = 1.2;
      g.beginPath();
      for (var x2 = -1; x2 <= 1.05; x2 += 0.05) {
        var wx2 = cx + x2 * (R - 6);
        var wave2 = Math.sin(x2 * 4.2 + t * 2.1) * 1.6 + Math.sin(x2 * 9 + t * 3.3) * 0.7;
        if (x2 === -1) g.moveTo(wx2, topY + wave2);
        else g.lineTo(wx2, topY + wave2);
      }
      g.stroke();
      // bubbles
      for (var b = 0; b < 4; b++) {
        var bp = ((t * 0.35 + b * 0.31) % 1);
        var by = cy + (R - 10) - bp * (2 * (R - 10)) + (topY - cy);
        var bx2 = cx + Math.sin(b * 2.7 + t * 1.2) * (R - 14);
        if (by > topY + 3) {
          g.fillStyle = 'rgba(255,255,255,0.25)';
          g.beginPath();
          g.arc(bx2, by, 1.6 + b % 2, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
    }
    // glass shading: inner top shadow + rim light
    var ig = g.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, R);
    ig.addColorStop(0, 'rgba(255,255,255,0.10)');
    ig.addColorStop(0.4, 'rgba(255,255,255,0)');
    ig.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = ig;
    g.beginPath();
    g.arc(cx, cy, R - 4, 0, Math.PI * 2);
    g.fill();
    // top-left specular arc
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.arc(cx, cy, R - 9, Math.PI * 1.05, Math.PI * 1.45);
    g.stroke();
    // small dot
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath();
    g.arc(cx - R * 0.55, cy - R * 0.62, 2.4, 0, Math.PI * 2);
    g.fill();
    // glow behind orb
    if (ratio > 0.05) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.35;
      var grd = g.createRadialGradient(cx, cy, R * 0.5, cx, cy, R + 4);
      grd.addColorStop(0, glowC);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(cx, cy, R + 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }

  /* ================= per-frame update ================= */
  function update(dt, t) {
    if (!root) return;
    drawOrb(hpCtx, Util.clamp(Player.hp / Player.maxHp, 0, 1), '#c83a2a', '#5e1410', 'rgba(255,60,40,0.7)', t);
    drawOrb(mpCtx, Util.clamp(Player.mp / Player.maxMp, 0, 1), '#2a62c8', '#0e2054', 'rgba(60,110,255,0.7)', t);
    // ability cooldowns
    for (var id in abilityEls) {
      var def = CFG.ABILITIES[id];
      var frac = Player.abilityCd[id] / def.cd;
      abilityEls[id].cd.style.height = Math.round(frac * 40) + 'px';
      abilityEls[id].slot.style.opacity = (Player.mp < def.mana) ? '0.55' : '1';
    }
    // shop proximity
    if (open.shop && shopNpcId) {
      var def2 = NPC.get(shopNpcId);
      var near = NPC.nearMerchant(Player.x, Player.y);
      if (!near || near.id !== shopNpcId) {
        closeShop();
        toast('You have wandered too far from the merchant.');
      }
    }
    // ability key hints + hp text
    updateHudStatic();
  }

  /* ================= title / pause ================= */
  function showTitle() {
    open.title = true;
    if (!titleEl) return;
    titleEl.style.display = 'flex';
    titleEl.innerHTML = '';
    var inner = el('div', 'title-inner', titleEl);
    el('div', 'title-game', inner).textContent = 'EMBERFALL';
    el('div', 'title-sub', inner).textContent = 'a gothic action RPG';
    var story = el('div', 'title-story', inner);
    story.innerHTML = 'The cathedral bell of Thornhollow has been silent for forty years, and the dead beneath it have grown restless. ' +
      'Something stirs in the catacombs below the old choir \u2014 and it is waking the wilderness around the town.' +
      '<br><br>The townsfolk need a blade, a light, and someone foolish enough to carry both into the dark.';
    var nb = el('button', 'btn big', inner);
    nb.textContent = 'New Game';
    nb.addEventListener('click', function () {
      open.title = false;
      titleEl.style.display = 'none';
      Game.newGame();
    });
    if (Game.hasSave()) {
      var cb = el('button', 'btn big', inner);
      cb.textContent = 'Continue';
      cb.addEventListener('click', function () {
        open.title = false;
        titleEl.style.display = 'none';
        Game.continueGame();
      });
    }
    var sb = el('button', 'btn', inner);
    sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    sb.addEventListener('click', function () {
      Audio.toggle();
      sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    });
  }

  function togglePause() {
    if (open.title) return;
    if (open.pause) {
      closePause();
      return;
    }
    open.pause = true;
    applyModalState();
    if (!pauseEl) return;
    pauseEl.innerHTML = '';
    var inner = el('div', 'pause-inner', pauseEl);
    el('div', 'pause-title', inner).textContent = 'Paused';
    var mk = function (label, fn) {
      var b = el('button', 'btn big', inner);
      b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    };
    mk('Resume', closePause);
    mk('Save Game', function () { Game.save(); toast('Game saved.'); });
    mk('Load Game', function () { if (Game.load()) { closePause(); toast('Game loaded.'); } else toast('No save found.'); });
    mk('New Game', function () { closePause(); Game.newGame(); });
    var sb = mk('Sound: ' + (Audio.enabled() ? 'On' : 'Off'), function () {
      Audio.toggle();
      sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    });
  }
  function closePause() {
    open.pause = false;
    applyModalState();
  }

  function onAreaEnter(a) {
    if (floorLabel) floorLabel.textContent = a.name;
  }

  return {
    init: init,
    modalOpen: modalOpen, closeTopModal: closeTopModal, closeAllModals: closeAllModals,
    togglePanel: togglePanel, openDialogue: openDialogue, closeDialogue: closeDialogue,
    openShop: openShop, closeShop: closeShop,
    togglePause: togglePause, closePause: closePause,
    toast: toast, refreshPanels: refreshPanels,
    bossBarShow: bossBarShow, bossBarUpdate: bossBarUpdate, bossBarHide: bossBarHide,
    bossVisible: function () { return bossVisible; },
    onAreaEnter: onAreaEnter, update: update,
    showTitle: showTitle,
    renderTracker: renderTracker, questPulse: questPulse,
    open: open
  };
})();

'use strict';
/* ============================================================
   Emberfall - 14_audio.js : WebAudio synth SFX
   ============================================================ */
var Audio = (function () {

  var ctx = null, master = null;
  var on = true;
  var unlocked = false;

  function ensure() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { } }
    return ctx;
  }
  function unlock() {
    unlocked = true;
    ensure();
  }

  function tone(freq, dur, type, vol, freqEnd, delay) {
    if (!on || !unlocked) return;
    var c = ensure();
    if (!c) return;
    try {
      var t0 = c.currentTime + (delay || 0);
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch (e) { }
  }
  function noise(dur, vol, filterFreq, delay, type) {
    if (!on || !unlocked) return;
    var c = ensure();
    if (!c) return;
    try {
      var t0 = c.currentTime + (delay || 0);
      var len = Math.max(1, Math.floor(c.sampleRate * dur));
      var buf = c.createBuffer(1, len, c.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource();
      src.buffer = buf;
      var f = c.createBiquadFilter();
      f.type = type || 'lowpass';
      f.frequency.value = filterFreq || 800;
      var g = c.createGain();
      g.gain.setValueAtTime(vol || 0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0);
    } catch (e) { }
  }

  function sfx(name) {
    switch (name) {
      case 'click': tone(620, 0.05, 'square', 0.08); break;
      case 'pickup': tone(760, 0.06, 'sine', 0.14); tone(1180, 0.08, 'sine', 0.12, null, 0.05); break;
      case 'gold': tone(1250, 0.05, 'triangle', 0.14); tone(1650, 0.07, 'triangle', 0.13, null, 0.05); break;
      case 'potion': tone(300, 0.22, 'sine', 0.15, 520); noise(0.2, 0.05, 900); break;
      case 'firebolt': noise(0.18, 0.14, 2400); tone(220, 0.2, 'sawtooth', 0.1, 70); break;
      case 'firehit': noise(0.14, 0.16, 1200); break;
      case 'nova': tone(95, 0.4, 'sawtooth', 0.22, 40); noise(0.3, 0.12, 500); break;
      case 'bolt': tone(420, 0.14, 'square', 0.09, 180); break;
      case 'heal': tone(520, 0.4, 'sine', 0.1); tone(660, 0.4, 'sine', 0.09, null, 0.03); tone(880, 0.5, 'sine', 0.06, null, 0.08); break;
      case 'hurt': tone(190, 0.16, 'sawtooth', 0.16, 85); noise(0.1, 0.1, 600); break;
      case 'hit': noise(0.07, 0.15, 500); tone(140, 0.08, 'square', 0.08, 90); break;
      case 'death': noise(0.4, 0.14, 700); tone(280, 0.5, 'sawtooth', 0.13, 55); break;
      case 'roar': tone(80, 0.85, 'sawtooth', 0.24, 38); noise(0.6, 0.12, 300); break;
      case 'levelup': tone(523, 0.12, 'triangle', 0.14); tone(659, 0.12, 'triangle', 0.14, null, 0.1); tone(784, 0.2, 'triangle', 0.14, null, 0.2); break;
      case 'quest': tone(587, 0.1, 'triangle', 0.13); tone(880, 0.16, 'triangle', 0.13, null, 0.1); break;
      case 'reward': tone(440, 0.14, 'triangle', 0.14); tone(554, 0.14, 'triangle', 0.14, null, 0.12); tone(659, 0.24, 'triangle', 0.14, null, 0.24); break;
      case 'door': tone(150, 0.35, 'sawtooth', 0.09, 100); noise(0.3, 0.05, 300); break;
      case 'gate': noise(0.5, 0.12, 200); tone(60, 0.5, 'sawtooth', 0.12, 30); break;
      case 'chest': tone(130, 0.25, 'sawtooth', 0.1, 90); noise(0.12, 0.1, 400, 0.2); break;
      case 'stairs': noise(0.35, 0.08, 700); break;
      case 'equip': tone(700, 0.06, 'square', 0.09); tone(900, 0.05, 'square', 0.07, null, 0.05); break;
      case 'buy': tone(990, 0.06, 'triangle', 0.12); tone(1320, 0.08, 'triangle', 0.11, null, 0.06); break;
      case 'sell': tone(1250, 0.06, 'triangle', 0.12); tone(990, 0.08, 'triangle', 0.1, null, 0.06); break;
      case 'deny': tone(140, 0.14, 'square', 0.08, 110); break;
    }
  }

  function toggle() { on = !on; }
  function enabled() { return on; }

  return { sfx: sfx, toggle: toggle, enabled: enabled, unlock: unlock };
})();

'use strict';
/* ============================================================
   Emberfall - 15_main.js : boot, main loop, save/load, tests
   ============================================================ */
var Game = (function () {

  var canvas = null;
  var running = false;
  var time = 0;
  var lastT = 0;
  var lastAutoSave = 0;

  function start(canvasEl, uiRoot) {
    canvas = canvasEl;
    Render.init(canvas);
    Input.bind(canvas);
    UI.init(uiRoot);
    UI.showTitle();
    window.addEventListener('mousedown', function () { Audio.unlock(); });
    window.addEventListener('keydown', function () { Audio.unlock(); });
    lastT = Util.now();
    requestAnimationFrame(loop);
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = Util.now();
    var dt = Math.min(CFG.MAX_FRAME, now - lastT) / 1000;
    lastT = now;
    frame(dt);
  }

  function frame(dt) {
    time += dt;
    if (running && !UI.open.title && !UI.open.pause) {
      var a = World.curArea();
      if (a) {
        Player.update(dt);
        for (var i = 0; i < a.enemies.length; i++) {
          var e = a.enemies[i];
          if (!e.dead && !e.aggro && Util.dist(e.x, e.y, Player.x, Player.y) > 18) continue;
          Enemies.update(e, dt, a);
        }
      }
      Render.update(dt);
    }
    if (UI.update) UI.update(dt, time);
    Render.draw();
  }

  /* ---------- new game / continue ---------- */
  function newGame() {
    World.world.runSeed = (Math.random() * 0x7fffffff) | 0;
    World.world.areas = {};
    World.world.current = null;
    World.world.nextUid = 1;
    Player.reset();
    Quests.reset();
    NPC.deserialize({});
    NPC.placeAll();
    World.enter('town', { x: 27, y: 22, grace: true });
    running = true;
    UI.closeAllModals();
    UI.refreshPanels();
    UI.toast('Welcome to Thornhollow. The townsfolk have need of you.');
    autosave();
  }

  function continueGame() {
    if (!load()) {
      UI.showTitle();
      return;
    }
    running = true;
    UI.closeAllModals();
    UI.refreshPanels();
    UI.toast('The world remembers you.');
  }

  /* ---------- save / load ---------- */
  function hasSave() {
    try {
      return !!localStorage.getItem(CFG.SAVE_KEY);
    } catch (e) { return false; }
  }

  function save() {
    try {
      var s = {
        v: 1,
        runSeed: World.world.runSeed,
        player: {
          area: Player.area, x: Player.x, y: Player.y,
          level: Player.level, xp: Player.xp, hp: Player.hp, mp: Player.mp,
          maxHp: Player.maxHp, maxMp: Player.maxMp,
          baseDmg: Player.baseDmg, baseArmor: Player.baseArmor,
          gold: Player.gold,
          inventory: Player.inventory,
          equip: Player.equip
        },
        quests: Quests.serialize(),
        npc: NPC.serialize(),
        world: World.serializeState()
      };
      localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(s));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(CFG.SAVE_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s || s.v !== 1) return false;
      World.world.areas = {};
      World.world.current = null;
      World.applyState(s.world);
      NPC.deserialize(s.npc);
      NPC.placeAll();
      Quests.deserialize(s.quests);
      var p = s.player;
      Player.reset();
      Player.level = p.level; Player.xp = p.xp;
      Player.hp = p.hp; Player.mp = p.mp;
      Player.maxHp = p.maxHp; Player.maxMp = p.maxMp;
      Player.baseDmg = p.baseDmg; Player.baseArmor = p.baseArmor;
      Player.gold = p.gold;
      Player.inventory = p.inventory || [];
      Player.equip = p.equip || { weapon: null, armor: null, helm: null, shield: null, amulet: null, ring: null };
      World.enter(p.area, { x: Math.floor(p.x), y: Math.floor(p.y), grace: true });
      Player.x = p.x; Player.y = p.y;
      UI.bossBarHide();
      return true;
    } catch (e) {
      return false;
    }
  }

  function autosave() {
    if (!running) return;
    var now = Util.now();
    if (now - lastAutoSave < 900) return;
    lastAutoSave = now;
    save();
  }

  /* ---------- test hooks ---------- */
  var __test = {
    step: function (dt) { frame(dt); },
    time: function () { return time; },
    clickWorld: function (wx, wy) {
      var s = Render.worldToScreen(wx, wy);
      Input.simDown(s.x, s.y);
      Input.simUp();
    },
    clickTile: function (x, y) {
      var s = Render.tileScreen(x, y);
      Input.simDown(s.x, s.y);
      Input.simUp();
    },
    key: function (k) { Input.simKey(k); },
    teleport: function (areaId, x, y) {
      World.enter(areaId, { x: x, y: y, grace: true });
    },
    hurtPlayer: function (n) { Player.takeDamage(n); },
    giveGold: function (n) { Player.gold += n; },
    killAll: function () {
      var a = World.curArea();
      for (var i = a.enemies.length - 1; i >= 0; i--) {
        Enemies.kill(a.enemies[i]);
      }
    },
    save: save, load: load
  };

  return {
    start: start, newGame: newGame, continueGame: continueGame,
    hasSave: hasSave, save: save, load: load, autosave: autosave,
    frame: frame,
    running: function () { return running; },
    time: function () { return time; },
    __test: __test
  };
})();

