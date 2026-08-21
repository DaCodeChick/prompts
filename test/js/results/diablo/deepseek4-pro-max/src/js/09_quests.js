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
