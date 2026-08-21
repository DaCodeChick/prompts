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
