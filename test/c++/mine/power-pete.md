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

Handle gameplay input through SDL3 so movement, firing, and menu actions remain responsive and do not interfere with one another.

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

Allow the player to restart without relaunching the application.

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

If external sound files are unavailable, synthesize original sound effects and play them through SDL3 audio.

The game must remain functional if audio initialization fails or no output device is available.

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

- the native game initializes without crashes, resource initialization failures, or runtime errors
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

## NATIVE C++23 IMPLEMENTATION

Implement the game as a complete **native desktop application written in idiomatic C++23**, using **SDL3 for graphics, windowing, input, and audio**, **EnTT for the entity component system**, and **GLM for mathematical operations**.

Deliver a buildable source project and a working executable for the available target platform. Opening the executable must lead directly to the title screen with all necessary assets available.

### BUILD AND PROJECT STRUCTURE

- Use **CMake** with target-based configuration and explicitly require C++23 without compiler-specific language extensions.
- Organize source into focused modules for application lifecycle, input, game states, ECS systems, rendering, audio, assets, collision, level loading, and progression. Prefer ordinary headers and source files for portable builds; do not require C++ language modules.
- Use imported dependency targets. Support installed dependencies and document a reproducible dependency setup with pinned releases or commit hashes; avoid dependencies that silently track moving branches.
- Use SDL3 APIs throughout. Do not mix SDL2 initialization, event types, rendering calls, or audio conventions into SDL3 code.
- Compile with useful warnings on the supported compiler, fix project warnings, and keep third-party warning policy separate.
- Provide concise configure, build, and run instructions, including required compiler and dependency versions. Verify the actual target platform rather than claiming untested portability.
- Package assets alongside the executable or embed them. Resolve packaged resources independently of the process working directory.
- Runtime gameplay must work offline without downloads, external services, a browser, or a development server.

### IDIOMATIC C++23 AND STANDARD LIBRARY USAGE

Write modern C++ with clear ownership, value semantics, strong types, and small cohesive functions. Do not merely translate JavaScript into C++ syntax or wrap a C-style program in classes.

- Use RAII for resource lifetime and deterministic cleanup. Owning types must establish valid invariants and release their resources automatically.
- Prefer values and automatic storage. Use `std::unique_ptr` for necessary exclusive heap ownership; use `std::shared_ptr` only when ownership is genuinely shared. Raw pointers and references must be non-owning with understandable lifetimes.
- Represent fallible initialization and recoverable operations with `[[nodiscard]] std::expected<T, Error>`, using useful structured errors and diagnostic context. Use `std::optional<T>` for normal absence, not as an error-reporting substitute.
- **Do not use exceptions for application error handling or control flow.** Check SDL failure results and report them through explicit error paths. Ensure application factories cannot expose partially initialized objects. Document the policy for fatal allocation failure and any unavoidable dependency behavior rather than claiming standard containers cannot fail.
- Pair acquisition and release in suitable owners: custom-deleter smart pointers for SDL handles, and move-only RAII types for subsystem initialization or resources requiring additional state. Owning SDL handles should not be exposed for callers to destroy manually.
- Arrange destruction so audio activity stops and dependent resources are released before their SDL subsystems shut down. RAII ownership must also cover early failures.
- Use `std::vector`, `std::array`, `std::string`, and other standard containers according to actual storage needs. Use `std::span` for borrowed contiguous sequences and `std::string_view` for borrowed text; do not store borrowed views beyond their backing storage's lifetime.
- Use `std::byte` for raw binary data, `std::filesystem::path` for filesystem paths, and `std::chrono` durations/time points for timekeeping. Use `<random>` facilities with an explicit engine and optional reproducible seed.
- Use `enum class` for discrete states and categories; use named structs for meaningful identifiers, configuration, and results. Avoid magic numbers, untyped state integers, C-style casts, manual owning `new`/`delete`, C allocation routines, and preprocessor macros where ordinary language features suffice.
- Use `const`, `constexpr`, `noexcept`, standard algorithms, ranges, and formatting where they improve clarity and the verified toolchain supports them. Do not mark potentially throwing operations `noexcept` merely for style, and do not force ranges or templates onto simple code.
- Keep public interfaces narrow and dependencies explicit. Avoid global mutable state, singleton service locators, unnecessary inheritance, and speculative generic frameworks.

### ENTT ENTITY COMPONENT SYSTEM

Use an `entt::registry` as the authoritative store for gameplay entities and their components, rather than maintaining a separate object hierarchy that duplicates gameplay state.

- Model Pete, enemies, bosses, projectiles, bunnies, pickups, and interactive barriers with composable data components.
- Suitable components include transform, velocity, collider, sprite/animation, health, weapon state, projectile data, AI state, pickup data, rescue status, and lifetime. Use tags when an entity needs only classification.
- Keep components primarily as data. Implement input, movement, AI, combat, collision, pickup/rescue handling, animation, and lifetime processing as focused systems operating on EnTT views or justified groups.
- Keep shared services such as rendering, audio, asset ownership, level data, and game-session progression outside individual entity components and pass them explicitly to systems.
- Use `entt::entity` handles with validity checks where needed. Never retain component references across operations that can invalidate them.
- Defer entity destruction and unsafe structural mutations until a suitable phase boundary. Do not invalidate an active view iteration while processing collisions, deaths, drops, or stage transitions.
- Specify the update order so movement, collision, damage, rescue events, removals, and stage completion remain coherent. Award score, consume pickups, and count rescued bunnies exactly once.
- Reset per-stage entities cleanly while preserving the intended session state: lives, score, acquired weapons, difficulty, and progression according to the game's rules.

### GLM MATH AND COLLISION

- Use GLM vector types for positions, velocities, directions, camera coordinates, and other appropriate spatial quantities; avoid a parallel homemade vector library.
- State coordinate conventions explicitly, including world units, screen axis direction, and angle units. Keep world-space calculations separate from screen-space projection.
- Normalize diagonal movement so it has the same speed as movement along one axis. Guard normalization of zero-length vectors and preserve an intentional last firing direction when stationary.
- Use clear collision shapes such as circles and axis-aligned boxes. Keep collision routines independent of rendering and use a spatial grid or other appropriate broad phase for dense scenes.
- Account for fast projectiles with swept collision or another reliable approach that prevents tunneling. Handle corner collisions and locked barriers consistently.

### SDL3 RENDERING, INPUT, AND AUDIO

- Use SDL3's accelerated 2D rendering API for sprites, textures, backgrounds, HUD, and effects. Batch or minimize redundant state changes where useful, cull off-camera content, and reuse textures instead of creating GPU resources every frame.
- Use a fixed logical gameplay resolution with appropriate presentation scaling and letterboxing. Preserve the original sprite aesthetic through intentional pixel scaling and texture filtering; support window resizing and high-density displays.
- Maintain a larger scrolling world, a bounded camera, and separate world and HUD rendering. Define a stable render order for floors, scenery, actors, projectiles, effects, and interface elements.
- Handle the SDL event loop, quit events, keyboard state, and distinct pressed/released actions correctly. Support eight-direction movement, directional firing, weapon changes, menus, restart, and pause.
- On focus loss, pause appropriately and clear transient input state so keys do not remain stuck. Continue processing window events while paused.
- Use SDL3 audio devices/streams for original or generated sound effects and music where practical. Audio failure must not prevent the game from being playable; report it and continue silently.
- Keep audio-thread or callback work bounded, with no blocking I/O, ECS access, or unsafe shared-state mutation. Stop audio processing before destroying data it can access.
- If supplementary image/font libraries are needed, use SDL3-compatible versions, document them, and package required fonts and assets. Generated or embedded assets are acceptable if visually coherent.

### MAIN LOOP, PERFORMANCE, AND VALIDATION

- Use a fixed simulation timestep with an accumulator, independent presentation timing, and optional render interpolation. Clamp excessive elapsed time and bound catch-up work to avoid a simulation spiral after stalls.
- Pause must stop gameplay simulation and gameplay timers while leaving UI input and rendering responsive. Resuming must not apply a large accumulated time jump.
- Make movement, weapon cooldowns, invulnerability, AI, animation, and power-up expiration depend on simulation time rather than frame count.
- Represent title, gameplay, pause, stage completion, game over, and victory as explicit states with controlled transitions. Initialize and reset each state's resources and data deliberately.
- Avoid needless allocation in frequently executed systems. Reserve reusable buffers where appropriate, bound particles and other temporary effects, and profile actual bottlenecks before adding concurrency or complexity.
- Verify a clean configure/build and actual interactive launch. Check representative combat, diagonal movement, collision, rescue counting, weapon/ammo behavior, death/restart, pause/resume, boss defeat, and stage transitions.
- Use focused tests for collision edge cases and progression invariants where they provide meaningful coverage. Use sanitizers when supported to investigate lifetime errors, undefined behavior, and invalid ECS access.
- Provide the complete source, CMake configuration, assets, and run instructions. Clearly distinguish checks performed from checks unavailable in the environment. A design document, uncompiled code dump, or browser substitute does not satisfy this requirement.

Keep the full game scope and gameplay requirements above. Choosing native C++ must not reduce the result to a technology demonstration or a single playable room.

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
