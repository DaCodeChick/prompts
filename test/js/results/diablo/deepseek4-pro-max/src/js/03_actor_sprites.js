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
