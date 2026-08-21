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
