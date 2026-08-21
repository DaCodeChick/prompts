#!/usr/bin/env node
/* ============================================================
   Emberfall - build.js : concatenate src/js/*.js, inline into
   src/index.template.html -> index.html, syntax-check result
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const srcDir = path.join(root, 'src', 'js');

const files = fs.readdirSync(srcDir)
  .filter(f => f.endsWith('.js') && f !== 'autotest.js')
  .sort();

let js = '/* Emberfall \u2014 generated bundle */\n';
for (const f of files) {
  js += fs.readFileSync(path.join(srcDir, f), 'utf8') + '\n';
}

const template = fs.readFileSync(path.join(root, 'src', 'index.template.html'), 'utf8');
const autotest = fs.readFileSync(path.join(srcDir, 'autotest.js'), 'utf8');
const html = template.replace('{{GAME_JS}}', js).replace('{{AUTOTEST}}', autotest);

const buildDir = path.join(root, 'build');
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
fs.writeFileSync(path.join(buildDir, 'game.js'), js);
fs.writeFileSync(path.join(root, 'index.html'), html);

// syntax check every source file and the bundle
let ok = true;
for (const f of files.concat(['autotest.js'])) {
  try {
    execSync('node --check ' + JSON.stringify(path.join(srcDir, f)), { stdio: 'pipe' });
  } catch (e) {
    console.error('SYNTAX ERROR in ' + f + ':\n' + e.stderr);
    ok = false;
  }
}
try {
  execSync('node --check ' + JSON.stringify(path.join(buildDir, 'game.js')), { stdio: 'pipe' });
} catch (e) {
  console.error('SYNTAX ERROR in bundle:\n' + e.stderr);
  ok = false;
}

console.log('index.html : ' + html.length + ' bytes');
console.log('game.js    : ' + js.length + ' bytes, ' + files.length + ' modules');
if (!ok) { console.error('BUILD FAILED: syntax errors'); process.exit(1); }
console.log('BUILD OK   : syntax checks passed');
