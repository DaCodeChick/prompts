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
