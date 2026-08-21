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
