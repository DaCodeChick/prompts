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
