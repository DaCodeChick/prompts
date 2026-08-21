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
