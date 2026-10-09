# Power Pete — Complete Game Recreation Benchmark

Recreate **Power Pete** as a complete, immediately playable game.

The finished result must reproduce the recognizable **gameplay, visual identity, controls, combat, level structure, enemy behavior, rescue objectives, weapon system, pickups, progression, interface, difficulty curve, bosses, and overall arcade experience** of the original game as faithfully as reasonably possible.

Do not create a superficial mockup, static demonstration, single-room prototype, or simplified scene that merely resembles Power Pete. Build an **actual playable game with a beginning, progression system, multiple levels, objectives, failure states, bosses, and an ending**.

Where exact reproduction is impractical, implement the closest functional approximation rather than omitting the feature.

The game must be **immediately playable when launched**.

Use original/replacement graphical assets where necessary rather than depending on unavailable copyrighted game assets, but preserve the recognizable visual language and gameplay of Power Pete.

You are responsible for deciding the architecture, implementation details, scope priorities, supporting systems, balancing, and polish.

Go as far as the available environment and capabilities reasonably allow.

## CORE GAME IDENTITY

This must play recognizably like **Power Pete**, not merely like a generic top-down shooter.

The player controls Pete through a large toy store divided into increasingly dangerous themed departments.

Gameplay should revolve around:

- exploring scrolling top-down stages
- fighting large numbers of hostile toys and creatures
- rescuing fuzzy bunnies scattered throughout each stage
- collecting ammunition, health, keys, weapons, and power-ups
- opening barriers and accessing previously blocked areas
- locating every required bunny before completing the stage
- surviving increasingly difficult enemy encounters
- defeating major enemies and bosses
- progressing through the different departments of the Toy Mart

Maintain the fast, colorful, slightly chaotic arcade feel of the original.

## PLAYER CONTROLS

Implement responsive **eight-direction movement**.

Pete must be able to move:

- north
- northeast
- east
- southeast
- south
- southwest
- west
- northwest

Movement should feel immediate and arcade-like rather than physics-heavy.

The player must also be able to fire weapons directionally.

Movement and shooting should support the rapid run-and-gun nature of Power Pete.

Provide clearly documented keyboard controls directly within the game, such as on the title screen, pause screen, or help overlay.

Controls must include at minimum:

- movement
- firing
- changing weapons
- pausing
- starting/restarting the game

Prevent normal browser behavior from interfering with gameplay when gameplay keys are being used.

## PLAYER COMBAT

Pete must be able to fire weapons at hostile enemies.

Projectiles must:

- originate from Pete
- travel in the intended firing direction
- collide with enemies
- damage enemies
- disappear appropriately after impact or range expiration

Enemies must have actual health/damage handling rather than disappearing merely because they were touched by a projectile.

Pete must also be vulnerable to enemies and hostile attacks.

Implement:

- player health
- damage
- temporary post-hit invulnerability
- death
- lives
- restarting/re-entering a stage after losing a life
- game-over behavior

The interface must clearly communicate remaining health and lives.

## WEAPON SYSTEM

Implement multiple recognizable weapon categories rather than giving Pete one universal gun.

The recreation should contain **five usable weapon types** with meaningfully different behavior.

Possible distinctions include:

- firing rate
- projectile speed
- projectile spread
- damage
- range
- ammunition capacity
- area coverage

Weapons should include suitable equivalents of Power Pete's varied firearms and heavier weapons.

The player must be able to:

- acquire weapons
- carry multiple weapon types
- switch between them
- see which weapon is currently selected
- see ammunition remaining for applicable weapons

Weapon switching must work during active gameplay.

Different weapons should provide meaningful tactical advantages rather than being cosmetic variants.

## AMMUNITION

Weapons that require ammunition must consume it when fired.

Ammo pickups should appear throughout levels and/or be dropped by enemies.

The HUD must clearly show ammunition for the selected weapon.

Running out of ammunition should have appropriate gameplay consequences rather than silently providing infinite shots.

## ENEMIES

Populate stages with numerous hostile toy-store creatures.

Enemies should vary in:

- appearance
- movement speed
- health
- aggression
- attack style
- damage
- pursuit behavior

Include both melee/contact-oriented enemies and enemies capable of ranged attacks where appropriate.

Enemies should actively interact with Pete rather than simply wandering decoratively.

They should:

- detect or pursue Pete
- navigate around the environment sufficiently to remain threatening
- attack when appropriate
- receive damage
- die
- potentially drop useful items

As the game progresses, introduce tougher enemy variants.

Later enemies should generally possess greater resilience, damage potential, speed, attack complexity, or some combination of these.

Avoid filling every stage with identical enemies.

## ENEMY DROPS

Defeated enemies should have a chance to drop useful items.

Drops may include:

- ammunition
- health
- temporary power-ups
- other useful resources

Drops should remain in the world long enough for the player to collect them.

## FUZZY BUNNY RESCUE SYSTEM

Rescuing fuzzy bunnies is a central objective and must not be reduced to decorative collectibles.

Each normal stage must contain a predetermined number of bunnies distributed around the playable area.

When Pete reaches a bunny:

- the bunny is rescued
- the bunny disappears from the map
- the rescued count increases
- the HUD updates immediately
- suitable visual/audio feedback occurs

Display progress in a clear form such as:

**Bunnies: 4 / 7**

The player must rescue **all required bunnies before the stage can be completed**.

Attempting to leave before rescuing them all should clearly communicate that more bunnies remain.

## BUNNY RADAR

Implement a radar/navigation aid that helps the player locate remaining fuzzy bunnies.

The radar should provide useful directional information without simply teleporting the player to the objective.

It should update as bunnies are rescued.

The radar should make searching large scrolling levels practical and should remain readable during combat.

## LEVEL STRUCTURE

The game must contain a substantial multi-stage progression rather than one repeating arena.

Implement **five themed Toy Mart departments**, each containing **three sections/stages**, for a total progression of approximately:

**15 playable sections.**

Each department should possess its own:

- environmental appearance
- decorative objects
- enemy composition
- obstacle arrangement
- difficulty profile
- atmosphere

Stages should become progressively more dangerous.

Do not simply recolor one identical map fifteen times.

## THEMED DEPARTMENTS

Create five visually distinct toy-store departments inspired by the recognizable progression of Power Pete.

Possible themes should evoke environments such as:

- toy-filled store areas
- prehistoric/dinosaur environments
- western/frontier environments
- space/science-fiction environments
- medieval/fantasy environments

The exact implementation may be adapted to available assets, but every department must be immediately distinguishable from the others.

Use environmental details appropriate to each theme.

For example:

### Toy Department

Use objects such as:

- toy blocks
- shelves
- boxes
- colorful merchandise
- toy obstacles

### Prehistoric Department

Use elements such as:

- rocks
- bones
- dinosaur imagery
- eggs
- vegetation
- primitive terrain

### Western Department

Use elements such as:

- fences
- barrels
- crates
- desert ground
- frontier props

### Space Department

Use elements such as:

- metallic flooring
- machinery
- computers
- energy equipment
- futuristic barriers

### Medieval Department

Use elements such as:

- stone floors
- castle walls
- banners
- armor
- dungeon or fortress props

Environmental artwork should contribute to navigation and theme rather than existing purely as a background texture.

## SCROLLING WORLD

Stages must be larger than the visible gameplay viewport.

Implement smooth camera scrolling following Pete as he moves through the environment.

The player should explore actual spaces rather than remaining confined to one screen.

The camera must:

- follow Pete smoothly
- remain constrained to map boundaries
- keep gameplay readable
- avoid exposing areas outside the level

## LEVEL DESIGN

Stages should contain purposeful layouts.

Use combinations of:

- walls
- corridors
- rooms
- open combat spaces
- obstacles
- locked passages
- alternate routes
- bunny locations
- enemy clusters
- pickup locations

Do not generate levels that are simply empty rectangles populated randomly with enemies.

Each stage should encourage exploration.

Later stages should become more involved and dangerous.

## COLLISION

Implement proper collision between Pete and solid environmental objects.

Pete must not be able to simply walk through:

- walls
- barriers
- major scenery
- locked gates
- other explicitly solid objects

Projectile collision should also respect appropriate environmental geometry.

Collision should remain stable when moving diagonally or against corners.

## KEYS AND LOCKED BARRIERS

Implement keys and locked barriers as part of exploration.

Keys should be collectible objects.

Locked barriers should prevent access until the appropriate key requirement is satisfied.

Collecting a key should:

- update the HUD/inventory
- allow appropriate barriers to open
- provide clear feedback

Barriers should create meaningful exploration rather than arbitrary delays.

Depending on difficulty and stage progression, levels may contain multiple barriers or require additional exploration before every area can be reached.

## POWER-UPS

Implement temporary power-ups that significantly affect gameplay.

Possible effects include:

- increased movement speed
- increased firing speed
- increased damage
- temporary invulnerability
- other suitable arcade bonuses

Power-ups should:

- be visibly identifiable
- activate when collected
- have clear gameplay effects
- expire after an appropriate duration
- communicate their active state to the player

Avoid power-ups whose effects are so minor that the player cannot tell whether they are active.

## HEALTH

Pete should have a multi-step health system represented through hearts or an equivalent immediately readable display.

Taking damage should visibly reduce health.

Health pickups should restore health without exceeding the maximum.

Damage feedback should include appropriate combinations of:

- flashing
- knockback
- sound
- HUD changes

Repeated collision with an enemy must not drain the entire health meter instantaneously; use a brief invulnerability period after damage.

## LIVES AND GAME OVER

Pete should begin with a limited number of lives.

When health reaches zero:

- Pete loses a life
- the death state is communicated
- the stage resets or Pete respawns appropriately

When no lives remain, display a proper **Game Over** state.

Allow the player to restart without reloading the webpage/application.

## DIFFICULTY SETTINGS

Provide multiple difficulty levels.

Difficulty should affect actual gameplay rather than merely changing a label.

Possible differences include:

- enemy health
- enemy damage
- enemy speed
- enemy count
- projectile frequency
- number of barriers
- resource availability
- boss durability

Difficulty selection should occur before starting a new game.

## BOSSES

Major progression points must include boss encounters.

Bosses must be substantially different from normal enemies.

A boss should possess:

- significantly greater health
- distinctive appearance
- unique attack behavior
- multiple attacks or changing attack patterns where practical
- clear damage feedback
- a dedicated health display

Display a prominent **boss health bar** during boss encounters.

Boss arenas should provide enough space for movement and dodging.

Bosses must actually be defeated through gameplay before progression continues.

Later bosses should be more dangerous than earlier ones.

## SECTION FINALES

Each department should build toward a more difficult final section.

The third section of a department should feel climactic through some combination of:

- increased enemy pressure
- tougher enemies
- more complicated exploration
- more barriers
- larger bunny requirements
- a boss encounter

Progressing to the next department should feel like a meaningful milestone.

## STAGE COMPLETION

A stage cannot be completed until all required fuzzy bunnies have been rescued.

Once the objective is satisfied, clearly indicate that the exit or completion condition is available.

Completing a stage should:

1. stop active combat appropriately
2. provide clear completion feedback
3. preserve progression
4. advance to the next section
5. eventually advance to the next department

The game should ultimately reach a final completion state after the last department/boss.

## HUD

Create a persistent arcade-style HUD displaying essential information without covering excessive gameplay space.

At minimum display:

- current health/hearts
- lives
- current weapon
- ammunition
- fuzzy bunnies rescued / total
- keys
- score
- active temporary power-up when applicable
- current department/section when useful

Information must update immediately when game state changes.

## SCORE

Implement an arcade score system.

Award points for actions such as:

- defeating enemies
- rescuing bunnies
- defeating bosses
- completing stages

Display score prominently in the HUD.

## PICKUPS

Pickups must be visually distinct from enemies and scenery.

Use clear visual representations for:

- ammunition
- health
- weapons
- keys
- power-ups

Important pickups should remain readable even when the screen contains many enemies.

## VISUAL STYLE

Reproduce the colorful early-1990s Macintosh arcade aesthetic of Power Pete as closely as practical using original/replacement graphics.

Aim for:

- colorful sprite-like characters
- exaggerated toy enemies
- readable silhouettes
- bright pickups
- richly decorated themed environments
- strong visual contrast
- playful arcade presentation

Do not replace the aesthetic with:

- minimalist geometric abstraction
- sterile modern UI
- generic military imagery
- dark realistic shooter graphics

If exact artwork is unavailable, create coherent substitute art that preserves the game's visual personality.

## ANIMATION

Animate important gameplay actions.

At minimum provide visual animation or state changes for:

- Pete walking
- Pete firing
- enemies moving
- enemies attacking
- enemies taking damage
- enemy deaths
- bunny rescues
- pickups
- projectiles
- boss attacks

Simple sprite animation is acceptable if it remains readable and responsive.

## FEEDBACK AND EFFECTS

Combat should have satisfying audiovisual feedback.

Include appropriate effects such as:

- muzzle flashes
- projectile trails
- impact flashes
- enemy hit flashes
- particles
- explosions
- pickup effects
- bunny rescue effects
- screen shake for sufficiently large events

Effects should improve readability rather than obscure gameplay.

## AUDIO

Where practical, provide generated/original sound effects for:

- firing
- enemy hits
- enemy deaths
- pickups
- bunny rescues
- player damage
- doors/barriers
- boss attacks
- stage completion

If external sound files are unavailable, synthesized Web Audio effects are acceptable.

The game must remain functional if audio cannot start until the player interacts with the page.

## TITLE SCREEN

Provide a proper title/start screen rather than immediately dropping the player into unexplained gameplay.

Include:

- game title
- start control
- difficulty selection
- concise controls
- recognizable arcade presentation

Starting a game must correctly initialize every gameplay system.

## PAUSE

Implement functional pause behavior.

When paused:

- enemies stop
- projectiles stop
- timers stop
- player movement stops

Display a clear paused indicator.

The player must be able to resume cleanly.

## PROGRESSION

The complete game loop should resemble:

**Title Screen → Department 1 → Section 1 → Section 2 → Section 3 → Department 2 → ... → Department 5 → Final Section/Boss → Victory**

Do not end after one level.

All five departments and approximately fifteen sections must be reachable through normal play.

## VICTORY

After completing the final stage and defeating the final boss, display a proper victory/game-completion screen.

Show information such as:

- final score
- completion message
- option to start another game

The player should not simply remain trapped in an empty completed stage.

## TECHNICAL ROBUSTNESS

Prioritize a game that **actually launches and remains playable**.

Before considering the implementation complete, verify that:

- the game initializes without JavaScript/runtime errors
- the title screen works
- starting the game works
- movement works
- directional firing works
- collision works
- enemies spawn
- enemies can damage Pete
- Pete can damage and kill enemies
- pickups work
- weapons can be switched
- ammo changes correctly
- fuzzy bunnies can be rescued
- the bunny counter updates
- the radar responds to remaining bunnies
- keys work
- barriers unlock
- health works
- lives work
- losing all lives produces Game Over
- stage completion works
- progression advances
- bosses spawn
- bosses can be defeated
- all departments can ultimately be reached
- the final victory state can occur
- restarting works

Do not sacrifice fundamental gameplay reliability for additional decorative features.

## BROWSER IMPLEMENTATION

If implementing this benchmark as a browser game, prefer a **single self-contained HTML file** wherever reasonably possible.

The file should contain everything required to play:

- HTML
- CSS
- JavaScript
- generated graphics
- generated audio where practical

Avoid unnecessary online dependencies.

The game should run by opening the HTML file in a modern desktop browser.

Use an appropriately sized fixed gameplay viewport with a larger scrolling internal world.

Keep rendering performant even when many enemies and projectiles are active.

## SCOPE PRIORITY

If implementation time or environment limitations force prioritization, use this order:

1. game launches reliably
2. responsive movement and shooting
3. enemy combat
4. bunny rescue objective
5. weapons and ammunition
6. health/lives/death
7. scrolling exploration
8. stage completion
9. multi-stage progression
10. keys/barriers
11. pickups and power-ups
12. themed departments
13. bosses
14. radar
15. score and interface polish
16. animation, effects, and audio
17. additional decorative detail

Do **not** use scope limitations as justification for stopping after the first few priorities. Continue implementing as much of the complete game as the environment reasonably permits.

## FINAL REQUIREMENT

This benchmark is testing whether you can recreate the **actual game experience**, not whether you can draw something that looks vaguely similar to it.

The finished result must therefore be a **coherent, playable Power Pete recreation** featuring exploration, eight-direction run-and-gun combat, multiple weapons, ammunition, fuzzy-bunny rescue objectives, bunny radar, health and lives, enemy drops, keys and locked barriers, temporary power-ups, scrolling stages, difficulty settings, five themed departments with three sections each, increasingly resilient enemies, department finales, bosses, scoring, progression, game-over handling, and final victory.

Do not provide a design document in place of the game.

Do not merely explain how the game could be built.

Do not stop after producing a title screen, one room, one stage, or a static visual demonstration.

**Build the game and make it immediately playable.**
