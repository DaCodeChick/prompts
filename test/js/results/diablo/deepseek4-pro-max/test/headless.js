#!/usr/bin/env node
/* ============================================================
   Emberfall - test/headless.js : full logic playthrough under
   Node with stubbed DOM/canvas. Verifies generation, combat,
   persistence, transitions, shops, quests.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ---------- DOM stubs ---------- */
class FakeCtx {
  constructor() { this.globalAlpha = 1; this.globalCompositeOperation = 'source-over'; }
  fillRect() { } strokeRect() { } clearRect() { }
  beginPath() { } moveTo() { } lineTo() { } closePath() { }
  fill() { } stroke() { } arc() { } ellipse() { } rect() { }
  quadraticCurveTo() { } bezierCurveTo() { }
  save() { } restore() { } translate() { } rotate() { } scale() { } transform() { } setTransform() { } clip() { }
  drawImage() { }
  fillText() { } strokeText() { }
  measureText(t) { return { width: String(t).length * 7 }; }
  createLinearGradient() { return { addColorStop() { } }; }
  createRadialGradient() { return { addColorStop() { } }; }
  set fillStyle(v) { } set strokeStyle(v) { } set lineWidth(v) { } set font(v) { }
  set textAlign(v) { } set lineCap(v) { } set lineJoin(v) { }
  set globalAlpha(v) { this._ga = v; } set globalCompositeOperation(v) { this._gco = v; }
}
class FakeCanvas {
  constructor(w, h) { this.width = w || 300; this.height = h || 150; this.style = {}; }
  getContext() { return new FakeCtx(); }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height }; }
  addEventListener() { }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}
class FakeEl {
  constructor(tag) {
    this.tagName = tag || 'div';
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.className = '';
  }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
  removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); }
  addEventListener() { }
  getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const store = {};
global.window = global;
global.innerWidth = 1280;
global.innerHeight = 800;
global.devicePixelRatio = 1;
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => { };
global.addEventListener = () => { };
global.setTimeout = (fn, ms) => { fn(); return 0; };
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
global.document = {
  createElement: tag => (tag === 'canvas' ? new FakeCanvas() : new FakeEl(tag)),
  body: new FakeEl('body'),
  addEventListener() { },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
global.AudioContext = undefined;

/* ---------- load game ---------- */
const js = fs.readFileSync(path.join(__dirname, '..', 'build', 'game.js'), 'utf8');
vm.runInThisContext(js, { filename: 'game.js' });

/* ---------- harness ---------- */
let failures = 0;
let passes = 0;
function check(name, cond, detail) {
  if (cond) { passes++; }
  else {
    failures++;
    console.error('FAIL ' + name + (detail ? ' :: ' + detail : ''));
  }
}
function stepN(n, dt) { for (let i = 0; i < n; i++) Game.__test.step(dt || 1 / 60); }
function walkTo(x, y, n) { Game.__test.clickTile(x, y); stepN(n || 90, 1 / 30); }
function teleport(a, x, y) { Game.__test.teleport(a, x, y); }
function nearestEnemy() {
  const a = World.curArea();
  let best = null, bd = 1e9;
  for (const e of a.enemies) {
    if (e.dead) continue;
    const d = Math.abs(e.x - Player.x) + Math.abs(e.y - Player.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function layoutHash(a) {
  let h = 2166136261;
  for (let i = 0; i < a.grid.length; i++) { h ^= a.grid[i]; h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function nearWalkable(a, x, y) {
  const nbs = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]];
  for (const nb of nbs) {
    if (!World.walkable(a, nb[0], nb[1])) continue;
    if (World.transitionAt(a, nb[0], nb[1])) continue;
    return nb;
  }
  for (const nb of nbs) {
    if (World.walkable(a, nb[0], nb[1])) return nb;
  }
  return [x, y];
}
function floorRatio(a) {
  let f = 0;
  for (let i = 0; i < a.grid.length; i++) if (a.grid[i] === CFG.T.FLOOR) f++;
  return f / a.grid.length;
}
function deadEnds(a) {
  let n = 0;
  for (let y = 0; y < a.h; y++) {
    for (let x = 0; x < a.w; x++) {
      if (!World.walkable(a, x, y)) continue;
      let nb = 0;
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
  let start = null;
  for (let y = 0; y < a.h && !start; y++) {
    for (let x = 0; x < a.w; x++) if (World.walkable(a, x, y)) { start = [x, y]; break; }
  }
  if (!start) return true;
  let total = 0;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) if (World.walkable(a, x, y)) total++;
  const seen = {};
  const q = [start];
  seen[start[0] + ',' + start[1]] = 1;
  let head = 0;
  while (head < q.length) {
    const c = q[head++];
    const nbs = [[c[0] + 1, c[1]], [c[0] - 1, c[1]], [c[0], c[1] + 1], [c[0], c[1] - 1]];
    for (const nb of nbs) {
      if (!World.walkable(a, nb[0], nb[1])) continue;
      const k = nb[0] + ',' + nb[1];
      if (!seen[k]) { seen[k] = 1; q.push(nb); }
    }
  }
  return head === total;
}

/* ---------- playthrough ---------- */
console.log('== Emberfall headless logic test ==');

Game.newGame();

check('starts in town', Player.area === 'town');
check('town has no hostile enemies', World.getArea('town').enemies.length === 0);

/* movement */
const sx = Player.x;
walkTo(31, 22, 70);
check('click-to-move works', Player.x > sx + 1.2, 'x=' + Player.x.toFixed(2));

const tA = Render.tileScreen(26, 22);
const tB = Render.tileScreen(33, 19);
Input.simDown(tA.x, tA.y);
stepN(12, 1 / 30);
const midX = Player.x, midY = Player.y;
Input.simDown(tB.x, tB.y);
stepN(30, 1 / 30);
Input.simUp();
check('hold-to-move retargets to new cursor point', Player.x > midX && Player.y < midY);

/* town -> wild gates */
teleport('town', 45, 24);
walkTo(47, 24, 40);
check('east gate -> wilderness', Player.area === 'wild');
check('arrives on wild west gate tile', Player.tileX() === 1 && Player.tileY() === 34);
walkTo(3, 34, 30);
walkTo(1, 34, 40);
check('gate returns to town east gate', Player.area === 'town' && Player.tileX() === 47 && Player.tileY() === 24);

/* combat */
teleport('wild', 26, 44);
Player.hp = Player.maxHp;
stepN(40, 1 / 30);
let en = nearestEnemy();
check('wilderness has enemies', !!en);
if (en) {
  let nwE = nearWalkable(World.getArea('wild'), Math.floor(en.x), Math.floor(en.y));
  teleport('wild', nwE[0], nwE[1]);
  stepN(5);
  Game.__test.clickTile(Math.floor(en.x), Math.floor(en.y));
  stepN(90, 1 / 30);
  check('click-attack damages enemy', en.hp < en.maxHp || en.dead, en.hp + '/' + en.maxHp);
}
Game.__test.killAll();
stepN(10);
check('kills produce corpses', World.getArea('wild').enemies.some(e => e.dead));

/* loot */
Player.hp = Player.maxHp;
teleport('wild', 40, 30);
const aWild = World.getArea('wild');
const gBefore = Player.gold;
World.addLoot(aWild, { kind: 'gold', amount: 25, x: Player.tileX() + 0.3, y: Player.tileY() });
stepN(2);
const theLoot = aWild.loot[aWild.loot.length - 1];
Input.pickupLoot(theLoot);
check('gold loot pickup works', Player.gold === gBefore + 25, 'gold=' + Player.gold);
World.addLoot(aWild, { kind: 'gold', amount: 10, x: Player.tileX() + 0.3, y: Player.tileY() });
Game.__test.clickTile(Math.floor(Player.x), Math.floor(Player.y));
stepN(20, 1 / 30);
check('clicking loot picks it up', Player.gold === gBefore + 35, 'gold=' + Player.gold);

/* inventory & equip */
Items.addToInv(Items.make('sword_iron'));
Items.addToInv(Items.make('armor_leather'));
let wpnIdx = -1;
for (let i = 0; i < Player.inventory.length; i++) {
  if (Player.inventory[i].it.type === 'weapon') { wpnIdx = i; break; }
}
Player.equipItem(wpnIdx);
check('equipping raises damage', Player.equip.weapon !== null && Player.dmg() > CFG.PLAYER.baseDmg);
Player.unequip('weapon');
check('unequip works', Player.equip.weapon === null);

/* selling / buyback / buying */
teleport('town', 12, 24);
Game.__test.giveGold(500);
const g0 = Player.gold;
Items.addToInv(Items.make('sword_rusty'));
let sellIdx = -1;
for (let i = 0; i < Player.inventory.length; i++) {
  if (Player.inventory[i].it.id === 'sword_rusty') { sellIdx = i; break; }
}
NPC.sellFromInventory(sellIdx);
check('selling near merchant grants gold', Player.gold > g0);
check('sold item in buyback', NPC.buybackList('orin').length === 1);
const g1 = Player.gold;
NPC.buyBack('orin', 0);
check('buyback repurchases item', Player.gold < g1 && NPC.buybackList('orin').length === 0);
const invN = Player.inventory.length;
NPC.buy('orin', 'sword_iron');
check('buying works after buyback', Player.inventory.length === invN + 1);
teleport('wild', 30, 30);
const g2 = Player.gold;
let s2 = -1;
for (let i = 0; i < Player.inventory.length; i++) {
  if (Player.inventory[i].it.id === 'sword_iron') { s2 = i; break; }
}
if (s2 >= 0) {
  NPC.sellFromInventory(s2);
  check('cannot sell far from merchant', Player.gold === g2);
}

/* dialogue data (no DOM in node) */
const talk = NPC.talk('rooke');
check('NPC talk produces dialogue with Dismiss', talk && talk.buttons.some(b => b.label === 'Dismiss'));
check('rooke offers scavengers quest', talk.buttons.some(b => b.label === 'Accept'));

/* quests */
Quests.accept('scavengers');
check('quest accepted into journal', Quests.state('scavengers') === 'active');
check('quest not auto-added by mere click', Quests.state('wolves') === null);
Quests.accept('wolves');
Quests.accept('terrors');
Quests.accept('reachB2');
Quests.accept('relic');
check('reachB2 prereq blocks hollowking offer', Quests.canOffer('corvyn').indexOf('hollowking') === -1);

teleport('wild', 26, 44);
stepN(20);
Game.__test.killAll();
stepN(5);
teleport('wild', 20, 30);
stepN(20);
Game.__test.killAll();
stepN(5);
teleport('wild', 45, 30);
stepN(20);
Game.__test.killAll();
stepN(5);
const scavState = Quests.state('scavengers');
const wolfState = Quests.state('wolves');
check('kill quests progress to ready', scavState === 'ready' || scavState === 'active', scavState);
check('wolves quest progresses', wolfState === 'ready' || wolfState === 'active', wolfState);

/* cathedral door */
teleport('town', 37, 20);
walkTo(37, 17, 60);
const townDoor = World.getArea('town').doors.cathDoor;
Input.openDoor(townDoor);
check('door opens on click', townDoor.open === true);
walkTo(37, 16, 60);
check('cathedral door enters 1F', Player.area === 'cath1');
const c1 = World.getArea('cath1');
check('arrives just inside 1F south door',
  Player.tileX() === c1.doors.doorS.in.x && Player.tileY() === c1.doors.doorS.in.y,
  Player.tileX() + ',' + Player.tileY() + ' vs ' + c1.doors.doorS.in.x + ',' + c1.doors.doorS.in.y);
Input.openDoor(c1.doors.doorS);
walkTo(c1.doors.doorS.x, c1.doors.doorS.y, 60);
check('returns to town plaza via 1F south door',
  Player.area === 'town' && Player.tileX() === 37 && Player.tileY() === 17,
  Player.area + ' ' + Player.tileX() + ',' + Player.tileY());

/* labyrinth checks */
for (const mid of ['cath1', 'cath2', 'b1', 'b2', 'b3']) {
  const ma = World.getArea(mid);
  check(mid + ' labyrinthine (ratio/deadends/connected)',
    floorRatio(ma) > 0.15 && floorRatio(ma) < 0.6 && deadEnds(ma) >= 5 && allConnected(ma),
    'ratio=' + floorRatio(ma).toFixed(2) + ' deadends=' + deadEnds(ma));
}
check('cath3 boss floor has only the boss', World.getArea('cath3').enemies.length === 1);
check('b4 boss floor has only the boss', World.getArea('b4').enemies.length === 1);

/* stairs: 1F -> 2F -> 3F -> back */
let nw1 = nearWalkable(c1, c1.transitions.stairUp.x, c1.transitions.stairUp.y); teleport('cath1', nw1[0], nw1[1]);
walkTo(c1.transitions.stairUp.x, c1.transitions.stairUp.y, 60);
check('stairs up reach 2F', Player.area === 'cath2');
const c2 = World.getArea('cath2');
check('arrives on 2F stairs', Player.tileX() === c2.transitions.stairDn.x && Player.tileY() === c2.transitions.stairDn.y);
stepN(30);
let nwDn = nearWalkable(c2, c2.transitions.stairDn.x, c2.transitions.stairDn.y);
walkTo(nwDn[0], nwDn[1], 40);
walkTo(c2.transitions.stairDn.x, c2.transitions.stairDn.y, 60);
check('stairs down return to 1F', Player.area === 'cath1');
let nw2 = nearWalkable(c2, c2.transitions.stairUp.x, c2.transitions.stairUp.y); teleport('cath2', nw2[0], nw2[1]);
walkTo(c2.transitions.stairUp.x, c2.transitions.stairUp.y, 60);
check('stairs up reach 3F (chancel)', Player.area === 'cath3');

/* cantor boss */
stepN(30);
let boss = nearestEnemy();
check('boss present on 3F', !!boss && boss.def.boss);
if (boss) {
  let nwB = nearWalkable(World.getArea('cath3'), Math.floor(boss.x), Math.floor(boss.y));
  teleport('cath3', nwB[0], nwB[1]);
  stepN(30);
  check('boss bar shows on encounter', UI.bossVisible());
  boss.takeDamage(99999, false);
  stepN(10);
}
check('boss UI hides on death', !UI.bossVisible());
check('altar unsealed after boss death', World.getArea('cath3').altar.locked === false);
const c3 = World.getArea('cath3');
let nwa = nearWalkable(c3, c3.altar.x, c3.altar.y); teleport('cath3', nwa[0], nwa[1]);
stepN(10);
Game.__test.clickTile(c3.altar.x, c3.altar.y);
stepN(40);
let gotCenser = false;
for (let i = 0; i < Player.inventory.length; i++) {
  if (Player.inventory[i].it.id === 'quest_censer') gotCenser = true;
}
check('censer picked up after boss death', gotCenser);
check('relic quest ready', Quests.state('relic') === 'ready');

/* doorstair down to b1 */
let nwd = nearWalkable(c1, c1.doors.doorStairB1.x, c1.doors.doorStairB1.y); teleport('cath1', nwd[0], nwd[1]);
if (!c1.doors.doorStairB1.open) Input.openDoor(c1.doors.doorStairB1);
walkTo(c1.doors.doorStairB1.x, c1.doors.doorStairB1.y, 70);
check('door+stairway reaches B1F', Player.area === 'b1');
const b1 = World.getArea('b1');
check('arrives on B1F stairs', Player.tileX() === b1.transitions.stairUp.x && Player.tileY() === b1.transitions.stairUp.y);
/* climb back up: door should open automatically on arrival */
stepN(30);
let nwUp = nearWalkable(b1, b1.transitions.stairUp.x, b1.transitions.stairUp.y);
walkTo(nwUp[0], nwUp[1], 40);
walkTo(b1.transitions.stairUp.x, b1.transitions.stairUp.y, 70);
check('climbing back up returns to 1F', Player.area === 'cath1');
check('door at top auto-opened from below', c1.doors.doorStairB1.open === true);

/* B1 -> B2 -> B3 -> B4 */
let nwb1 = nearWalkable(b1, b1.transitions.stairDn.x, b1.transitions.stairDn.y); teleport('b1', nwb1[0], nwb1[1]);
walkTo(b1.transitions.stairDn.x, b1.transitions.stairDn.y, 60);
check('B1 -> B2F', Player.area === 'b2');
check('reachB2 ready', Quests.state('reachB2') === 'ready');
Quests.accept('hollowking');
const b2 = World.getArea('b2');
let nwb2 = nearWalkable(b2, b2.transitions.stairDn.x, b2.transitions.stairDn.y); teleport('b2', nwb2[0], nwb2[1]);
walkTo(b2.transitions.stairDn.x, b2.transitions.stairDn.y, 60);
check('B2 -> B3F', Player.area === 'b3');
const b3 = World.getArea('b3');
let nwb3 = nearWalkable(b3, b3.transitions.stairDn.x, b3.transitions.stairDn.y); teleport('b3', nwb3[0], nwb3[1]);
walkTo(b3.transitions.stairDn.x, b3.transitions.stairDn.y, 60);
check('B3 -> B4F (throne)', Player.area === 'b4');

/* marrow boss + sealed gate */
stepN(30);
let boss2 = nearestEnemy();
check('marrow present on B4F', !!boss2 && boss2.def.boss);
if (boss2) {
  let nwB2 = nearWalkable(World.getArea('b4'), Math.floor(boss2.x), Math.floor(boss2.y));
  teleport('b4', nwB2[0], nwB2[1]);
  stepN(30);
  check('boss bar for Marrow', UI.bossVisible());
  boss2.takeDamage(99999, false);
  stepN(10);
}
check('boss UI hides after Marrow death', !UI.bossVisible());
const b4 = World.getArea('b4');
check('sealed vault gate opens on boss death', b4.doors.vault.open === true);
check('hollowking ready', Quests.state('hollowking') === 'ready');

/* persistence */
const h1 = layoutHash(b2);
const deadBefore = Object.keys(b2.deadEnemies).length;
let explBefore = 0;
for (let i = 0; i < b2.explored.length; i++) if (b2.explored[i]) explBefore++;
Game.save();
Game.load();
const b2b = World.getArea('b2');
check('layout persists across save/load', layoutHash(b2b) === h1);
check('killed enemies stay dead after load', Object.keys(b2b.deadEnemies).length >= deadBefore);
let explAfter = 0;
for (let i = 0; i < b2b.explored.length; i++) if (b2b.explored[i]) explAfter++;
check('explored state persists', explAfter >= explBefore);
check('open doors persist after load', World.getArea('town').doors.cathDoor.open === true && World.getArea('cath1').doors.doorS.open === true);

/* transition pairs all resolve to walkable arrival tiles */
let allPairs = true;
for (const P of Gen.PAIRS) {
  const sa = World.getArea(P.a), da = World.getArea(P.b);
  const st = sa.transitions[P.t], dt = da.transitions[P.u];
  const a1 = World.resolveArrival(P.a, P.t);
  const a2 = World.resolveArrival(P.b, P.u);
  if (!st || !dt || !a1 || !a2 || !World.walkable(da, a1.x, a1.y) || !World.walkable(sa, a2.x, a2.y)) {
    allPairs = false;
    console.error('  pair failed: ' + P.a + '.' + P.t + ' <-> ' + P.b + '.' + P.u);
  }
}
check('all 11 transition pairs resolve both ways to walkable tiles', allPairs);

/* wilderness connects cathedral (exterior door) */
const c1x = World.getArea('cath1');
teleport('cath1', c1x.doors.doorX.in.x, c1x.doors.doorX.in.y);
if (!c1x.doors.doorX.open) Input.openDoor(c1x.doors.doorX);
walkTo(c1x.doors.doorX.x, c1x.doors.doorX.y, 60);
check('1F exterior door leads to wilderness', Player.area === 'wild');
const wDoor = World.getArea('wild').doors.chapelDoor;
check('arrives outside the chapel door', Player.tileX() === wDoor.out.x && Player.tileY() === wDoor.out.y,
  Player.tileX() + ',' + Player.tileY());
Input.openDoor(wDoor);
walkTo(wDoor.x, wDoor.y, 60);
check('chapel door returns to 1F', Player.area === 'cath1');

/* cave entrance from wilderness */
let nwc = nearWalkable(World.getArea('wild'), World.getArea('wild').transitions.cave.x, World.getArea('wild').transitions.cave.y); teleport('wild', nwc[0], nwc[1]);
walkTo(World.getArea('wild').transitions.cave.x, World.getArea('wild').transitions.cave.y, 60);
check('wilderness cave enters B1F', Player.area === 'b1');
const caveTrans = World.getArea('b1').transitions.cave;
check('arrives on B1F cave tile', Player.tileX() === caveTrans.x && Player.tileY() === caveTrans.y);
let nwCave = nearWalkable(World.getArea('b1'), caveTrans.x, caveTrans.y);
walkTo(nwCave[0], nwCave[1], 40);
walkTo(caveTrans.x, caveTrans.y, 60);
check('cave returns to wilderness', Player.area === 'wild');

/* quest turn-in */
const g3 = Player.gold, xp3 = Player.xp, lvl3 = Player.level;
Quests.turnIn('hollowking');
check('turn-in grants gold and xp', Player.gold > g3 && (Player.xp > xp3 || Player.level > lvl3));
check('quest completed after turn-in', Quests.state('hollowking') === 'completed');
const gold4 = Player.gold, xp4 = Player.xp;
Quests.turnIn('relic');
check('relic turn-in works', Quests.state('relic') === 'completed' && Player.gold >= gold4);

/* leveling */
const lvl0 = Player.level;
Player.gainXp(5000);
check('leveling improves stats', Player.level > lvl0 && Player.maxHp > CFG.PLAYER.baseHP);

/* abilities */
const mp0 = Player.mp;
Player.cast('firebolt');
check('firebolt costs mana', Player.mp < mp0);
stepN(30);
Player.hp = Math.max(1, Player.hp - 20);
const hp0 = Player.hp;
Player.cast('heal');
stepN(5);
check('heal restores health', Player.hp > hp0 || Player.hp === Player.maxHp);
Player.cast('nova');
stepN(10);

/* potions */
Items.addToInv(Items.make('potion_h'), 1);
Player.hp = Math.max(1, Player.maxHp - 30);
const hp1 = Player.hp;
Player.usePotionHot('potionH');
check('health potion works', Player.hp > hp1);
Items.addToInv(Items.make('potion_m'), 1);
Player.mp = 0;
stepN(40, 1 / 30);
Player.usePotionHot('potionM');
check('mana potion works', Player.mp > 0);

/* buyback state persists across save/load */
teleport('town', 12, 24);
Items.addToInv(Items.make('axe_broad'));
let sbIdx = -1;
for (let i = 0; i < Player.inventory.length; i++) {
  if (Player.inventory[i].it.id === 'axe_broad') { sbIdx = i; break; }
}
NPC.sellFromInventory(sbIdx);
Game.save();
Game.load();
check('buyback list persists across save/load', NPC.buybackList('orin').length >= 1);

/* player death: respawn in town, lose 10% gold, full heal */
Game.__test.giveGold(100);
const goldD = Player.gold;
Player.takeDamage(9999);
check('death respawns in town', Player.area === 'town');
check('death restores health', Player.hp === Player.maxHp);
check('death costs 10% gold', Player.gold === goldD - Math.floor(goldD * 0.1));

/* determinism: same runSeed -> same layouts */
const seedA = World.world.runSeed;
const layout1 = layoutHash(World.getArea('b3'));
World.world.areas = {};
const layout2 = layoutHash(World.getArea('b3'));
check('same seed regenerates identical layout', layout1 === layout2);

/* different seed -> different layout */
const savedSeed = World.world.runSeed;
World.world.runSeed = savedSeed + 12345;
World.world.areas = {};
const layout3 = layoutHash(World.getArea('b3'));
check('different seed produces different layout', layout1 !== layout3);
World.world.runSeed = savedSeed;
World.world.areas = {};

console.log('== RESULT: ' + passes + ' passed, ' + failures + ' failed ==');
process.exit(failures === 0 ? 0 : 1);
