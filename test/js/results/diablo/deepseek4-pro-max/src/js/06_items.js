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
