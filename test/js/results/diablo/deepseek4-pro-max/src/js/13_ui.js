'use strict';
/* ============================================================
   Emberfall - 13_ui.js : HUD (orbs, abilities), panels
   (inventory, character, journal, automap, shop), dialogue,
   boss bar, menus, toasts
   ============================================================ */
var UI = (function () {

  var root = null;
  var open = { dialogue: false, shop: false, inventory: false, character: false, journal: false, automap: false, pause: false, title: false };
  var shopNpcId = null;
  var toasts = [];
  var tooltipEl = null, tooltipItem = null;
  var invEl = null, charEl = null, shopEl = null, journalEl = null, mapEl = null, diaEl = null;
  var trackerEl = null;
  var hpOrb, mpOrb, hpCtx, mpCtx;
  var abilityEls = {};
  var bossBarEl = null, bossNameEl = null, bossFillEl = null;
  var floorLabel = null, goldLabel = null, xpBarEl = null, lvlLabel = null;
  var potionEls = { potionH: null, potionM: null };
  var helpEl = null;
  var storyEl = null, pauseEl = null, titleEl = null;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function iconCanvas(kind, w, h) {
    var c = Util.makeCanvas(w || 34, h || 34);
    var g = c.getContext('2d');
    g.drawImage(SPR.icon(kind), 0, 0);
    return c;
  }
  function abiCanvas(name) {
    var c = Util.makeCanvas(40, 40);
    var g = c.getContext('2d');
    g.drawImage(SPR.abiIcon(name), 0, 0);
    return c;
  }

  /* ================= init ================= */
  function init(container) {
    root = container;

    /* --- bottom HUD --- */
    var hud = el('div', 'hud', root);
    var left = el('div', 'hud-left', hud);
    hpOrb = el('canvas', 'orb', left);
    hpOrb.width = 112; hpOrb.height = 112;
    hpCtx = hpOrb.getContext('2d');
    mpOrb = el('canvas', 'orb', left);
    mpOrb.width = 112; mpOrb.height = 112;
    mpCtx = mpOrb.getContext('2d');
    var mid = el('div', 'hud-mid', hud);
    var abiRow = el('div', 'abi-row', mid);
    var abis = [['firebolt', '1'], ['nova', '2'], ['heal', '3']];
    for (var i = 0; i < abis.length; i++) {
      (function (pair) {
        var slot = el('div', 'abi-slot', abiRow);
        slot.appendChild(abiCanvas(pair[0]));
        var key = el('div', 'abi-key', slot);
        key.textContent = pair[1];
        var cd = el('div', 'abi-cd', slot);
        slot.addEventListener('click', function () { Player.cast(pair[0]); });
        abilityEls[pair[0]] = { slot: slot, cd: cd };
      })(abis[i]);
    }
    var potRow = el('div', 'pot-row', mid);
    var pots = [['potionH', 'Q', 'potionH'], ['potionM', 'W', 'potionM']];
    for (var p = 0; p < pots.length; p++) {
      (function (pdef) {
        var slot = el('div', 'pot-slot', potRow);
        slot.appendChild(iconCanvas(pdef[2]));
        var key = el('div', 'abi-key', slot);
        key.textContent = pdef[1];
        var cnt = el('div', 'pot-count', slot);
        cnt.textContent = '0';
        slot.addEventListener('click', function () { Player.usePotionHot(pdef[0]); });
        potionEls[pdef[0]] = cnt;
      })(pots[p]);
    }
    var right = el('div', 'hud-right', hud);
    floorLabel = el('div', 'floor-label', right);
    floorLabel.textContent = 'Town of Thornhollow';
    var goldRow = el('div', 'gold-row', right);
    var goldIcon = el('canvas', null, goldRow);
    goldIcon.width = 24; goldIcon.height = 24;
    goldIcon.getContext('2d').drawImage(SPR.icon('gold'), 0, 0, 24, 24);
    goldLabel = el('div', 'gold-label', goldRow);
    goldLabel.textContent = '0';
    var xpWrap = el('div', 'xp-wrap', right);
    lvlLabel = el('div', 'lvl-label', xpWrap);
    lvlLabel.textContent = 'Lv 1';
    xpBarEl = el('div', 'xp-bar', xpWrap);

    /* --- quest tracker --- */
    trackerEl = el('div', 'quest-tracker', root);

    /* --- controls help --- */
    helpEl = el('div', 'controls-help', root);
    helpEl.innerHTML = '<b>Controls</b><br>LMB move / attack &middot; hold to steer<br>RMB sell (near merchant)<br>1-3 spells &middot; Q/W potions<br>I inventory &middot; J journal &middot; C character &middot; M map &middot; Esc menu';

    /* --- boss bar --- */
    var bossBar = el('div', 'boss-bar', root);
    bossNameEl = el('div', 'boss-name', bossBar);
    bossNameEl.textContent = '';
    bossFillEl = el('div', 'boss-fill', bossBar);
    bossBarEl = bossBar;
    bossBar.style.display = 'none';

    /* --- toasts --- */
    var toastWrap = el('div', 'toast-wrap', root);

    /* --- tooltip --- */
    tooltipEl = el('div', 'tooltip', root);
    tooltipEl.style.display = 'none';

    /* --- dialogue --- */
    diaEl = el('div', 'modal dialogue', root);
    diaEl.style.display = 'none';

    /* --- shop --- */
    shopEl = el('div', 'modal shop', root);
    shopEl.style.display = 'none';

    /* --- inventory --- */
    invEl = el('div', 'modal inventory', root);
    invEl.style.display = 'none';

    /* --- character --- */
    charEl = el('div', 'modal character', root);
    charEl.style.display = 'none';

    /* --- journal --- */
    journalEl = el('div', 'modal journal', root);
    journalEl.style.display = 'none';

    /* --- automap --- */
    mapEl = el('div', 'modal automap', root);
    mapEl.style.display = 'none';

    /* --- pause --- */
    pauseEl = el('div', 'modal pause', root);
    pauseEl.style.display = 'none';

    /* --- title --- */
    titleEl = el('div', 'title-screen', root);

    window.addEventListener('mousemove', function (e) {
      if (tooltipEl && tooltipEl.style.display !== 'none') {
        tooltipEl.style.left = Math.min(e.clientX + 16, window.innerWidth - 260) + 'px';
        tooltipEl.style.top = Math.min(e.clientY + 14, window.innerHeight - 140) + 'px';
      }
    });
    document.addEventListener('mousedown', function (e) {
      if (tooltipEl) { tooltipEl.style.display = 'none'; tooltipItem = null; }
    });
  }

  function toast(text) {
    if (!root) return;
    var t = el('div', 'toast', root.querySelector('.toast-wrap'));
    t.textContent = text;
    toasts.push(t);
    while (toasts.length > 4) {
      var old = toasts.shift();
      if (old.parentNode) old.parentNode.removeChild(old);
    }
    setTimeout(function () {
      if (t.parentNode) {
        t.style.opacity = '0';
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 500);
      }
    }, 3000);
  }

  /* ================= modal management ================= */
  function modalOpen() {
    return open.dialogue || open.shop || open.inventory || open.character || open.journal || open.automap || open.pause || open.title;
  }
  function closeAllModals() {
    open.dialogue = open.shop = open.inventory = open.character = open.journal = open.automap = false;
    applyModalState();
  }
  function closeTopModal() {
    if (open.dialogue) { closeDialogue(); return; }
    if (open.shop) { closeShop(); return; }
    if (open.automap) { open.automap = false; applyModalState(); return; }
    if (open.journal) { open.journal = false; applyModalState(); return; }
    if (open.character) { open.character = false; applyModalState(); return; }
    if (open.inventory) { open.inventory = false; applyModalState(); return; }
    if (open.pause) { closePause(); return; }
  }
  function applyModalState() {
    if (!invEl) return;
    invEl.style.display = open.inventory ? 'flex' : 'none';
    charEl.style.display = open.character ? 'flex' : 'none';
    journalEl.style.display = open.journal ? 'flex' : 'none';
    mapEl.style.display = open.automap ? 'flex' : 'none';
    shopEl.style.display = open.shop ? 'flex' : 'none';
    diaEl.style.display = open.dialogue ? 'flex' : 'none';
    pauseEl.style.display = open.pause ? 'flex' : 'none';
  }

  function togglePanel(name) {
    if (open.pause || open.title) return;
    if (open.dialogue) closeDialogue();
    if (open.shop && name !== 'inventory') closeShop();
    if (name === 'inventory') {
      open.inventory = !open.inventory;
      if (open.inventory) { open.character = open.journal = open.automap = false; }
    } else if (name === 'character') {
      open.character = !open.character;
      if (open.character) { open.inventory = false; open.journal = open.automap = false; }
    } else if (name === 'journal') {
      open.journal = !open.journal;
      if (open.journal) { open.character = open.inventory = open.automap = false; }
    } else if (name === 'automap') {
      open.automap = !open.automap;
      if (open.automap) { open.character = open.journal = open.inventory = false; }
    }
    applyModalState();
    refreshPanels();
  }

  /* ================= dialogue ================= */
  function openDialogue(npcId) {
    var talk = NPC.talk(npcId);
    if (!talk) return;
    open.dialogue = true;
    closeAllModalsExcept();
    open.dialogue = true;
    applyModalState();
    diaEl.innerHTML = '';
    var row = el('div', 'dia-row', diaEl);
    var port = el('canvas', 'dia-portrait', row);
    port.width = 108; port.height = 130;
    var pg = port.getContext('2d');
    var spr = SPR.actor(talk.npc.sprite);
    pg.drawImage(spr, 12, 26, spr.width, spr.height);
    var body = el('div', 'dia-body', row);
    var nameEl = el('div', 'dia-name', body);
    nameEl.textContent = talk.npc.name + ' \u2014 ' + talk.npc.role;
    var textEl = el('div', 'dia-text', body);
    textEl.textContent = talk.text;
    var btns = el('div', 'dia-buttons', body);
    for (var i = 0; i < talk.buttons.length; i++) {
      (function (b) {
        var btn = el('button', 'btn', btns);
        btn.textContent = b.label;
        btn.addEventListener('click', function () { b.fn(); });
      })(talk.buttons[i]);
    }
    Audio.sfx('click');
  }
  function closeDialogue() {
    open.dialogue = false;
    applyModalState();
  }
  function closeAllModalsExcept() {
    open.inventory = open.character = open.journal = open.automap = false;
    if (open.shop) { open.shop = false; }
  }

  /* ================= shop ================= */
  function openShop(npcId) {
    shopNpcId = npcId;
    var npc = NPC.get(npcId);
    open.shop = true;
    open.dialogue = false;
    applyModalState();
    renderShop();
  }
  function closeShop() {
    open.shop = false;
    shopNpcId = null;
    applyModalState();
  }
  function renderShop() {
    if (!shopEl) return;
    var npc = NPC.get(shopNpcId);
    if (!npc) return;
    shopEl.innerHTML = '';
    var head = el('div', 'shop-head', shopEl);
    head.textContent = npc.name + ' \u2014 ' + npc.role;
    var note = el('div', 'shop-note', shopEl);
    note.textContent = 'Left-click to buy. Right-click items in your inventory (I) to sell \u2014 while standing near the merchant.';
    var stock = el('div', 'shop-section', shopEl);
    el('div', 'shop-sub', stock).textContent = 'Wares';
    var grid = el('div', 'shop-grid', stock);
    var list = Items.SHOPS[npc.shop] || [];
    for (var i = 0; i < list.length; i++) {
      (function (baseId) {
        var it = Items.make(baseId);
        var cell = el('div', 'shop-cell', grid);
        cell.appendChild(iconCanvas(it.icon));
        var nm = el('div', 'shop-item-name', cell);
        nm.textContent = it.name;
        var pr = el('div', 'shop-item-price', cell);
        pr.textContent = it.value + 'g';
        cell.addEventListener('click', function () { NPC.buy(shopNpcId, baseId); });
        cell.addEventListener('mouseenter', function () { showTooltip(it, cell, 'Left-click to buy.'); });
        cell.addEventListener('mouseleave', hideTooltip);
      })(list[i]);
    }
    var bb = el('div', 'shop-section', shopEl);
    el('div', 'shop-sub', bb).textContent = 'Buyback (recently sold)';
    var bbg = el('div', 'shop-grid', bb);
    var bl = NPC.buybackList(npc.id);
    if (!bl.length) {
      el('div', 'shop-empty', bbg).textContent = 'Nothing here yet.';
    }
    for (var b = 0; b < bl.length; b++) {
      (function (idx) {
        var it2 = bl[idx];
        var cell2 = el('div', 'shop-cell', bbg);
        cell2.appendChild(iconCanvas(it2.icon));
        var nm2 = el('div', 'shop-item-name', cell2);
        nm2.textContent = it2.name;
        nm2.style.color = Items.qualityColor(it2.q);
        var pr2 = el('div', 'shop-item-price', cell2);
        pr2.textContent = Items.sellPrice(it2) + 'g';
        cell2.addEventListener('click', function () { NPC.buyBack(shopNpcId, idx); });
        cell2.addEventListener('mouseenter', function () { showTooltip(it2, cell2, 'Left-click to buy back.'); });
        cell2.addEventListener('mouseleave', hideTooltip);
      })(b);
    }
    var close = el('button', 'btn shop-close', shopEl);
    close.textContent = 'Close';
    close.addEventListener('click', closeShop);
  }

  /* ================= inventory / character ================= */
  function renderInventory() {
    if (!invEl) return;
    invEl.innerHTML = '';
    var head = el('div', 'panel-head', invEl);
    head.textContent = 'Inventory';
    var grid = el('div', 'inv-grid', invEl);
    for (var i = 0; i < Items.INV_SLOTS; i++) {
      var cell = el('div', 'inv-cell', grid);
      var st = Player.inventory[i];
      if (st) {
        cell.appendChild(iconCanvas(st.it.icon));
        if (st.qty > 1) {
          var q = el('div', 'inv-qty', cell);
          q.textContent = st.qty;
        }
        (function (idx) {
          cell.addEventListener('click', function () {
            if (idx >= Player.inventory.length) return;
            if (Items.isPotion(Player.inventory[idx].it)) {
              Player.potionCd = 0;
              Items.usePotion(Player.inventory[idx].it.type);
              Audio.sfx('potion');
            } else {
              Player.equipItem(idx);
            }
          });
          cell.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            if (idx >= Player.inventory.length) return;
            NPC.sellFromInventory(idx);
          });
          cell.addEventListener('mouseenter', function () {
            if (idx < Player.inventory.length) {
              showTooltip(Player.inventory[idx].it, cell, 'Left-click: equip / use\u00b7 Right-click near merchant: sell');
            }
          });
          cell.addEventListener('mouseleave', hideTooltip);
        })(i);
      }
    }
    var foot = el('div', 'panel-foot', invEl);
    foot.textContent = 'Gold: ' + Util.fmtSep(Player.gold);
  }
  function renderCharacter() {
    if (!charEl) return;
    charEl.innerHTML = '';
    el('div', 'panel-head', charEl).textContent = 'Character';
    var cols = el('div', 'char-cols', charEl);
    var left = el('div', 'char-left', cols);
    var stats = [
      ['Level', String(Player.level)],
      ['Experience', Player.xp + ' / ' + CFG.xpNeeded(Player.level)],
      ['Damage', String(Player.dmg())],
      ['Armor', String(Player.armor())],
      ['Health', Player.hp + ' / ' + Player.maxHp],
      ['Mana', Math.floor(Player.mp) + ' / ' + Player.maxMp],
      ['Gold', Util.fmtSep(Player.gold)]
    ];
    for (var i = 0; i < stats.length; i++) {
      var rowEl = el('div', 'stat-row', left);
      el('span', 'stat-key', rowEl).textContent = stats[i][0];
      el('span', 'stat-val', rowEl).textContent = stats[i][1];
    }
    var right = el('div', 'char-right', cols);
    var slots = [
      ['weapon', 'Weapon'], ['armor', 'Armor'], ['helm', 'Helm'], ['shield', 'Shield'], ['amulet', 'Amulet'], ['ring', 'Ring']
    ];
    for (var s = 0; s < slots.length; s++) {
      (function (pair) {
        var slot = pair[0];
        var rowEl2 = el('div', 'equip-row', right);
        var lab = el('div', 'equip-label', rowEl2);
        lab.textContent = pair[1];
        var it = Player.equip[slot];
        if (it) {
          rowEl2.appendChild(iconCanvas(it.icon, 28, 28));
          var nm = el('div', 'equip-name', rowEl2);
          nm.textContent = it.name;
          nm.style.color = Items.qualityColor(it.q);
          rowEl2.addEventListener('click', function () { Player.unequip(slot); });
          rowEl2.addEventListener('mouseenter', function () { showTooltip(it, rowEl2, 'Left-click to remove.'); });
          rowEl2.addEventListener('mouseleave', hideTooltip);
        } else {
          var nm2 = el('div', 'equip-name empty', rowEl2);
          nm2.textContent = '\u2014';
        }
      })(slots[s]);
    }
  }

  /* ================= journal ================= */
  function renderJournal() {
    if (!journalEl) return;
    journalEl.innerHTML = '';
    el('div', 'panel-head', journalEl).textContent = 'Quest Journal';
    var list = Quests.list();
    var active = [], done = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].st.state === 'completed') done.push(list[i]);
      else active.push(list[i]);
    }
    var actWrap = el('div', 'journal-scroll', journalEl);
    if (!active.length) el('div', 'journal-empty', actWrap).textContent = 'No active quests. Speak with the townsfolk.';
    for (var a = 0; a < active.length; a++) {
      var card = el('div', 'quest-card' + (active[a].st.state === 'ready' ? ' ready' : ''), actWrap);
      var title = el('div', 'quest-title', card);
      title.textContent = active[a].def.title;
      if (active[a].st.state === 'ready') {
        var badge = el('span', 'quest-badge', title);
        badge.textContent = 'READY TO TURN IN';
      }
      el('div', 'quest-desc', card).textContent = active[a].def.desc;
      el('div', 'quest-obj', card).textContent = Quests.progressText(active[a].def.id);
      el('div', 'quest-reward', card).textContent = Quests.rewardText(active[a].def.id);
    }
    if (done.length) {
      el('div', 'journal-sub', actWrap).textContent = '\u2014 Completed \u2014';
      for (var d2 = 0; d2 < done.length; d2++) {
        var card2 = el('div', 'quest-card done', actWrap);
        var title2 = el('div', 'quest-title', card2);
        title2.textContent = done[d2].def.title;
        el('div', 'quest-desc', card2).textContent = done[d2].def.desc;
      }
    }
  }

  /* ================= automap ================= */
  function renderAutomap() {
    if (!mapEl) return;
    mapEl.innerHTML = '';
    var a = World.curArea();
    el('div', 'panel-head', mapEl).textContent = 'Automap \u2014 ' + a.name;
    var cv = el('canvas', 'map-canvas', mapEl);
    var scale = 6;
    cv.width = a.w * scale + 12;
    cv.height = a.h * scale + 12;
    var g = cv.getContext('2d');
    g.fillStyle = '#05050a';
    g.fillRect(0, 0, cv.width, cv.height);
    for (var y = 0; y < a.h; y++) {
      for (var x = 0; x < a.w; x++) {
        var idx = y * a.w + x;
        if (!a.explored[idx]) continue;
        var v = a.grid[idx];
        g.fillStyle = v === CFG.T.WALL ? '#41454e' : (v === CFG.T.WATER ? '#26415c' : '#2a2d34');
        g.fillRect(6 + x * scale, 6 + y * scale, scale, scale);
      }
    }
    // transitions
    for (var tid in a.transitions) {
      var t = a.transitions[tid];
      if (!a.explored[t.y * a.w + t.x] && !(t.kind === 'door')) {
        var dd = World.doorAt(a, t.x, t.y);
        if (!dd) continue;
      }
      var px = 6 + t.x * scale + scale / 2, py = 6 + t.y * scale + scale / 2;
      if (t.kind === 'stairs') {
        g.fillStyle = '#d4a94a';
        g.beginPath();
        g.moveTo(px, py - 2.6);
        g.lineTo(px + 2.6, py + 2.6);
        g.lineTo(px - 2.6, py + 2.6);
        g.closePath();
        g.fill();
      } else if (t.kind === 'door') {
        g.fillStyle = '#e8e2d0';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      } else if (t.kind === 'cave') {
        g.fillStyle = '#8a5ad8';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      } else if (t.kind === 'gate') {
        g.fillStyle = '#7a8a5a';
        g.fillRect(px - 2.6, py - 2.6, 5.2, 5.2);
      }
    }
    // player
    var ppx = 6 + Player.x * scale, ppy = 6 + Player.y * scale;
    g.fillStyle = '#ffd54d';
    g.beginPath();
    g.arc(ppx, ppy, 3.4, 0, Math.PI * 2);
    g.fill();
    var legend = el('div', 'map-legend', mapEl);
    legend.innerHTML = '<span style="color:#d4a94a">\u25b2 stairs</span> <span style="color:#e8e2d0">\u25a0 door</span> <span style="color:#8a5ad8">\u25a0 cave</span> <span style="color:#7a8a5a">\u25a0 gate</span> <span style="color:#ffd54d">\u25cf you</span>';
    var close = el('button', 'btn', mapEl);
    close.textContent = 'Close';
    close.addEventListener('click', function () { open.automap = false; applyModalState(); });
  }

  /* ================= refresh ================= */
  function refreshPanels() {
    if (open.inventory) renderInventory();
    if (open.character) renderCharacter();
    if (open.journal) renderJournal();
    if (open.automap) renderAutomap();
    if (open.shop) renderShop();
    updateHudStatic();
    renderTracker();
  }

  function updateHudStatic() {
    if (!goldLabel) return;
    goldLabel.textContent = Util.fmtSep(Player.gold);
    lvlLabel.textContent = 'Lv ' + Player.level;
    xpBarEl.style.width = Math.round(100 * Player.xp / CFG.xpNeeded(Player.level)) + '%';
    potionEls.potionH.textContent = Items.countPotion('potionH');
    potionEls.potionM.textContent = Items.countPotion('potionM');
  }

  function renderTracker() {
    if (!trackerEl) return;
    trackerEl.innerHTML = '';
    var list = Quests.list();
    for (var i = 0; i < list.length; i++) {
      var st = list[i].st;
      if (st.state === 'completed') continue;
      var line = el('div', 'tracker-line' + (st.state === 'ready' ? ' ready' : ''), trackerEl);
      line.textContent = (st.state === 'ready' ? '\u2605 ' : '') + list[i].def.title + ' \u2014 ' +
        Quests.progressText(list[i].def.id).replace('Objective: ', '');
    }
  }

  function questPulse(id) {
    if (!trackerEl) return;
    var lines = trackerEl.querySelectorAll('.tracker-line');
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].textContent.indexOf(Quests.DEFS[id] ? Quests.DEFS[id].title : '') === 0) {
        lines[i].style.color = '#ffd54d';
        setTimeout(function (n) {
          return function () { if (n.parentNode) n.style.color = ''; };
        }(lines[i]), 400);
      }
    }
  }

  /* ================= tooltip ================= */
  function showTooltip(it, anchor, hint) {
    if (!tooltipEl) return;
    tooltipItem = it;
    var html = '<div class="tt-name" style="color:' + Items.qualityColor(it.q) + '">' + it.name + '</div>';
    var lines = [];
    var typeNames = {
      weapon: 'One-handed weapon', armor: 'Chest armor', helm: 'Helm', shield: 'Shield',
      amulet: 'Amulet', ring: 'Ring', potionH: 'Health potion', potionM: 'Mana potion',
      quest: 'Quest item', valuable: 'Valuable'
    };
    lines.push(typeNames[it.type] || it.type);
    if (it.dmg) lines.push('Damage: +' + it.dmg);
    if (it.armor) lines.push('Armor: +' + it.armor);
    if (it.hp) lines.push('Health: +' + it.hp);
    if (it.mp) lines.push('Mana: +' + it.mp);
    if (it.heal) lines.push(it.type === 'potionH' ? 'Restores ' + it.heal + ' health' : 'Restores ' + it.heal + ' mana');
    lines.push('Value: ' + it.value + ' gold');
    if (it.lvl > 1) lines.push('Requires level ' + it.lvl);
    if (hint) lines.push(hint);
    html += '<div class="tt-line">' + lines.join('</div><div class="tt-line">') + '</div>';
    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    var r = anchor.getBoundingClientRect();
    tooltipEl.style.left = Math.min(r.right + 10, window.innerWidth - 250) + 'px';
    tooltipEl.style.top = Math.min(r.top, window.innerHeight - 150) + 'px';
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
    tooltipItem = null;
  }

  /* ================= boss bar ================= */
  var bossVisible = false;
  function bossBarShow(name, hp, max) {
    bossVisible = true;
    if (!bossBarEl) return;
    bossNameEl.textContent = name;
    bossBarEl.style.display = 'block';
    bossBarUpdate(hp, max);
  }
  function bossBarUpdate(hp, max) {
    if (!bossBarEl || bossBarEl.style.display === 'none') return;
    bossFillEl.style.width = Math.max(0, Math.round(100 * hp / max)) + '%';
  }
  function bossBarHide() {
    bossVisible = false;
    if (!bossBarEl) return;
    bossBarEl.style.display = 'none';
  }

  /* ================= orbs ================= */
  function drawOrb(g, ratio, main, deep, glowC, t) {
    var cx = 56, cy = 56, R = 47;
    g.clearRect(0, 0, 112, 112);
    // outer metal ring
    var rg = g.createRadialGradient(cx, cy, R - 10, cx, cy, R + 3);
    rg.addColorStop(0, '#2a2c33');
    rg.addColorStop(0.7, '#121317');
    rg.addColorStop(1, '#3d4048');
    g.fillStyle = rg;
    g.beginPath();
    g.arc(cx, cy, R + 3, 0, Math.PI * 2);
    g.fill();
    // vessel interior
    g.fillStyle = 'rgba(8,10,16,0.92)';
    g.beginPath();
    g.arc(cx, cy, R - 4, 0, Math.PI * 2);
    g.fill();
    // liquid
    if (ratio > 0.005) {
      g.save();
      g.beginPath();
      g.arc(cx, cy, R - 6, 0, Math.PI * 2);
      g.clip();
      var topY = cy + (R - 6) - ratio * (2 * (R - 6));
      var lg = g.createLinearGradient(0, topY, 0, cy + R);
      lg.addColorStop(0, main);
      lg.addColorStop(1, deep);
      g.fillStyle = lg;
      g.beginPath();
      g.moveTo(cx - (R - 6), topY + 2);
      for (var x = -1; x <= 1.05; x += 0.05) {
        var wx = cx + x * (R - 6);
        var wave = Math.sin(x * 4.2 + t * 2.1) * 1.6 + Math.sin(x * 9 + t * 3.3) * 0.7;
        g.lineTo(wx, topY + wave);
      }
      g.lineTo(cx + (R - 6), cy + R);
      g.lineTo(cx - (R - 6), cy + R);
      g.closePath();
      g.fill();
      // surface highlight line
      g.strokeStyle = 'rgba(255,255,255,0.28)';
      g.lineWidth = 1.2;
      g.beginPath();
      for (var x2 = -1; x2 <= 1.05; x2 += 0.05) {
        var wx2 = cx + x2 * (R - 6);
        var wave2 = Math.sin(x2 * 4.2 + t * 2.1) * 1.6 + Math.sin(x2 * 9 + t * 3.3) * 0.7;
        if (x2 === -1) g.moveTo(wx2, topY + wave2);
        else g.lineTo(wx2, topY + wave2);
      }
      g.stroke();
      // bubbles
      for (var b = 0; b < 4; b++) {
        var bp = ((t * 0.35 + b * 0.31) % 1);
        var by = cy + (R - 10) - bp * (2 * (R - 10)) + (topY - cy);
        var bx2 = cx + Math.sin(b * 2.7 + t * 1.2) * (R - 14);
        if (by > topY + 3) {
          g.fillStyle = 'rgba(255,255,255,0.25)';
          g.beginPath();
          g.arc(bx2, by, 1.6 + b % 2, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
    }
    // glass shading: inner top shadow + rim light
    var ig = g.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, R);
    ig.addColorStop(0, 'rgba(255,255,255,0.10)');
    ig.addColorStop(0.4, 'rgba(255,255,255,0)');
    ig.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = ig;
    g.beginPath();
    g.arc(cx, cy, R - 4, 0, Math.PI * 2);
    g.fill();
    // top-left specular arc
    g.strokeStyle = 'rgba(255,255,255,0.5)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.arc(cx, cy, R - 9, Math.PI * 1.05, Math.PI * 1.45);
    g.stroke();
    // small dot
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.beginPath();
    g.arc(cx - R * 0.55, cy - R * 0.62, 2.4, 0, Math.PI * 2);
    g.fill();
    // glow behind orb
    if (ratio > 0.05) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.35;
      var grd = g.createRadialGradient(cx, cy, R * 0.5, cx, cy, R + 4);
      grd.addColorStop(0, glowC);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(cx, cy, R + 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }

  /* ================= per-frame update ================= */
  function update(dt, t) {
    if (!root) return;
    drawOrb(hpCtx, Util.clamp(Player.hp / Player.maxHp, 0, 1), '#c83a2a', '#5e1410', 'rgba(255,60,40,0.7)', t);
    drawOrb(mpCtx, Util.clamp(Player.mp / Player.maxMp, 0, 1), '#2a62c8', '#0e2054', 'rgba(60,110,255,0.7)', t);
    // ability cooldowns
    for (var id in abilityEls) {
      var def = CFG.ABILITIES[id];
      var frac = Player.abilityCd[id] / def.cd;
      abilityEls[id].cd.style.height = Math.round(frac * 40) + 'px';
      abilityEls[id].slot.style.opacity = (Player.mp < def.mana) ? '0.55' : '1';
    }
    // shop proximity
    if (open.shop && shopNpcId) {
      var def2 = NPC.get(shopNpcId);
      var near = NPC.nearMerchant(Player.x, Player.y);
      if (!near || near.id !== shopNpcId) {
        closeShop();
        toast('You have wandered too far from the merchant.');
      }
    }
    // ability key hints + hp text
    updateHudStatic();
  }

  /* ================= title / pause ================= */
  function showTitle() {
    open.title = true;
    if (!titleEl) return;
    titleEl.style.display = 'flex';
    titleEl.innerHTML = '';
    var inner = el('div', 'title-inner', titleEl);
    el('div', 'title-game', inner).textContent = 'EMBERFALL';
    el('div', 'title-sub', inner).textContent = 'a gothic action RPG';
    var story = el('div', 'title-story', inner);
    story.innerHTML = 'The cathedral bell of Thornhollow has been silent for forty years, and the dead beneath it have grown restless. ' +
      'Something stirs in the catacombs below the old choir \u2014 and it is waking the wilderness around the town.' +
      '<br><br>The townsfolk need a blade, a light, and someone foolish enough to carry both into the dark.';
    var nb = el('button', 'btn big', inner);
    nb.textContent = 'New Game';
    nb.addEventListener('click', function () {
      open.title = false;
      titleEl.style.display = 'none';
      Game.newGame();
    });
    if (Game.hasSave()) {
      var cb = el('button', 'btn big', inner);
      cb.textContent = 'Continue';
      cb.addEventListener('click', function () {
        open.title = false;
        titleEl.style.display = 'none';
        Game.continueGame();
      });
    }
    var sb = el('button', 'btn', inner);
    sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    sb.addEventListener('click', function () {
      Audio.toggle();
      sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    });
  }

  function togglePause() {
    if (open.title) return;
    if (open.pause) {
      closePause();
      return;
    }
    open.pause = true;
    applyModalState();
    if (!pauseEl) return;
    pauseEl.innerHTML = '';
    var inner = el('div', 'pause-inner', pauseEl);
    el('div', 'pause-title', inner).textContent = 'Paused';
    var mk = function (label, fn) {
      var b = el('button', 'btn big', inner);
      b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    };
    mk('Resume', closePause);
    mk('Save Game', function () { Game.save(); toast('Game saved.'); });
    mk('Load Game', function () { if (Game.load()) { closePause(); toast('Game loaded.'); } else toast('No save found.'); });
    mk('New Game', function () { closePause(); Game.newGame(); });
    var sb = mk('Sound: ' + (Audio.enabled() ? 'On' : 'Off'), function () {
      Audio.toggle();
      sb.textContent = 'Sound: ' + (Audio.enabled() ? 'On' : 'Off');
    });
  }
  function closePause() {
    open.pause = false;
    applyModalState();
  }

  function onAreaEnter(a) {
    if (floorLabel) floorLabel.textContent = a.name;
  }

  return {
    init: init,
    modalOpen: modalOpen, closeTopModal: closeTopModal, closeAllModals: closeAllModals,
    togglePanel: togglePanel, openDialogue: openDialogue, closeDialogue: closeDialogue,
    openShop: openShop, closeShop: closeShop,
    togglePause: togglePause, closePause: closePause,
    toast: toast, refreshPanels: refreshPanels,
    bossBarShow: bossBarShow, bossBarUpdate: bossBarUpdate, bossBarHide: bossBarHide,
    bossVisible: function () { return bossVisible; },
    onAreaEnter: onAreaEnter, update: update,
    showTitle: showTitle,
    renderTracker: renderTracker, questPulse: questPulse,
    open: open
  };
})();
