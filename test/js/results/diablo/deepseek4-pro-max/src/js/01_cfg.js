'use strict';
/* ============================================================
   Emberfall - 01_cfg.js : global configuration / balancing
   ============================================================ */
var CFG = (function () {

  var TILE_W = 64;      // isometric tile width
  var TILE_H = 32;      // isometric tile height
  var WALL_H = 46;      // wall face height in px
  var DOOR_H = 46;

  var T = { FLOOR: 0, WALL: 1, WATER: 2 };

  var VIEW_R = 9;              // fog visibility radius (tiles)
  var TORCH_R = 4;             // torch light radius (tiles)
  var VIS_INTERVAL = 160;      // ms between visibility recomputes
  var MAX_FRAME = 50;          // max dt ms per frame

  var PLAYER = {
    baseHP: 60, baseMP: 30, baseDmg: 4, baseArmor: 0,
    hpPerLevel: 14, mpPerLevel: 8, dmgPerLevel: 1, armorPerLevel: 1,
    speed: 4.6,            // tiles / second
    meleeRange: 1.25,
    attackCd: 0.42,
    manaRegen: 2.2,
    pickupRange: 1.4,
    interactRange: 1.6,
    npcRange: 2.4,
    merchantRange: 6.0,
    startGold: 50
  };

  function xpNeeded(level) { return 60 + (level - 1) * 45; }

  var ABILITIES = {
    firebolt: { key: '1', name: 'Firebolt', mana: 5, cd: 0.7, dmg: function (lvl) { return 10 + lvl * 2; } },
    nova: { key: '2', name: 'Flame Nova', mana: 12, cd: 3.0, dmg: function (lvl) { return 15 + Math.round(lvl * 2.6); } },
    heal: { key: '3', name: 'Mend', mana: 9, cd: 4.5, amount: function (lvl) { return 26 + lvl * 4; } }
  };

  var POTIONS = {
    health: { heal: 40, healMax: 0.25, key: 'Q' },
    mana: { heal: 35, healMax: 0.25, key: 'W' }
  };

  var AREA_ORDER = ['town', 'wild', 'cath1', 'cath2', 'cath3', 'b1', 'b2', 'b3', 'b4'];

  var AREA_NAMES = {
    town: 'Town of Thornhollow',
    wild: 'Grimmoor Wilds',
    cath1: 'Cathedral \u00b7 1F',
    cath2: 'Cathedral \u00b7 2F',
    cath3: 'Cathedral \u00b7 3F \u2014 The High Chancel',
    b1: 'The Catacombs \u00b7 B1F',
    b2: 'The Catacombs \u00b7 B2F',
    b3: 'The Catacombs \u00b7 B3F',
    b4: 'The Catacombs \u00b7 B4F \u2014 The Charnel Throne'
  };

  var SAVE_KEY = 'emberfall_save_v1';

  var PALETTES = {
    crypt: {
      floor: ['#35373f', '#383a43', '#33353d', '#3a3c45', '#313338', '#3d3f48'],
      floorGrout: '#1d1e24',
      wall: ['#26282e', '#2b2d35', '#22242a'],
      wallMortar: '#141519',
      wallTop: '#3a3c45',
      accent: '#5a6b5a'
    },
    cathedral: {
      floor: ['#4a463d', '#4e4a41', '#454139', '#514d44', '#423e36', '#555148'],
      floorGrout: '#2a2722',
      wall: ['#4d4940', '#534f45', '#474339'],
      wallMortar: '#2e2b25',
      wallTop: '#57534a',
      accent: '#6d5a3a'
    },
    town: {
      floor: ['#4a4436', '#4c4638', '#474132', '#4e483a'],
      wall: ['#57503f', '#524b3b', '#5c5542'],
      wallMortar: '#332e22',
      wallTop: '#5f5846',
      accent: '#7a6a45'
    },
    wild: {
      floor: ['#425132', '#3f4d30', '#475636', '#3c4a2e'],
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    grass: {
      floor: ['#405c34', '#3d5730', '#46643a', '#385229', '#4a6a3e'],
      floorGrout: '#232c1b',
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    dirt: {
      floor: ['#57493a', '#544636', '#5a4c3d', '#514334'],
      floorGrout: '#33291f',
      wall: ['#4a4032', '#453c2f'],
      wallMortar: '#241f18',
      wallTop: '#554a38',
      accent: '#56683e'
    },
    boss: {
      floor: ['#2f3138', '#32343c', '#2c2e35', '#353740'],
      floorGrout: '#191a20',
      wall: ['#232529', '#282a30', '#1f2125'],
      wallMortar: '#101115',
      wallTop: '#33353d',
      accent: '#6e2f2f'
    }
  };

  return {
    TILE_W: TILE_W, TILE_H: TILE_H, WALL_H: WALL_H, DOOR_H: DOOR_H,
    T: T, VIEW_R: VIEW_R, TORCH_R: TORCH_R, VIS_INTERVAL: VIS_INTERVAL, MAX_FRAME: MAX_FRAME,
    PLAYER: PLAYER, xpNeeded: xpNeeded, ABILITIES: ABILITIES, POTIONS: POTIONS,
    AREA_ORDER: AREA_ORDER, AREA_NAMES: AREA_NAMES, SAVE_KEY: SAVE_KEY, PALETTES: PALETTES
  };
})();
