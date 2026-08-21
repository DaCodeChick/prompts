'use strict';
/* Headless verification for falling-sand.html.
 * Stubs the browser DOM, loads the real page script, then drives the actual
 * engine (grid + step()) through one assertion per physics rule. */
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(__dirname + '/falling-sand.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('no <script> found'); process.exit(1); }

/* ---------- minimal DOM stubs ---------- */
function makeEl() {
  return {
    style: { setProperty() {} },
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    appendChild() {},
    setAttribute() {},
    setPointerCapture() {},
    click() {},
    innerHTML: '', textContent: '', title: '', type: '', value: '5',
  };
}
const els = {};
function makeCanvas() {
  return {
    width: 0, height: 0,
    style: { setProperty() {} },
    addEventListener(type, fn) { (canvasListeners[type] = canvasListeners[type] || []).push(fn); },
    setPointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 400 }; },
    getContext() {
      return {
        imageSmoothingEnabled: false,
        createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; },
        putImageData() {}, drawImage() {},
      };
    },
  };
}
const canvasListeners = {};
function fire(type, props) {
  const e = Object.assign(
    { preventDefault() {}, button: 0, clientX: 0, clientY: 0, pointerId: 1 },
    props
  );
  (canvasListeners[type] || []).forEach((fn) => fn(e));
}
// client-pixel coordinate of a grid cell's center (canvas is 400x400 CSS px)
const pxFor = (c) => Math.round((c + 0.5) * 400 / 150);
const cellFor = (c) => { return { clientX: pxFor(c), clientY: pxFor(c) }; };
global.document = {
  getElementById(id) {
    if (id === 'sandbox') return els.sandbox || (els.sandbox = makeCanvas());
    return els[id] || (els[id] = makeEl());
  },
  createElement(tag) { return tag === 'canvas' ? makeCanvas() : makeEl(); },
};
global.window = { addEventListener() {}, SandLab: null };
global.requestAnimationFrame = () => {}; // do not loop in tests
global.performance = global.performance || { now: () => Date.now() };

vm.runInThisContext(m[1], { filename: 'falling-sand.html' });

const L = global.window.SandLab;
if (!L) { console.error('FAIL: window.SandLab was not exposed'); process.exit(1); }

const { GRID_W: W, GRID_H: H, EMPTY, SAND, WATER, WALL, ACID, grid, step, paintAt, setBrushSize, selectMaterial } = L;
const CELLS = W * H;
const idx = (x, y) => y * W + x;
let fails = 0;
function assert(cond, msg) {
  if (cond) console.log('  ok  - ' + msg);
  else { console.error('  FAIL - ' + msg); fails++; }
}
function reset() { grid.fill(EMPTY); }
function count(t) { let n = 0; for (let i = 0; i < W * H; i++) if (grid[i] === t) n++; return n; }
function countAll() { let n = 0; for (let i = 0; i < W * H; i++) if (grid[i] !== EMPTY) n++; return n; }

console.log('1) Sand falls straight down into empty space');
reset(); grid[idx(75, 10)] = SAND;
step();
assert(grid[idx(75, 11)] === SAND && grid[idx(75, 10)] === EMPTY, 'sand moved exactly one cell down');

console.log('2) Sand slides diagonally (random side) when blocked below');
reset(); grid[idx(75, 80)] = WALL; // hard obstacle directly below
grid[idx(75, 79)] = SAND;
step();
assert(grid[idx(74, 80)] === SAND || grid[idx(76, 80)] === SAND, 'sand is diagonally below its start');
assert(grid[idx(75, 79)] === EMPTY, 'sand vacated its original cell');

console.log('3) Sand sinks through water (displaces it upward), one cell per frame');
reset();
for (let y = 30; y < H; y++) { grid[idx(60, y)] = WATER; grid[idx(59, y)] = WALL; grid[idx(61, y)] = WALL; }
grid[idx(60, 29)] = SAND;
const waterBefore = count(WATER);
step();
assert(grid[idx(60, 30)] === SAND, 'sand now occupies the water cell below');
assert(grid[idx(60, 29)] === WATER, 'water was displaced upward into sand old cell');
assert(count(WATER) === waterBefore, 'water count conserved (' + waterBefore + ')');

console.log('4) Bottom-up scan: no teleport — a falling column moves 1 cell per frame');
reset(); for (let y = 100; y < H; y++) grid[idx(75, y)] = SAND;
step();
assert(grid[idx(75, 101)] === SAND && grid[idx(75, 100)] === EMPTY, 'topmost grain fell exactly one cell');
assert(count(SAND) === H - 100, 'sand count conserved');

console.log('5) Water spreads horizontally only when down+diagonals are blocked');
reset();
grid[idx(75, 100)] = WATER;
grid[idx(74, 101)] = WALL; grid[idx(75, 101)] = WALL; grid[idx(76, 101)] = WALL;
step();
assert(grid[idx(74, 100)] === WATER || grid[idx(76, 100)] === WATER, 'water moved exactly one cell sideways');
assert(grid[idx(75, 100)] === EMPTY, 'water vacated its original cell');

console.log('6) Water falls straight down when possible');
reset(); grid[idx(40, 5)] = WATER;
step();
assert(grid[idx(40, 6)] === WATER, 'water fell one cell');

console.log('7) Wall is static (empty space below, sand above, 10 steps)');
reset(); grid[idx(50, 100)] = WALL; grid[idx(50, 99)] = SAND;
for (let s = 0; s < 10; s++) step();
assert(grid[idx(50, 100)] === WALL, 'wall did not move or fall');
assert(count(WALL) === 1, 'wall count unchanged');

console.log('8) Acid dissolves sand on contact — both cells become empty');
reset();
grid[idx(75, 79)] = ACID; grid[idx(75, 80)] = SAND;
grid[idx(74, 80)] = WALL; grid[idx(76, 80)] = WALL;   // freeze the sand in place
grid[idx(75, 81)] = WALL; grid[idx(74, 81)] = WALL; grid[idx(76, 81)] = WALL;
step();
assert(grid[idx(75, 79)] === EMPTY, 'acid dissolved itself');
assert(grid[idx(75, 80)] === EMPTY, 'contacted sand pixel dissolved');
assert(count(WALL) === 5, 'unrelated walls intact');

console.log('9) Acid dissolves wall on contact');
reset(); grid[idx(30, 50)] = ACID; grid[idx(30, 51)] = WALL;
step();
assert(grid[idx(30, 50)] === EMPTY && grid[idx(30, 51)] === EMPTY, 'acid + wall pixel both gone');

console.log('10) Acid falls like water, then dissolves the sand it lands on');
reset();
grid[idx(75, 10)] = ACID; grid[idx(75, 15)] = SAND;
grid[idx(74, 15)] = WALL; grid[idx(76, 15)] = WALL; grid[idx(75, 16)] = WALL; grid[idx(74, 16)] = WALL; grid[idx(76, 16)] = WALL;
step(); assert(grid[idx(75, 11)] === ACID, 'acid fell one cell (step 1)');
step(); assert(grid[idx(75, 12)] === ACID, 'acid fell one cell (step 2)');
step(); assert(grid[idx(75, 13)] === ACID, 'acid fell one cell (step 3)');
step();
assert(count(ACID) === 0, 'acid dissolved itself on landing');
assert(grid[idx(75, 15)] === EMPTY, 'landing-zone sand pixel dissolved');
assert(count(WALL) === 5, 'sand was the victim, walls intact');

console.log('11) Acid never dissolves water');
reset();
grid[idx(75, 79)] = ACID; grid[idx(75, 80)] = WATER;
grid[idx(74, 80)] = WALL; grid[idx(76, 80)] = WALL; grid[idx(75, 81)] = WALL; grid[idx(74, 81)] = WALL; grid[idx(76, 81)] = WALL;
step();
assert(grid[idx(75, 80)] === WATER, 'water survives acid contact');
assert(count(WATER) === 1, 'water count unchanged');

console.log('12) Conservation: random sand/water/wall soup over 300 steps (no acid)');
reset();
for (let i = 0; i < 4000; i++) {
  const p = (Math.random() * CELLS) | 0;
  grid[p] = 1 + ((Math.random() * 3) | 0); // SAND|WATER|WALL
}
const s0 = count(SAND), w0 = count(WATER), a0 = count(WALL);
for (let s = 0; s < 300; s++) step();
assert(count(SAND) === s0 && count(WATER) === w0 && count(WALL) === a0,
  'no particle created or destroyed (' + s0 + '+' + w0 + '+' + a0 + ')');

console.log('13) Randomization: a 150-grain sand column forms a symmetric pile');
reset(); for (let y = 0; y < H; y++) grid[idx(75, y)] = SAND;
for (let s = 0; s < 600; s++) step();
let left = 0, right = 0;
for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
  if (grid[idx(x, y)] === SAND) { if (x < 75) left++; else if (x > 75) right++; }
}
assert(left >= 30 && right >= 30, 'grains spread to both sides (' + left + ' left / ' + right + ' right)');
assert(count(SAND) === H, 'sand conserved');

console.log('14) Horizontal chain guard: each water particle moves at most 1 cell/frame');
reset();
grid[idx(49, 100)] = WATER; grid[idx(50, 100)] = WATER; grid[idx(51, 100)] = WATER;
for (let dx = -2; dx <= 2; dx++) { grid[idx(50 + dx, 101)] = WALL; } // block below + diagonals
let minX = 999, maxX = -1, n = 0;
step();
for (let x = 0; x < W; x++) if (grid[idx(x, 100)] === WATER) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); n++; }
assert(n === 3, 'all three water particles present');
assert(minX >= 48 && maxX <= 52, 'no particle travelled more than one cell (range ' + minX + '..' + maxX + ')');

console.log('15) Brush paints a filled circle of the selected material (via pointer events)');
reset(); selectMaterial(SAND); setBrushSize(3);
fire('pointerdown', Object.assign({ button: 0 }, cellFor(75), { clientY: pxFor(75) }));
assert(count(SAND) === 21, 'radius-3 disc = 21 cells painted on pointerdown');
selectMaterial(WALL);
fire('pointerdown', Object.assign({ button: 0 }, { clientX: pxFor(30), clientY: pxFor(30) }));
assert(count(WALL) === 21, 'material switch takes effect on the next stroke');

console.log('16) Drag paints a continuous stream; right-drag erases');
reset(); selectMaterial(WATER); setBrushSize(1);
fire('pointerdown', Object.assign({ button: 0 }, { clientX: pxFor(10), clientY: pxFor(10) }));
assert(count(WATER) === 1, 'water painted at click point');
fire('pointerdown', Object.assign({ button: 0 }, { clientX: pxFor(20), clientY: pxFor(20) }));
fire('pointermove', { clientX: pxFor(25), clientY: pxFor(20) });
assert(count(WATER) === 7, 'fast drag interpolates a continuous 6-cell stream (1 + 6)');
fire('pointerup', {});
selectMaterial(EMPTY);
fire('pointerdown', Object.assign({ button: 2 }, { clientX: pxFor(10), clientY: pxFor(10) }));
assert(grid[idx(10, 10)] === EMPTY, 'right-drag erased the clicked cell');
assert(grid[idx(20, 20)] === WATER && grid[idx(25, 20)] === WATER, 'stream cells elsewhere untouched');
assert(count(WATER) === 6, 'only the erased cell was removed');

console.log('');
console.log(fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED');
process.exit(fails === 0 ? 0 : 1);
