# Emberfall — a Gothic Action RPG

A complete, immediately playable isometric action RPG for the browser, inspired by the
gameplay structure of classic gothic dungeon crawlers (town hub, procedural cathedral &
catacomb floors, bosses, quests, loot, shops). All names, dialogue, art and lore are original.

**Play:** open `index.html` in any modern desktop browser (no build step, no server needed).

## Controls

| Input | Action |
|---|---|
| Left-click ground | Move there (hold and drag to steer continuously) |
| Left-click enemy | Attack (walks into range; keeps attacking while target lives) |
| Right-click inventory item | Sell it — only while near a merchant |
| `1` `2` `3` | Firebolt / Flame Nova / Mend |
| `Q` / `W` | Health potion / Mana potion |
| `I` `J` `C` `M` | Inventory / Quest Journal / Character / Automap |
| `Esc` | Close current panel, or open the pause menu (Save / Load / Sound) |

## The world

- **Town of Thornhollow** — safe hub, fully lit. Blacksmith, healer, occult peddler,
  scholar, constable, townsfolk. Buy, sell, buy back, heal, take quests.
- **Grimmoor Wilds** — open wilderness with roads, ponds, woods, a graveyard, a shrine,
  a ruined chapel (exterior cathedral door) and a cave into the catacombs.
- **Cathedral 1F–3F** — procedural labyrinthine floors above ground; 3F is the boss
  arena of the High Cantor, guarding the Sunstone Censer.
- **The Catacombs B1F–B4F** — procedural maze floors below ground; B4F is the Charnel
  Throne of Marrow, the Hollow King, with a sealed vault that only opens when he falls.

Every floor is generated once per run and then persists: layouts, doors, kills, bosses,
loot, explored map and chests all survive leaving the area and save/load.

## Systems

- Real-time combat: melee, ranged enemies, projectiles, nova rings, damage numbers, corpses.
- Fog of war: unexplored (black), explored-not-visible (dimmed), visible; torch/brazier
  light sources; the automap only shows explored geometry.
- Quests: accept/decline, live objectives, journal (`J`), READY TO TURN IN state, rewards
  (gold, XP, items), quest-giver turn-in dialogue.
- Items: weapons/armor/helms/shields/amulets/rings/potions, magic & rare quality tiers
  with color-coded tooltips; left-click equip, right-click sell near merchants, per-merchant
  buyback lists.
- Progression: XP, levels, stat growth, three mana-costing abilities, potions.
- Save/Load: full world state in localStorage (position, character, inventory, quests,
  layouts, doors, deaths, explored maps, buybacks, bosses).

## Project layout

- `index.html` — the self-contained game (deliverable).
- `src/js/*.js` — source modules (concatenated by the build).
- `build.js` — concatenates modules, inlines them into the HTML template, syntax-checks
  every file (`node --check`).
- `test/headless.js` — full logic playthrough under Node with stubbed DOM (85 checks):
  movement, combat, transitions, doors/stairs, persistence, shops, quests, bosses, saves.
- `src/js/autotest.js` — in-browser verification (97 checks) and screenshot staging;
  run with `index.html?autotest=1`, perf probe with `?perf=1`, scenes with `?shot=<name>`.

## Build & test

```bash
node build.js          # rebuild index.html + syntax check
node test/headless.js  # logic playthrough (needs build/game.js)
```

Browser verification (headless Chrome):

```bash
chrome --headless=new --dump-dom "file://$PWD/index.html?autotest=1"
```
