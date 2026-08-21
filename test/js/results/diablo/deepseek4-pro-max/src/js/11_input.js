'use strict';
/* ============================================================
   Emberfall - 11_input.js : mouse & keyboard
   ============================================================ */
var Input = (function () {

  var mouseX = 0, mouseY = 0;
  var dragging = false;
  var lastDragTile = null;
  var lastDragTime = 0;

  function bind(canvas) {
    canvas.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (e.button === 2) return;
      var rect = canvas.getBoundingClientRect();
      var sx = e.clientX - rect.left;
      var sy = e.clientY - rect.top;
      mouseX = sx; mouseY = sy;
      if (UI.modalOpen()) { UI.closeTopModal(); return; }
      onDown(sx, sy);
    });
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (dragging) {
        var now = Util.now();
        if (now - lastDragTime > 55) {
          lastDragTime = now;
          dragStep();
        }
      }
    });
    window.addEventListener('mouseup', function () {
      dragging = false;
      lastDragTile = null;
    });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.repeat) return;
    var k = e.key;
    var handled = true;
    switch (k) {
      case 'Escape':
        if (UI.modalOpen()) UI.closeTopModal();
        else UI.togglePause();
        break;
      case 'i': case 'I': UI.togglePanel('inventory'); break;
      case 'j': case 'J': UI.togglePanel('journal'); break;
      case 'c': case 'C': UI.togglePanel('character'); break;
      case 'm': case 'M': UI.togglePanel('automap'); break;
      case '1': Player.cast('firebolt'); break;
      case '2': Player.cast('nova'); break;
      case '3': Player.cast('heal'); break;
      case 'q': case 'Q': Player.usePotionHot('potionH'); break;
      case 'w': case 'W': Player.usePotionHot('potionM'); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  }

  function tileAtScreen(sx, sy) {
    var w = Render.screenToWorld(sx, sy);
    if (!w) return null;
    // diamond hit test over candidate tiles
    var TW = CFG.TILE_W, TH = CFG.TILE_H;
    var fx = w.x / (TW / 2), fy = w.y / (TH / 2);
    var tx = (fx + fy) / 2, ty = (fy - fx) / 2;
    var cx = Math.round(tx), cy = Math.round(ty);
    for (var r = 0; r < 6; r++) {
      var x0 = cx - r, x1 = cx + r, y0 = cy - r, y1 = cy + r;
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          if (x !== x0 && x !== x1 && y !== y0 && y !== y1) continue;
          var cxs = (x - y) * TW / 2, cys = (x + y) * TH / 2;
          var half = Math.abs(w.x - cxs) / (TW / 2) + Math.abs(w.y - cys) / (TH / 2);
          var topH = 0;
          var d = World.doorAt(World.curArea(), x, y);
          if (d && d.open) topH = 0;
          if (half <= 1.02 && w.y >= cys - CFG.WALL_H && w.y <= cys + TH / 2) {
            return { x: x, y: y };
          }
        }
      }
    }
    return null;
  }

  function onDown(sx, sy) {
    var a = World.curArea();
    if (!a) return;
    var tile = tileAtScreen(sx, sy);
    if (!tile) return;
    var tx = tile.x, ty = tile.y;
    // NPC
    var npc = NPC.npcAt(a, tx, ty);
    if (npc) {
      Player.setPending('npc', tx, ty, CFG.PLAYER.npcRange, function () {
        Audio.sfx('click');
        UI.openDialogue(npc.id);
      });
      return;
    }
    // chest
    var chest = null;
    for (var c = 0; c < a.chests.length; c++) {
      if (a.chests[c].x === tx && a.chests[c].y === ty) { chest = a.chests[c]; break; }
    }
    if (chest) {
      Player.setPending('chest', tx, ty, CFG.PLAYER.interactRange, function () { openChest(chest); });
      return;
    }
    // altar
    if (a.altar && a.altar.x === tx && a.altar.y === ty) {
      Player.setPending('altar', tx, ty, 1.9, function () { touchAltar(); });
      return;
    }
    // door
    var door = World.doorAt(a, tx, ty);
    if (door) {
      if (!door.open) {
        Player.setPending('door', tx, ty, 1.6, function () { openDoor(door); });
      } else {
        Player.moveTo(tx, ty);
      }
      return;
    }
    // loot
    var loot = null;
    for (var l = 0; l < a.loot.length; l++) {
      var e = a.loot[l];
      if (Util.dist(tx + 0.5, ty + 0.5, e.x, e.y) < 1.1) { loot = e; break; }
    }
    if (loot) {
      Player.setPending('loot', Math.floor(loot.x), Math.floor(loot.y), CFG.PLAYER.pickupRange, function () { pickupLoot(loot); });
      return;
    }
    // enemy
    var en = enemyAt(tx, ty);
    if (en) {
      Player.attackTarget(en);
      dragging = true;
      lastDragTile = tile;
      lastDragTime = Util.now();
      return;
    }
    // transition (stairs/cave/gate or open door tile) or plain ground
    Player.moveTo(tx, ty);
    dragging = true;
    lastDragTile = tile;
    lastDragTime = Util.now();
  }

  function dragStep() {
    var a = World.curArea();
    if (!a) return;
    var tile = tileAtScreen(mouseX, mouseY);
    if (!tile || (lastDragTile && tile.x === lastDragTile.x && tile.y === lastDragTile.y)) return;
    lastDragTile = tile;
    var en = enemyAt(tile.x, tile.y);
    if (en) { Player.attackTarget(en); return; }
    var door = World.doorAt(a, tile.x, tile.y);
    if (door && !door.open) return;
    if (!World.walkable(a, tile.x, tile.y)) return;
    Player.moveTo(tile.x, tile.y);
  }

  function enemyAt(tx, ty) {
    var a = World.curArea();
    var best = null, bd = 0.9;
    for (var i = 0; i < a.enemies.length; i++) {
      var en = a.enemies[i];
      if (en.dead) continue;
      var d = Util.dist(tx + 0.5, ty + 0.5, en.x, en.y);
      if (d < bd) { bd = d; best = en; }
    }
    return best;
  }

  function openDoor(door) {
    if (door.locked) {
      UI.toast('The door is locked.');
      Audio.sfx('deny');
      return;
    }
    if (door.sealed) {
      UI.toast('Sealed by a dark power...');
      Audio.sfx('deny');
      return;
    }
    door.open = true;
    World.curArea().visDirty = true;
    Audio.sfx('door');
    UI.toast(door.exterior ? 'The door swings open \u2014 daylight spills in.' : 'The door creaks open.');
  }

  function openChest(chest) {
    if (chest.open) { UI.toast('It is already open.'); return; }
    chest.open = true;
    var a = World.curArea();
    var entries = Items.rollChest(chest, a);
    Items.dropLoot(a, chest.x, chest.y, entries);
    Audio.sfx('chest');
    UI.toast('You pry open the chest.');
    Render.addText(chest.x + 0.5, chest.y - 0.4, 'Loot!', '#ffd54d');
  }

  function touchAltar() {
    var a = World.curArea();
    if (!a.altar) return;
    if (a.altar.locked) {
      UI.toast('A fell presence seals the censer to the altar.');
      Audio.sfx('deny');
      return;
    }
    if (a.altar.taken) {
      UI.toast('Only a scorch mark remains on the stone.');
      return;
    }
    var it = Items.make('quest_censer');
    if (!Items.addToInv(it, 1)) {
      UI.toast('Your pack is full \u2014 make room for the censer.');
      return;
    }
    a.altar.taken = true;
    Audio.sfx('reward');
    UI.toast('You lift the Sunstone Censer. It is warm in your hands.');
    Quests.onPickupItem('quest_censer');
    Game.autosave();
  }

  function pickupLoot(loot) {
    var a = World.curArea();
    if (loot.kind === 'gold') {
      Player.gold += loot.amount;
      Render.addText(loot.x, loot.y - 0.4, '+' + loot.amount + ' gold', '#ffd97a');
      Audio.sfx('gold');
    } else {
      if (!Items.addToInv(loot.item, 1)) {
        UI.toast('Your pack is full.');
        Audio.sfx('deny');
        return;
      }
      Render.addText(loot.x, loot.y - 0.4, loot.item.name, Items.qualityColor(loot.item.q));
      Audio.sfx('pickup');
      if (loot.item.type === 'quest') Quests.onPickupItem(loot.item.id);
    }
    World.removeLoot(a, loot.uid);
    UI.refreshPanels();
  }

  function aimWorld() {
    return Render.screenToWorld(mouseX, mouseY) || { x: Player.x, y: Player.y + 1 };
  }

  function hoverTile() {
    return tileAtScreen(mouseX, mouseY);
  }

  /* ---------- simulation hooks (used by tests) ---------- */
  function simDown(sx, sy) {
    mouseX = sx; mouseY = sy;
    if (UI.modalOpen()) { UI.closeTopModal(); return; }
    onDown(sx, sy);
  }
  function simUp() {
    dragging = false;
    lastDragTile = null;
  }
  function simKey(k) {
    onKey({ key: k, repeat: false, preventDefault: function () { } });
  }

  return {
    bind: bind,
    aimWorld: aimWorld,
    hoverTile: hoverTile,
    mouseX: function () { return mouseX; },
    mouseY: function () { return mouseY; },
    openDoor: openDoor, openChest: openChest, touchAltar: touchAltar,
    pickupLoot: pickupLoot,
    simDown: simDown, simUp: simUp, simKey: simKey
  };
})();
