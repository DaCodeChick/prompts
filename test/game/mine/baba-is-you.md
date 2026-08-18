# Baba Is You — Complete Browser Game Recreation

Create a complete, polished, immediately playable browser recreation of **Baba Is You**, reproducing the original game's core rule-manipulation puzzle system, movement behavior, visual language, level progression, controls, interactions, and puzzle-solving experience as faithfully as reasonably possible.

This must be an **actual puzzle game**, not a visual mockup, scripted imitation, or a handful of hard-coded interactions.

The defining mechanic is that **the rules of the game exist as physical objects inside the level and can themselves be manipulated by the player**.

## Deliverable

Produce a **single self-contained HTML file** that can be opened directly in a modern desktop browser and played immediately.

Requirements:

* No installation.
* No build step.
* No server.
* No external assets required.
* No CDN dependencies.
* No internet connection required after receiving the file.
* All JavaScript, CSS, graphics, level data, and audio generation must be contained within the HTML.
* The game must initialize automatically and accept keyboard input immediately.
* Verify that there are no JavaScript syntax errors or initialization failures.
* Verify that the first level actually contains a valid controllable `X IS YOU` rule when gameplay begins.

The implementation may use HTML Canvas, WebGL, DOM rendering, or another browser-native technique.

## Core Gameplay

The world consists of a rectangular grid.

Every meaningful game object occupies a grid cell.

Objects include entities such as:

* Baba
* Rock
* Wall
* Flag
* Water
* Lava
* Skull
* Grass
* Door
* Key

and textual rule blocks such as:

* BABA
* ROCK
* WALL
* FLAG
* WATER
* LAVA
* SKULL
* GRASS
* DOOR
* KEY
* IS
* AND
* YOU
* WIN
* STOP
* PUSH
* PULL
* SINK
* DEFEAT
* HOT
* MELT
* OPEN
* SHUT
* MOVE
* FLOAT
* WEAK

The architecture must permit additional nouns and properties to be added without rewriting the movement engine.

## Rule System

Rules are **not hard-coded properties of objects**.

At the beginning of a level and after every successful player action, inspect the arrangement of word tiles on the map and derive the currently active rules.

A basic sentence has the form:

`NOUN IS PROPERTY`

Examples:

`BABA IS YOU`

`WALL IS STOP`

`ROCK IS PUSH`

`FLAG IS WIN`

These rules dynamically determine world behavior.

For example, if:

`WALL IS STOP`

is broken by pushing `STOP` away, walls must immediately cease blocking movement.

If the player forms:

`WALL IS YOU`

walls immediately become player-controlled.

If the player breaks:

`BABA IS YOU`

Baba immediately stops responding to directional controls unless another rule still makes Baba `YOU`.

There must be no special-case assumption that Baba is always the player.

## Physical Word Tiles

Every rule word is itself a physical grid object.

Word tiles must normally behave as `PUSH`.

The player can therefore push:

* nouns,
* `IS`,
* properties,
* conjunctions,

and thereby construct or destroy rules.

Word blocks participate in the same collision and movement system as ordinary objects.

This must be implemented mechanically rather than through scripted puzzle triggers.

## Sentence Parsing

Continuously scan the grid for valid horizontal and vertical sentences.

At minimum support:

`NOUN IS PROPERTY`

The parser should also support conjunctions:

`BABA AND ROCK IS YOU`

`ROCK IS PUSH AND WIN`

and equivalent combinations where practical.

Horizontal and vertical sentences are equally valid.

A word may participate in more than one rule simultaneously.

Multiple rules affecting the same noun may coexist.

For example:

`ROCK IS PUSH`

and:

`ROCK IS WIN`

means rocks possess both properties.

The parser must recalculate rules whenever word positions change.

## Transformations

Support noun-to-noun rules such as:

`ROCK IS BABA`

`WALL IS ROCK`

When such a rule becomes active, affected objects should transform into the target noun according to the game's rule-resolution system.

Transformations must happen dynamically as rules are created or destroyed.

Where practical, support chained and simultaneous transformations without corrupting level state.

## YOU

Any object whose noun currently has the `YOU` property responds to player directional input.

There may be:

* one YOU object,
* several YOU objects,
* multiple different nouns that are YOU,
* or no YOU objects at all.

All YOU objects attempt to move simultaneously in the requested direction.

The game must correctly resolve situations where multiple controlled objects interact with different obstacles.

## Movement

Gameplay is turn-based and grid-based.

Controls:

* Arrow Keys — movement
* WASD — movement
* Z — undo
* R — restart level
* Escape — pause/menu where appropriate

One directional keypress normally advances the simulation by one logical turn.

Holding a direction may repeat movement at a controlled rate without causing uncontrollable browser key-repeat behavior.

Movement must feel immediate and deterministic.

Prevent browser scrolling and other default browser behavior from stealing gameplay controls.

Keyboard input must work regardless of whether the player previously clicked the canvas, provided the game page itself has focus.

## PUSH

Objects possessing `PUSH` can be pushed.

Pushing must support chains.

For example:

`BABA → ROCK → ROCK → empty`

should move both rocks and Baba one tile if both rocks are PUSH.

If the final destination cannot accept the movement, the entire push must fail.

Word tiles use this same push-chain logic.

Do not implement pushing as a collection of object-specific exceptions.

## STOP

Objects with `STOP` prevent other objects from entering their cell unless another active interaction permits it.

Breaking the corresponding STOP rule must immediately change collision behavior.

## WIN

When an object possessing `YOU` overlaps an object possessing `WIN`, the level is completed.

Examples include:

`FLAG IS WIN`

but the system must allow arbitrary nouns to become WIN.

The win condition must derive from active properties rather than assuming the flag is always the goal.

## SINK

When a `SINK` object shares a tile with another applicable object, both should be destroyed.

Example:

`WATER IS SINK`

allows Baba or another object to disappear along with the water when entering it.

The implementation should follow Baba Is You-style simultaneous interaction semantics as closely as practical.

## DEFEAT

When a YOU object overlaps a `DEFEAT` object, the YOU object is destroyed.

If other YOU objects remain, play continues.

The level is not automatically failed merely because one controlled object dies.

## OPEN / SHUT

When an `OPEN` object interacts with a `SHUT` object, both are destroyed.

This should support puzzles involving keys and doors without hard-coding those nouns.

For example:

`KEY IS OPEN`

`DOOR IS SHUT`

## HOT / MELT

Objects possessing `MELT` should be destroyed when sharing a tile with an applicable `HOT` object.

Again, properties—not nouns—determine the interaction.

## WEAK

A `WEAK` object should be destroyed when subjected to an appropriate collision.

Implement the closest practical approximation of Baba Is You's behavior.

## MOVE

Objects possessing `MOVE` automatically attempt to move in their facing direction each turn.

When blocked, they should reverse direction where appropriate.

Automatic movement occurs within the same deterministic turn-processing system as player movement.

## Layering

Multiple objects may occupy the same grid cell when their properties permit it.

Do not treat the map as a simple one-object-per-cell array.

A cell may contain, for example:

* Baba and Flag
* Baba and Water
* multiple Baba objects
* an object and a text tile
* several overlapping entities

The data model and rendering system must support this.

## Undo

Implement robust multi-step undo.

Pressing `Z` restores the complete previous turn state.

Undo must restore:

* object positions,
* destroyed objects,
* transformed objects,
* facing directions,
* active rules indirectly through restored text positions,
* win-relevant state,
* other mutable simulation state.

Repeatedly pressing undo should walk backward through previous turns.

Do not implement undo as merely moving Baba backward.

Store sufficient world state to reconstruct each previous turn exactly.

## Restart

Pressing `R` restores the level to its original state immediately.

Restart must restore:

* all objects,
* all word positions,
* all rules,
* all destroyed entities,
* all transformations,
* initial facing directions,
* turn counter/state.

## Level Design

Include a substantial collection of handcrafted puzzles rather than one demonstration room.

The early levels should introduce mechanics progressively.

Example progression:

1. Basic movement and `BABA IS YOU`.
2. `FLAG IS WIN`.
3. Breaking `WALL IS STOP`.
4. Creating `ROCK IS PUSH`.
5. Rearranging a rule to reach the goal.
6. Multiple simultaneous properties.
7. SINK.
8. DEFEAT.
9. Transformations.
10. Multiple YOU objects.
11. OPEN/SHUT.
12. More complex sentence construction.
13. Conjunctions.
14. Automatic MOVE behavior.
15. Puzzles combining several systems.

Include enough levels for the game to feel like a small but coherent puzzle campaign rather than a technology demonstration.

Every included level must be solvable.

## Progression

Completing a puzzle advances the player through the campaign.

Include a level-selection or world-map-style interface inspired by Baba Is You where reasonably practical.

Track completed levels during the current session.

Preferably persist progress using `localStorage`.

Allow completed levels to be replayed.

Do not trap the player permanently if a puzzle reaches an unwinnable state; restart and undo must always remain available.

## Level Validation

Pay special attention to rule placement.

A level containing Baba is not automatically playable.

For any level intended to begin with player control, visually and logically verify that its starting grid actually forms:

`BABA IS YOU`

or another valid `NOUN IS YOU` sentence.

Do not accidentally place the words diagonally, with gaps, stacked incorrectly, or in reversed order.

The rule parser and level data must agree about coordinates.

Validate every included starting rule before considering the game finished.

## Rendering

Reproduce the recognizable visual language of Baba Is You without requiring copied game assets.

Use a charming hand-drawn/pixel-art aesthetic featuring:

* dark playfield backgrounds,
* chunky pixel-like sprites,
* high-contrast word tiles,
* animated characters,
* irregular/wobbly visual motion,
* colorful environmental objects,
* readable rule words,
* subtle particle effects,
* screen transitions,
* small idle animations.

Objects should be visually distinct at a glance.

Text blocks must be exceptionally readable because they are gameplay objects.

Different categories of words should have visually coherent coloring.

## Animation

Even though simulation is grid-based, movement should not feel completely static.

Use short interpolation or sprite animation between cells while preserving deterministic grid logic.

Include:

* Baba walking animation,
* idle animation,
* slight text wobble,
* movement easing,
* destruction effects,
* win effects,
* transitions between levels.

Animations must never interfere with the authoritative grid state.

## Interface

Display useful information without covering the puzzle.

Include:

* current level name,
* restart control hint,
* undo control hint,
* movement hint where appropriate,
* current progress,
* pause/menu access.

Optionally display currently active rules in a compact panel, provided this does not remove the need to visually inspect sentences in the world.

## Audio

Provide lightweight sound feedback generated or embedded entirely within the HTML.

Include sounds for:

* movement,
* pushing,
* rule changes,
* destruction,
* undo,
* restart,
* level completion.

Music may be procedurally generated with Web Audio if appropriate.

Audio must not prevent the game from launching because of browser autoplay restrictions. Initialize sound after the first user interaction if necessary.

## Input Robustness

Input is a release-critical requirement.

Before considering the project complete, explicitly verify:

1. The page loads without exceptions.
2. The game loop starts.
3. The first level initializes.
4. A valid `X IS YOU` rule exists.
5. Pressing Right causes a YOU object to attempt movement.
6. WASD performs the same movement.
7. Browser scrolling is prevented for gameplay keys.
8. Z performs undo.
9. R restarts.
10. Input still works after winning and loading another level.

A game that renders correctly but cannot move is considered completely broken.

## Simulation Architecture

Keep simulation state separate from rendering state.

Represent entities with sufficient information for:

* noun/type,
* word/non-word status,
* word category,
* grid coordinates,
* facing direction,
* animation state,
* unique identity.

Rules should be derived from world state rather than permanently attached to entities.

A turn should conceptually perform:

1. Receive input.
2. Save undo state.
3. Parse active rules.
4. Determine YOU objects.
5. Resolve requested movement and PUSH chains.
6. Reparse rules if text moved.
7. Apply transformations.
8. Resolve interactions.
9. Resolve automatic properties.
10. Determine destruction.
11. Determine victory.
12. Commit authoritative state.
13. Animate the resulting transition.

Adjust ordering where necessary to more closely reproduce Baba Is You semantics.

## Determinism

The puzzle simulation must be deterministic.

The same level state plus the same input must produce the same result.

Visual particles and cosmetic animation may be random, but gameplay must not depend upon rendering randomness.

## Performance

Maintain smooth rendering on an ordinary modern desktop browser.

Do not rebuild unnecessary graphics or allocate excessive temporary objects every animation frame.

Because logical simulation is turn-based, game rules should only need significant recomputation when the world changes.

## Edge Cases

Handle cases including:

* no object is YOU,
* multiple objects are YOU,
* YOU is also PUSH,
* YOU is also WIN,
* one noun has multiple properties,
* several nouns share a property,
* stacked objects,
* several pushable objects in a chain,
* text pushed into text,
* simultaneous destruction,
* rules becoming valid during play,
* rules becoming invalid during play,
* transformations removing the player's former noun,
* every YOU object being destroyed,
* creating a new YOU rule after losing control,
* several WIN objects,
* overlapping WIN and DEFEAT interactions,
* undo after destruction,
* undo after transformation,
* undo after winning before progression completes.

Do not rely on Baba, Rock, Wall, Flag, Water, etc. having intrinsic gameplay behavior when that behavior should instead come from rules.

## Polish

Add small details that make the result feel like a finished game:

* title screen,
* animated logo/title,
* level transitions,
* completion animation,
* subtle camera or screen effects,
* responsive menus,
* readable controls,
* progression indicators,
* restart feedback,
* undo feedback,
* persistent completion state,
* tasteful particles,
* sound toggle.

Do not sacrifice rule-system correctness for decorative effects.

## Priority Order

If scope becomes constrained, prioritize implementation in this order:

1. Dynamic rule parsing.
2. Reliable keyboard controls.
3. Correct YOU behavior.
4. PUSH chains and movable text.
5. STOP and collision behavior.
6. WIN.
7. Undo and restart.
8. Multiple overlapping objects.
9. Transformations.
10. SINK / DEFEAT / OPEN / SHUT / HOT / MELT.
11. Conjunctions and advanced rules.
12. Multiple handcrafted levels.
13. Progression.
14. Animation and sound.
15. Additional polish.

Do **not** replace a difficult core mechanic with a scripted approximation merely to increase the apparent amount of content.

A smaller collection of levels operating on a genuinely general rule engine is preferable to many hard-coded puzzles.

## Final Acceptance Test

Do not consider the project finished until you can logically trace this sequence:

* Launch the HTML.
* Immediately move the controlled object.
* Push a word tile.
* Break an existing rule.
* Observe the associated property disappear.
* Construct a new rule.
* Observe the property immediately take effect.
* Undo the action.
* Observe the previous rule and world state return.
* Restart the puzzle.
* Solve the level through rule manipulation.
* Trigger WIN.
* Advance to another puzzle.
* Continue playing without reloading the page.

The finished result should capture the central realization that makes **Baba Is You** distinctive:

**The rules are physical objects in the puzzle, and changing the text changes reality.**

Do not explain how you would implement this.

**Implement it.**
