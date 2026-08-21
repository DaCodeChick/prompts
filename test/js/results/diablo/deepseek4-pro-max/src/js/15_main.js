'use strict';
/* ============================================================
   Emberfall - 15_main.js : boot, main loop, save/load, tests
   ============================================================ */
var Game = (function () {

  var canvas = null;
  var running = false;
  var time = 0;
  var lastT = 0;
  var lastAutoSave = 0;

  function start(canvasEl, uiRoot) {
    canvas = canvasEl;
    Render.init(canvas);
    Input.bind(canvas);
    UI.init(uiRoot);
    UI.showTitle();
    window.addEventListener('mousedown', function () { Audio.unlock(); });
    window.addEventListener('keydown', function () { Audio.unlock(); });
    lastT = Util.now();
    requestAnimationFrame(loop);
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = Util.now();
    var dt = Math.min(CFG.MAX_FRAME, now - lastT) / 1000;
    lastT = now;
    frame(dt);
  }

  function frame(dt) {
    time += dt;
    if (running && !UI.open.title && !UI.open.pause) {
      var a = World.curArea();
      if (a) {
        Player.update(dt);
        for (var i = 0; i < a.enemies.length; i++) {
          var e = a.enemies[i];
          if (!e.dead && !e.aggro && Util.dist(e.x, e.y, Player.x, Player.y) > 18) continue;
          Enemies.update(e, dt, a);
        }
      }
      Render.update(dt);
    }
    if (UI.update) UI.update(dt, time);
    Render.draw();
  }

  /* ---------- new game / continue ---------- */
  function newGame() {
    World.world.runSeed = (Math.random() * 0x7fffffff) | 0;
    World.world.areas = {};
    World.world.current = null;
    World.world.nextUid = 1;
    Player.reset();
    Quests.reset();
    NPC.deserialize({});
    NPC.placeAll();
    World.enter('town', { x: 27, y: 22, grace: true });
    running = true;
    UI.closeAllModals();
    UI.refreshPanels();
    UI.toast('Welcome to Thornhollow. The townsfolk have need of you.');
    autosave();
  }

  function continueGame() {
    if (!load()) {
      UI.showTitle();
      return;
    }
    running = true;
    UI.closeAllModals();
    UI.refreshPanels();
    UI.toast('The world remembers you.');
  }

  /* ---------- save / load ---------- */
  function hasSave() {
    try {
      return !!localStorage.getItem(CFG.SAVE_KEY);
    } catch (e) { return false; }
  }

  function save() {
    try {
      var s = {
        v: 1,
        runSeed: World.world.runSeed,
        player: {
          area: Player.area, x: Player.x, y: Player.y,
          level: Player.level, xp: Player.xp, hp: Player.hp, mp: Player.mp,
          maxHp: Player.maxHp, maxMp: Player.maxMp,
          baseDmg: Player.baseDmg, baseArmor: Player.baseArmor,
          gold: Player.gold,
          inventory: Player.inventory,
          equip: Player.equip
        },
        quests: Quests.serialize(),
        npc: NPC.serialize(),
        world: World.serializeState()
      };
      localStorage.setItem(CFG.SAVE_KEY, JSON.stringify(s));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(CFG.SAVE_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s || s.v !== 1) return false;
      World.world.areas = {};
      World.world.current = null;
      World.applyState(s.world);
      NPC.deserialize(s.npc);
      NPC.placeAll();
      Quests.deserialize(s.quests);
      var p = s.player;
      Player.reset();
      Player.level = p.level; Player.xp = p.xp;
      Player.hp = p.hp; Player.mp = p.mp;
      Player.maxHp = p.maxHp; Player.maxMp = p.maxMp;
      Player.baseDmg = p.baseDmg; Player.baseArmor = p.baseArmor;
      Player.gold = p.gold;
      Player.inventory = p.inventory || [];
      Player.equip = p.equip || { weapon: null, armor: null, helm: null, shield: null, amulet: null, ring: null };
      World.enter(p.area, { x: Math.floor(p.x), y: Math.floor(p.y), grace: true });
      Player.x = p.x; Player.y = p.y;
      UI.bossBarHide();
      return true;
    } catch (e) {
      return false;
    }
  }

  function autosave() {
    if (!running) return;
    var now = Util.now();
    if (now - lastAutoSave < 900) return;
    lastAutoSave = now;
    save();
  }

  /* ---------- test hooks ---------- */
  var __test = {
    step: function (dt) { frame(dt); },
    time: function () { return time; },
    clickWorld: function (wx, wy) {
      var s = Render.worldToScreen(wx, wy);
      Input.simDown(s.x, s.y);
      Input.simUp();
    },
    clickTile: function (x, y) {
      var s = Render.tileScreen(x, y);
      Input.simDown(s.x, s.y);
      Input.simUp();
    },
    key: function (k) { Input.simKey(k); },
    teleport: function (areaId, x, y) {
      World.enter(areaId, { x: x, y: y, grace: true });
    },
    hurtPlayer: function (n) { Player.takeDamage(n); },
    giveGold: function (n) { Player.gold += n; },
    killAll: function () {
      var a = World.curArea();
      for (var i = a.enemies.length - 1; i >= 0; i--) {
        Enemies.kill(a.enemies[i]);
      }
    },
    save: save, load: load
  };

  return {
    start: start, newGame: newGame, continueGame: continueGame,
    hasSave: hasSave, save: save, load: load, autosave: autosave,
    frame: frame,
    running: function () { return running; },
    time: function () { return time; },
    __test: __test
  };
})();
