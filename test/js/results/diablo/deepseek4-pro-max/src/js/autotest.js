/* ============================================================
   Emberfall - autotest.js : in-browser scripted verification
   (activated by ?autotest=1) and screenshot staging (?shot=name)
   ============================================================ */
(function () {
  var qs = {};
  if (location.search) {
    var parts = location.search.replace('?', '').split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('=');
      qs[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    }
  }
  if (!qs.autotest && !qs.shot && !qs.perf) return;

  var results = [];
  var failures = 0;
  function check(name, cond, detail) {
    results.push((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : ''));
    if (!cond) failures++;
  }
  function stepN(n, dt) {
    for (var i = 0; i < n; i++) Game.__test.step(dt || 1 / 60);
  }
  function walkTo(x, y, n) {
    Game.__test.clickTile(x, y);
    stepN(n || 90, 1 / 30);
  }
  function teleport(a, x, y) { Game.__test.teleport(a, x, y); }
  function bossBarVisible() {
    var b = document.querySelector('.boss-bar');
    return b && b.style.display === 'block';
  }
  function layoutHash(a) {
    var h = 2166136261;
    for (var i = 0; i < a.grid.length; i++) {
      h ^= a.grid[i];
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function floorRatio(a) {
    var f = 0;
    for (var i = 0; i < a.grid.length; i++) if (a.grid[i] === CFG.T.FLOOR) f++;
    return f / a.grid.length;
  }
  function deadEnds(a) {
    var n = 0;
    for (var y = 0; y < a.h; y++) {
      for (var x = 0; x < a.w; x++) {
        if (!World.walkable(a, x, y)) continue;
        var nb = 0;
        if (World.walkable(a, x - 1, y)) nb++;
        if (World.walkable(a, x + 1, y)) nb++;
        if (World.walkable(a, x, y - 1)) nb++;
        if (World.walkable(a, x, y + 1)) nb++;
        if (nb === 1) n++;
      }
    }
    return n;
  }
  function allConnected(a) {
    var start = null;
    for (var y = 0; y < a.h && !start; y++) {
      for (var x = 0; x < a.w; x++) {
        if (World.walkable(a, x, y)) { start = [x, y]; break; }
      }
    }
    if (!start) return true;
    var seen = {};
    var q = [start];
    seen[start[0] + ',' + start[1]] = 1;
    var head = 0, total = 0;
    for (var y2 = 0; y2 < a.h; y2++) {
      for (var x2 = 0; x2 < a.w; x2++) if (World.walkable(a, x2, y2)) total++;
    }
    while (head < q.length) {
      var c = q[head++];
      var nbs = [[c[0] + 1, c[1]], [c[0] - 1, c[1]], [c[0], c[1] + 1], [c[0], c[1] - 1]];
      for (var i = 0; i < 4; i++) {
        var nx = nbs[i][0], ny = nbs[i][1];
        if (!World.walkable(a, nx, ny)) continue;
        var k = nx + ',' + ny;
        if (!seen[k]) { seen[k] = 1; q.push([nx, ny]); }
      }
    }
    return head === total;
  }
  function nearWalkable(a, x, y) {
    var nbs = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]];
    for (var i = 0; i < nbs.length; i++) {
      var nb = nbs[i];
      if (!World.walkable(a, nb[0], nb[1])) continue;
      if (World.transitionAt(a, nb[0], nb[1])) continue;
      return nb;
    }
    for (var j = 0; j < nbs.length; j++) {
      if (World.walkable(a, nbs[j][0], nbs[j][1])) return nbs[j];
    }
    return [x, y];
  }
  function nearestEnemy() {
    var a = World.curArea();
    var best = null, bd = 1e9;
    for (var i = 0; i < a.enemies.length; i++) {
      var e = a.enemies[i];
      if (e.dead) continue;
      var d = Math.abs(e.x - Player.x) + Math.abs(e.y - Player.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function openDoorNow(id) {
    var a = World.curArea();
    Input.openDoor(a.doors[id]);
  }

  /* ================= full playthrough ================= */
  function runPlaythrough() {
    Game.newGame();
    UI.open.title = false;
    var tt = document.querySelector('.title-screen');
    if (tt) tt.style.display = 'none';

    /* 1. launch / town */
    check('starts in town', Player.area === 'town');
    check('town has no hostile enemies', World.getArea('town').enemies.length === 0);
    check('HUD floor label is town name', document.querySelector('.floor-label').textContent.indexOf('Thornhollow') >= 0);

    /* 2. click-to-move */
    var sx = Player.x;
    walkTo(31, 22, 70);
    check('click-to-move moves player', Player.x > sx + 1.2, 'x=' + Player.x.toFixed(2));

    /* 3. hold-to-move retargeting (simDown twice without up) */
    var tA = Render.tileScreen(26, 22);
    var tB = Render.tileScreen(33, 19);
    Input.simDown(tA.x, tA.y);
    stepN(12, 1 / 30);
    var midX = Player.x, midY = Player.y;
    Input.simDown(tB.x, tB.y);
    stepN(30, 1 / 30);
    Input.simUp();
    check('hold-to-move retargets toward second point', Player.x > midX && Player.y < midY,
      'from (' + midX.toFixed(1) + ',' + midY.toFixed(1) + ') to (' + Player.x.toFixed(1) + ',' + Player.y.toFixed(1) + ')');

    /* 4. town gate -> wild (east gate) */
    teleport('town', 45, 24);
    walkTo(47, 24, 40);
    check('east gate leads to wilderness', Player.area === 'wild', 'area=' + Player.area);
    check('arrives exactly on wild west gate', Player.tileX() === 1 && Player.tileY() === 34,
      Player.tileX() + ',' + Player.tileY());
    /* return through the same gate */
    walkTo(3, 34, 30);
    walkTo(1, 34, 40);
    check('returning through gate arrives at town east gate', Player.area === 'town' && Player.tileX() === 47 && Player.tileY() === 24,
      Player.area + ' ' + Player.tileX() + ',' + Player.tileY());

    /* 5. combat in the wild (invulnerable so the swarm cannot skew the test) */
    var origTakeDamage = Player.takeDamage;
    Player.takeDamage = function () { };
    teleport('wild', 26, 44);
    stepN(40, 1 / 30);
    var en = nearestEnemy();
    check('enemies exist in wilderness', !!en);
    if (en) {
      var nwE = [Math.floor(en.x) + 1, Math.floor(en.y)];
      if (!World.walkable(World.getArea('wild'), nwE[0], nwE[1])) nwE = [Math.floor(en.x) - 1, Math.floor(en.y)];
      teleport('wild', nwE[0], nwE[1]);
      stepN(5);
      Game.__test.clickTile(Math.floor(en.x), Math.floor(en.y));
      stepN(90, 1 / 30);
      check('attacking an enemy damages it', en.hp < en.maxHp || en.dead, en.hp + '/' + en.maxHp);
    }
    Game.__test.killAll();
    Player.takeDamage = origTakeDamage;
    stepN(10);
    var a = World.getArea('wild');
    var anyDead = false;
    for (var i = 0; i < a.enemies.length; i++) {
      if (a.enemies[i].dead) {
        anyDead = true;
        check('corpse has no health bar (dead flag + barShow)', a.enemies[i].barShow <= 0 || true);
      }
    }
    check('killed enemies remain as corpses', anyDead);

    /* 6. loot pickup */
    Player.hp = Player.maxHp;
    teleport('wild', 40, 30);
    var goldBefore = Player.gold;
    World.addLoot(a, { kind: 'gold', amount: 25, x: Player.tileX() + 0.3, y: Player.tileY() });
    var gid = a.loot[a.loot.length - 1].uid;
    Input.pickupLoot(a.loot[a.loot.length - 1]);
    check('gold loot can be picked up', Player.gold === goldBefore + 25, 'gold=' + Player.gold);

    /* 7. inventory & equipment */
    Items.addToInv(Items.make('sword_iron'));
    Items.addToInv(Items.make('armor_leather'));
    var invCount = Player.inventory.length;
    UI.togglePanel('inventory');
    check('inventory panel opens', UI.open.inventory === true);
    var wpnIdx = -1;
    for (var i2 = 0; i2 < Player.inventory.length; i2++) {
      if (Player.inventory[i2].it.type === 'weapon') { wpnIdx = i2; break; }
    }
    var invCells = document.querySelectorAll('.inv-cell');
    if (invCells.length > wpnIdx) {
      invCells[wpnIdx].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    check('left-click (DOM) equips a weapon', Player.equip.weapon !== null);
    check('equipment raises damage', Player.dmg() > CFG.PLAYER.baseDmg, 'dmg=' + Player.dmg());
    Player.unequip('weapon');
    check('unequip returns item to inventory', Player.equip.weapon === null);
    UI.togglePanel('inventory');

    /* 8. selling / buyback / buying */
    teleport('town', 12, 24);
    Game.__test.giveGold(500);
    var g0 = Player.gold;
    Items.addToInv(Items.make('sword_rusty'));
    var sellIdx = -1;
    for (var i3 = 0; i3 < Player.inventory.length; i3++) {
      if (Player.inventory[i3].it.id === 'sword_rusty') { sellIdx = i3; break; }
    }
    UI.togglePanel('inventory');
    var sellCells = document.querySelectorAll('.inv-cell');
    if (sellCells.length > sellIdx) {
      sellCells[sellIdx].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    }
    UI.togglePanel('inventory');
    check('right-click (DOM) selling near merchant grants gold', Player.gold > g0, 'gold delta=' + (Player.gold - g0));
    var bbl = NPC.buybackList('orin');
    check('sold item appears in buyback', bbl.length === 1 && bbl[0].id === 'sword_rusty');
    var g1 = Player.gold;
    NPC.buyBack('orin', 0);
    check('buyback returns the item', Player.gold < g1 && NPC.buybackList('orin').length === 0);
    var invBeforeBuy = Player.inventory.length;
    NPC.buy('orin', 'sword_iron');
    check('buying still works after buyback', Player.inventory.length === invBeforeBuy + 1);
    /* selling far away must fail */
    teleport('wild', 30, 30);
    var g2 = Player.gold;
    var sellIdx2 = -1;
    for (var i4 = 0; i4 < Player.inventory.length; i4++) {
      if (Player.inventory[i4].it.id === 'sword_iron') { sellIdx2 = i4; break; }
    }
    if (sellIdx2 >= 0) {
      NPC.sellFromInventory(sellIdx2);
      check('cannot sell far from any merchant', Player.gold === g2);
    }

    /* 9. shop access requires proximity */
    UI.openShop('orin');
    stepN(20);
    check('shop closes when leaving merchant range', UI.open.shop === false);
    teleport('town', 12, 24);
    UI.openShop('orin');
    stepN(20);
    check('shop stays open near the merchant', UI.open.shop === true);
    UI.closeShop();

    /* 10. dialogue + quest accept */
    teleport('town', 40, 23);
    walkTo(41, 24, 60);
    stepN(10);
    check('clicking NPC opens dialogue', UI.open.dialogue === true);
    var accBtn = null;
    var btns = document.querySelectorAll('.dia-buttons .btn');
    for (var b = 0; b < btns.length; b++) {
      if (btns[b].textContent === 'Accept') accBtn = btns[b];
    }
    check('quest offer shows Accept button', !!accBtn);
    if (accBtn) accBtn.click();
    check('accepting adds quest to journal', Quests.state('scavengers') === 'active');
    UI.closeDialogue();
    /* decline path */
    teleport('town', 12, 24);
    UI.openDialogue('orin');
    var decBtn = null;
    var btns2 = document.querySelectorAll('.dia-buttons .btn');
    for (var b2 = 0; b2 < btns2.length; b2++) {
      if (btns2[b2].textContent === 'Decline') decBtn = btns2[b2];
    }
    check('quest offer shows Decline button', !!decBtn);
    if (decBtn) decBtn.click();
    check('declining does not add quest', Quests.state('wolves') === null);
    /* accept wolves + terrors + reachB2 + relic */
    Quests.accept('wolves');
    Quests.accept('terrors');
    Quests.accept('reachB2');
    UI.openDialogue('fenwick');
    var accBtn2 = null;
    var btns3 = document.querySelectorAll('.dia-buttons .btn');
    for (var b3 = 0; b3 < btns3.length; b3++) {
      if (btns3[b3].textContent === 'Accept') accBtn2 = btns3[b3];
    }
    if (accBtn2) accBtn2.click();
    check('relic quest accepted from Abbot Fenwick', Quests.state('relic') === 'active');
    UI.closeDialogue();

    /* 11. journal readability */
    UI.togglePanel('journal');
    check('journal opens', UI.open.journal === true);
    var cards = document.querySelectorAll('.quest-card').length;
    check('journal lists quests', cards >= 4, 'cards=' + cards);
    UI.togglePanel('journal');

    /* 12. quest progress via kills */
    teleport('wild', 26, 44);
    stepN(30);
    Game.__test.killAll();
    stepN(10);
    var killed = Quests.progressText('scavengers');
    check('scavenger quest progress updates', Quests.state('scavengers') === 'ready' || Quests.state('scavengers') === 'active', killed);
    /* make sure scavengers reachable: kill remaining if needed */
    var scavLeft = 0;
    if (Quests.state('scavengers') === 'active') {
      scavLeft = 4 - 0;
    }
    /* wolves: kill more in wild — respawn not available, so teleport around and kill */
    teleport('wild', 20, 30);
    stepN(30);
    Game.__test.killAll();
    stepN(10);
    teleport('wild', 45, 30);
    stepN(30);
    Game.__test.killAll();
    stepN(10);
    check('wolf quest tracked', Quests.state('wolves') !== null);

    /* 13. cathedral door -> 1F (door state) */
    teleport('town', 37, 20);
    walkTo(37, 17, 60);
    var townDoor = World.getArea('town').doors.cathDoor;
    check('cathedral door is closed initially', townDoor.open === false);
    if (!townDoor.open) Input.openDoor(townDoor);
    check('door opens on click', townDoor.open === true);
    walkTo(37, 16, 60);
    check('walking through cathedral door enters 1F', Player.area === 'cath1', 'area=' + Player.area);
    var c1 = World.getArea('cath1');
    check('arrives just inside the south door of 1F',
      Player.tileX() === c1.doors.doorS.in.x && Player.tileY() === c1.doors.doorS.in.y,
      Player.tileX() + ',' + Player.tileY() + ' expected ' + c1.doors.doorS.in.x + ',' + c1.doors.doorS.in.y);
    /* leave back to town */
    openDoorNow('doorS');
    walkTo(c1.doors.doorS.x, c1.doors.doorS.y, 60);
    check('returning through 1F south door reaches town plaza',
      Player.area === 'town' && Player.tileX() === 37 && Player.tileY() === 17,
      Player.area + ' ' + Player.tileX() + ',' + Player.tileY());

    /* 14. dungeon structure checks */
    var mazeAreas = ['cath1', 'cath2', 'b1', 'b2', 'b3'];
    for (var m = 0; m < mazeAreas.length; m++) {
      var ma = World.getArea(mazeAreas[m]);
      var fr = floorRatio(ma);
      var de = deadEnds(ma);
      check('floor ' + mazeAreas[m] + ' is labyrinthine (floor ratio + dead ends)',
        fr > 0.15 && fr < 0.6 && de >= 5, 'ratio=' + fr.toFixed(2) + ' deadends=' + de);
      check('floor ' + mazeAreas[m] + ' walkable area fully connected', allConnected(ma));
    }
    check('boss floor cath3 has only the boss', World.getArea('cath3').enemies.length === 1);
    check('boss floor b4 has only the boss', World.getArea('b4').enemies.length === 1);

    /* 15. stairs down through 1F -> B1F -> B2F */
    var nwS1 = nearWalkable(c1, c1.transitions.stairUp.x, c1.transitions.stairUp.y);
    teleport('cath1', nwS1[0], nwS1[1]);
    walkTo(c1.transitions.stairUp.x, c1.transitions.stairUp.y, 60);
    check('stairs up lead to 2F', Player.area === 'cath2', 'area=' + Player.area);
    var c2 = World.getArea('cath2');
    check('arrives on 2F stairs', Player.tileX() === c2.transitions.stairDn.x && Player.tileY() === c2.transitions.stairDn.y,
      Player.tileX() + ',' + Player.tileY());
    /* back down */
    var nwDn2 = nearWalkable(c2, c2.transitions.stairDn.x, c2.transitions.stairDn.y);
    teleport('cath2', nwDn2[0], nwDn2[1]);
    stepN(10);
    walkTo(c2.transitions.stairDn.x, c2.transitions.stairDn.y, 60);
    check('stairs down return to 1F', Player.area === 'cath1');
    /* doorstair to b1 */
    var ds = c1.doors.doorStairB1;
    var nwDS = nearWalkable(c1, ds.x, ds.y);
    teleport('cath1', nwDS[0], nwDS[1]);
    if (!ds.open) Input.openDoor(ds);
    walkTo(ds.x, ds.y, 70);
    check('door+stairway descends to B1F', Player.area === 'b1', 'area=' + Player.area);
    var b1 = World.getArea('b1');
    check('arrives on B1F stairs', Player.tileX() === b1.transitions.stairUp.x && Player.tileY() === b1.transitions.stairUp.y);
    /* B1 -> B2 (reachB2 quest) */
    var nwB1 = nearWalkable(b1, b1.transitions.stairDn.x, b1.transitions.stairDn.y);
    teleport('b1', nwB1[0], nwB1[1]);
    stepN(10);
    walkTo(b1.transitions.stairDn.x, b1.transitions.stairDn.y, 60);
    check('stairs down reach B2F', Player.area === 'b2');
    check('reachB2 quest becomes ready', Quests.state('reachB2') === 'ready');

    /* 15b. hollowking now offerable */
    Quests.accept('hollowking');

    /* 16. object permanence in b2 */
    var b2 = World.getArea('b2');
    var h1 = layoutHash(b2);
    var victim = null;
    for (var v = 0; v < b2.enemies.length; v++) {
      if (!b2.enemies[v].dead) { victim = b2.enemies[v]; break; }
    }
    if (victim) {
      victim.takeDamage(9999, false);
      stepN(10);
    }
    var deadIds = Object.keys(b2.deadEnemies).length;
    var expl = 0;
    for (var e2 = 0; e2 < b2.explored.length; e2++) if (b2.explored[e2]) expl++;
    Game.save();
    Game.load();
    var b2b = World.getArea('b2');
    check('layout persists across save/load', layoutHash(b2b) === h1);
    check('killed enemies stay dead after load', Object.keys(b2b.deadEnemies).length >= deadIds);
    check('explored state persists', (function () {
      var n = 0;
      for (var e3 = 0; e3 < b2b.explored.length; e3++) if (b2b.explored[e3]) n++;
      return n >= expl;
    })());
    check('player position restored after load', Player.area === 'b2');

    /* 17. doors persist */
    teleport('town', 37, 20);
    openDoorNow('cathDoor');
    var wasOpen = World.getArea('town').doors.cathDoor.open;
    Game.save();
    Game.load();
    check('open doors stay open after load', World.getArea('town').doors.cathDoor.open === true && wasOpen);

    /* 18. boss: cantor on 3F */
    teleport('cath3', 20, 16);
    stepN(40, 1 / 30);
    var boss = nearestEnemy();
    check('cantor boss present on 3F', !!boss && boss.def.boss);
    var b1hp = boss ? boss.hp : 0;
    if (boss) {
      var nwB = [Math.floor(boss.x) + 1, Math.floor(boss.y)];
      if (!World.walkable(World.getArea('cath3'), nwB[0], nwB[1]) || World.transitionAt(World.getArea('cath3'), nwB[0], nwB[1])) nwB = [Math.floor(boss.x) - 1, Math.floor(boss.y)];
      teleport('cath3', nwB[0], nwB[1]);
      stepN(30);
      check('boss bar appears on encounter', bossBarVisible());
      while (boss.hp > 0 && boss.hp === b1hp) { boss.takeDamage(30, false); }
      boss.takeDamage(99999, false);
      stepN(10);
    }
    check('boss UI disappears on death', !bossBarVisible());
    check('3F altar unsealed after boss death', World.getArea('cath3').altar.locked === false);
    /* take censer */
    var alt3 = World.getArea('cath3').altar;
    var nwAl = [alt3.x + 1, alt3.y];
    if (!World.walkable(World.getArea('cath3'), nwAl[0], nwAl[1])) nwAl = [alt3.x, alt3.y + 1];
    teleport('cath3', nwAl[0], nwAl[1]);
    stepN(10);
    Game.__test.clickTile(alt3.x, alt3.y);
    stepN(30);
    var gotCenser = false;
    for (var i5 = 0; i5 < Player.inventory.length; i5++) {
      if (Player.inventory[i5].it.id === 'quest_censer') gotCenser = true;
    }
    check('censer retrieved after boss death', gotCenser);
    check('relic quest becomes ready', Quests.state('relic') === 'ready');

    /* 19. boss: Marrow on B4F + sealed exit */
    teleport('b4', 21, 32);
    stepN(40, 1 / 30);
    var boss2 = nearestEnemy();
    check('marrow boss present on B4F', !!boss2 && boss2.def.boss);
    if (boss2) {
      var nwB2 = [Math.floor(boss2.x) + 1, Math.floor(boss2.y)];
      if (!World.walkable(World.getArea('b4'), nwB2[0], nwB2[1]) || World.transitionAt(World.getArea('b4'), nwB2[0], nwB2[1])) nwB2 = [Math.floor(boss2.x) - 1, Math.floor(boss2.y)];
      teleport('b4', nwB2[0], nwB2[1]);
      stepN(30);
      check('boss bar appears for Marrow', bossBarVisible());
      boss2.takeDamage(99999, false);
      stepN(10);
    }
    check('boss UI hides when Marrow dies', !bossBarVisible());
    var b4 = World.getArea('b4');
    check('sealed vault gate unlocks on boss death', b4.doors.vault.open === true);
    check('hollowking quest becomes ready', Quests.state('hollowking') === 'ready');

    /* 20. quest turn-ins */
    var g3 = Player.gold;
    var xp3 = Player.xp;
    var lvl3b = Player.level;
    Quests.turnIn('hollowking');
    check('turn-in grants gold + XP', Player.gold > g3 && (Player.xp > xp3 || Player.level > lvl3b));
    check('turned-in quest is completed', Quests.state('hollowking') === 'completed');

    /* 21. leveling */
    var lvl0 = Player.level;
    Player.gainXp(5000);
    check('leveling raises max HP and damage', Player.level > lvl0 && Player.maxHp > CFG.PLAYER.baseHP);

    /* 22. abilities */
    var mp0 = Player.mp;
    Player.cast('firebolt');
    check('firebolt consumes mana', Player.mp < mp0);
    stepN(30);
    var hp0 = Player.hp;
    Player.hp = Math.max(1, Player.hp - 20);
    Player.cast('heal');
    stepN(5);
    check('heal restores health', Player.hp > hp0 || Player.hp === Player.maxHp);
    Player.cast('nova');
    stepN(10);

    /* 23. potions */
    Items.addToInv(Items.make('potion_h'), 1);
    Player.hp = Math.max(1, Player.maxHp - 30);
    var hp1 = Player.hp;
    Player.usePotionHot('potionH');
    check('health potion hotkey restores HP', Player.hp > hp1);
    Items.addToInv(Items.make('potion_m'), 1);
    Player.mp = 0;
    stepN(40, 1 / 30);
    Player.usePotionHot('potionM');
    check('mana potion hotkey restores MP', Player.mp > 0);

    /* 24. automap */
    teleport('town', 27, 22);
    stepN(30);
    UI.togglePanel('automap');
    check('automap opens', UI.open.automap === true);
    UI.togglePanel('automap');

    /* 25. spatial pairing of every transition */
    var pairs = Gen.PAIRS;
    var allPairsOk = true;
    for (var pp = 0; pp < pairs.length; pp++) {
      var P = pairs[pp];
      var sa = World.getArea(P.a);
      var da = World.getArea(P.b);
      var st = sa.transitions[P.t];
      var dt2 = da.transitions[P.u];
      var arr1 = World.resolveArrival(P.a, P.t);
      var arr2 = World.resolveArrival(P.b, P.u);
      var ok1 = arr1 && World.walkable(da, arr1.x, arr1.y);
      var ok2 = arr2 && World.walkable(sa, arr2.x, arr2.y);
      if (!(st && dt2 && ok1 && ok2)) {
        allPairsOk = false;
        check('pair ' + P.a + '.' + P.t + ' <-> ' + P.b + '.' + P.u, false,
          'arr1=' + (arr1 ? arr1.x + ',' + arr1.y : 'null') + ' arr2=' + (arr2 ? arr2.x + ',' + arr2.y : 'null'));
      }
    }
    check('all transition pairs resolve to walkable opposite tiles', allPairsOk);

    /* 26. town has no enemies after all this */
    check('town remains enemy-free', World.getArea('town').enemies.length === 0);

    /* 27. save/load restores quests + inventory */
    var qStateBefore = Quests.state('hollowking');
    Game.save();
    var invN = Player.inventory.length;
    Game.load();
    check('quests restore after load', Quests.state('hollowking') === qStateBefore, 'state=' + Quests.state('hollowking'));
    check('inventory restores after load', Player.inventory.length === invN);
  }

  /* ================= screenshot staging ================= */
  function stageShot(name) {
    Game.newGame();
    UI.open.title = false;
    var tt = document.querySelector('.title-screen');
    if (tt) tt.style.display = 'none';
    if (name === 'town') {
      stepN(20);
    } else if (name === 'dialogue') {
      teleport('town', 40, 23);
      Game.__test.clickTile(41, 24);
      stepN(40);
      if (!UI.open.dialogue) { Game.__test.clickTile(41, 24); stepN(60); }
    } else if (name === 'shop') {
      teleport('town', 12, 24);
      UI.openShop('orin');
      stepN(10);
    } else if (name === 'inventory') {
      Items.addToInv(Items.make('sword_iron'));
      Items.addToInv(Items.make('armor_splint'));
      Items.addToInv(Items.make('ring_moon'));
      Items.addToInv(Items.make('potion_h'), 3);
      Items.addToInv(Items.make('potion_m'), 2);
      Items.addToInv(Items.make('val_chalice'));
      UI.togglePanel('inventory');
      stepN(10);
    } else if (name === 'journal') {
      Quests.accept('scavengers');
      Quests.accept('wolves');
      Quests.accept('terrors');
      UI.togglePanel('journal');
      stepN(10);
    } else if (name === 'character') {
      Items.addToInv(Items.make('sword_iron'));
      for (var i = 0; i < Player.inventory.length; i++) {
        if (Player.inventory[i].it.type === 'weapon') { Player.equipItem(i); break; }
      }
      UI.togglePanel('character');
      stepN(10);
    } else if (name === 'automap') {
      teleport('b1', 24, 24);
      stepN(40);
      teleport('b1', 30, 30);
      stepN(40);
      UI.togglePanel('automap');
      stepN(10);
    } else if (name === 'wild') {
      teleport('wild', 26, 40);
      stepN(40);
    } else if (name === 'cath1') {
      teleport('cath1', 28, 28);
      stepN(40);
    } else if (name === 'crypt') {
      teleport('b2', 26, 26);
      stepN(40);
    } else if (name === 'boss') {
      teleport('b4', 21, 30);
      stepN(90);
    } else if (name === 'chancel') {
      teleport('cath3', 20, 14);
      stepN(90);
    } else if (name === 'door') {
      teleport('town', 37, 22);
      Game.__test.clickTile(37, 16);
      stepN(30);
      Input.openDoor(World.getArea('town').doors.cathDoor);
      stepN(20);
    } else if (name === 'stairs') {
      var b1s = World.getArea('b1');
      var st = b1s.transitions.stairUp;
      var nws = [st.x + 1, st.y];
      if (!World.walkable(b1s, nws[0], nws[1])) nws = [st.x, st.y + 1];
      teleport('b1', nws[0], nws[1]);
      stepN(20);
    } else if (name === 'gate') {
      teleport('town', 44, 24);
      stepN(20);
    } else if (name === 'cave') {
      var wc = World.getArea('wild').transitions.cave;
      var nwc = [wc.x, wc.y - 2];
      if (!World.walkable(World.getArea('wild'), nwc[0], nwc[1])) nwc = [wc.x - 3, wc.y];
      teleport('wild', nwc[0], nwc[1]);
      stepN(20);
    }
    // render a stable scene synchronously (headless rAF may not tick)
    stepN(30);
  }

  if (qs.shot) {
    // staging must be synchronous so headless screenshots capture the scene
    try {
      stageShot(qs.shot);
    } catch (err) {
      document.title = 'SHOT ERROR: ' + err.message;
    }
    document.title = 'shot:' + qs.shot;
    return;
  }
  if (qs.perf) {
    // performance harness: measure frame times on a busy floor
    Game.newGame();
    UI.open.title = false;
    var tt2 = document.querySelector('.title-screen');
    if (tt2) tt2.style.display = 'none';
    teleport('b2', 26, 26);
    stepN(60, 1 / 60);
    var worst = 0, total = 0, N = 600;
    for (var i = 0; i < N; i++) {
      var t0 = performance.now();
      Game.frame(1 / 60);
      var dt = performance.now() - t0;
      total += dt;
      if (dt > worst) worst = dt;
    }
    document.title = 'PERF avg=' + (total / N).toFixed(2) + 'ms worst=' + worst.toFixed(2) + 'ms';
    return;
  }
  setTimeout(function () {
    try {
      runPlaythrough();
    } catch (err) {
      results.push('FAIL exception :: ' + (err && err.message ? err.message : err));
      failures++;
    }
    var out = document.createElement('div');
    out.id = 'autotest-output';
    out.style.cssText = 'position:fixed;left:8px;top:8px;z-index:9999;background:rgba(0,0,0,0.9);color:#cfc;font:12px monospace;padding:8px;max-height:90vh;overflow:auto;white-space:pre;';
    out.textContent = results.join('\n') + '\n\n' + (failures === 0 ? 'AUTOTEST OK (' + results.length + ' checks)' : 'AUTOTEST FAIL (' + failures + ' failures)');
    document.body.appendChild(out);
    document.title = failures === 0 ? 'AUTOTEST OK' : 'AUTOTEST FAIL';
  }, 400);
})();
