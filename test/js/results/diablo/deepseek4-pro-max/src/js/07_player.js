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
