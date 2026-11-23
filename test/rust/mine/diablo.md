# Cathedral of Ash — Complete Gothic Action RPG Benchmark

## Technology Requirements

**Language:** Rust 1.100  
**Edition:** Rust 2024  
**Engine:** Bevy 0.20  
**Primary target:** Native desktop  
**Rendering:** Bevy's rendering infrastructure  
**Architecture:** ECS-driven, modular, data-oriented  
**Game genre:** Isometric gothic action RPG  
**Reference:** Original Diablo (1996)

---

# 1. Primary Objective

Create a complete, playable isometric gothic action RPG inspired by the original **Diablo**, using Rust 1.100 and Bevy 0.20.

Reproduce the recognizable gameplay structure, atmosphere, pacing, controls, mechanics, progression, world behavior, and overall experience as faithfully as reasonably possible.

The result must be a functioning game, not a mockup, static demonstration, walking simulator, or simplified scene.

Implement the systems necessary for a coherent experience, including:

- Real-time isometric movement and combat
- Character classes and progression
- Procedurally generated environments
- Persistent interconnected areas
- Towns, wilderness, cathedral interiors, and underground labyrinths
- Distinctive enemies and boss encounters
- Equipment, inventory, loot, and itemization
- Merchants, selling, and buyback
- NPC dialogue and quests
- Fog of war and dynamic lighting
- Save/load functionality
- Animated health and mana orbs
- Responsive user interfaces
- Audio and visual feedback

Use original names, lore, characters, monsters, dialogue, and assets. Do not reproduce proprietary Diablo assets or named characters.

**The game must be immediately playable when launched.**

Do not wait for additional feature specifications. Determine the necessary supporting systems and implement them.

---

# 2. Rust and Bevy Requirements

## 2.1 Language

Use Rust 1.100 with Edition 2024.

Follow modern Rust conventions:

- Strong typing
- Explicit ownership
- Idiomatic error handling
- Small, focused abstractions
- Minimal unnecessary allocation
- Avoidance of unnecessary cloning
- Clear module boundaries
- Appropriate use of traits and generics
- No unnecessary `unsafe`
- No unnecessary interior mutability
- Minimal runtime panics

Use `Result` for recoverable errors.

Avoid `.unwrap()` and `.expect()` in runtime paths where failure can be handled gracefully.

Prefer compile-time correctness over runtime workarounds.

## 2.2 Bevy 0.20

Use APIs compatible with **Bevy 0.20 specifically**.

Do not blindly copy examples from older Bevy versions.

Verify API availability and signatures against the installed Bevy version.

Use Bevy ECS for:

- Player and NPC entities
- Enemies and bosses
- Combat
- Projectiles
- Loot
- Interactable objects
- Doors and stairs
- Lighting
- Camera behavior
- Gameplay state
- Animation state

Use resources for globally shared data and area/world management.

Use events/messages for decoupled communication between gameplay systems where appropriate.

Use Bevy states for major application modes, including:

- Main menu
- Character selection
- Playing
- Paused
- Dialogue
- Game over

Do not create a giant monolithic game system.

## 2.3 Scheduling

Organize systems into meaningful schedules and system sets.

Ensure deterministic ordering where gameplay dependencies require it.

For example:

1. Read player input
2. Resolve interaction intent
3. Update navigation
4. Move actors
5. Resolve combat
6. Apply damage
7. Process deaths
8. Update loot and quests
9. Update visibility
10. Synchronize presentation

Use fixed-timestep simulation where appropriate for gameplay mechanics.

Rendering and visual interpolation should remain smooth independently of simulation timing.

Avoid introducing unnecessary ordering constraints that prevent ECS parallelism.

---

# 3. Project Architecture

Use a modular architecture with clear responsibility boundaries.

Suggested modules:

```text
src/
├── main.rs
├── app.rs
├── game/
│   ├── mod.rs
│   ├── states.rs
│   ├── config.rs
│   └── events.rs
├── world/
│   ├── mod.rs
│   ├── areas.rs
│   ├── generation.rs
│   ├── terrain.rs
│   ├── transitions.rs
│   ├── persistence.rs
│   ├── navigation.rs
│   └── visibility.rs
├── actors/
│   ├── mod.rs
│   ├── player.rs
│   ├── enemies.rs
│   ├── bosses.rs
│   ├── npcs.rs
│   └── animation.rs
├── combat/
│   ├── mod.rs
│   ├── damage.rs
│   ├── targeting.rs
│   ├── spells.rs
│   └── projectiles.rs
├── items/
│   ├── mod.rs
│   ├── inventory.rs
│   ├── equipment.rs
│   ├── loot.rs
│   └── merchants.rs
├── quests/
│   ├── mod.rs
│   ├── journal.rs
│   ├── objectives.rs
│   └── dialogue.rs
├── rendering/
│   ├── mod.rs
│   ├── camera.rs
│   ├── tiles.rs
│   ├── lighting.rs
│   ├── effects.rs
│   └── sprites.rs
├── ui/
│   ├── mod.rs
│   ├── hud.rs
│   ├── orbs.rs
│   ├── inventory.rs
│   ├── journal.rs
│   ├── dialogue.rs
│   ├── shop.rs
│   └── automap.rs
├── audio/
│   └── mod.rs
└── save/
    ├── mod.rs
    └── format.rs
```

This is a suggested responsibility structure, not a requirement to create every file immediately.

Prefer cohesive modules over excessive fragmentation.

Avoid circular dependencies.

Game logic should not depend directly on UI implementation details.

Rendering should consume gameplay state rather than own it.

---

# 4. Game World

Create a persistent, interconnected world containing several distinct environment categories.

## 4.1 Town

The town must resemble an actual medieval settlement.

Include:

- Grass
- Dirt and cobblestone roads
- Houses
- Merchant buildings
- A central plaza
- A healer's residence
- A cathedral
- Vegetation
- Fences
- Wells or ponds
- Outdoor lighting
- Distinctive landmarks
- Clearly identifiable exits

Buildings should have actual architectural forms.

Do not represent houses as dungeon tiles with different colors.

**The town is a safe zone. No hostile enemies may spawn there.**

Only NPCs and nonhostile entities should inhabit town.

## 4.2 Wilderness

Create a genuinely outdoor environment.

Include:

- Natural grass
- Dirt paths
- Roads
- Trees
- Rocks
- Vegetation
- Streams
- Ponds
- Clearings
- Ruins
- Shrines
- Cave entrances
- Hostile creatures

Outdoor terrain must not resemble a dungeon floor recolored green.

Use terrain-specific materials, geometry, decorations, and lighting.

Outdoor areas should generally provide more open traversal than underground labyrinths.

## 4.3 Cathedral Interiors

Cathedral floors should contain recognizable architectural features:

- Naves
- Transepts
- Chapels
- Columns
- Stone walls
- Doors
- Stairways
- Side chambers
- Corridors
- Decorative structures

Their layouts should remain rectilinear and architectural.

## 4.4 Underground Floors

Basements, crypts, and dungeons should feel labyrinthine.

Use:

- Narrow corridors
- Branching paths
- Dead ends
- Intersections
- Rooms
- Loops
- Chambers
- Occasional larger halls
- Distinct architectural variations

Do not generate every floor as an oval, rounded blob, or simple chain of rooms.

## 4.5 Boss Arenas

Boss floors are exceptions to normal labyrinth generation.

Generate large open arenas containing:

- One boss
- No ordinary enemies
- Arena architecture
- Lighting
- Entrance and exit
- Optional environmental hazards
- Optional decorative structures

The player must have room to maneuver.

---

# 5. Procedural Generation

## 5.1 Randomized Layouts

Generate new layouts when an area is first created.

Use an appropriate combination of:

- Randomized depth-first maze carving
- Graph-based room connectivity
- Corridor generation
- Controlled loops
- Dead ends
- Branching structures
- Irregular rooms
- Architectural constraints

Do not rely exclusively on random rectangular room placement.

## 5.2 Deterministic Randomness

Use a dedicated seeded pseudorandom generator.

Do not rely on uncontrolled global randomness for world generation.

Each new game should receive a world seed.

Area generation should derive stable area-specific seeds from the world seed and area identity.

This enables reproducibility and debugging.

## 5.3 Connectivity Validation

Generated areas must be traversable.

Verify:

- Entrances connect to exits
- Quest locations are reachable
- Stairs are accessible
- Boss arenas are accessible
- Important NPCs are reachable
- No required objective is isolated behind impassable geometry

Use flood-fill, graph traversal, or equivalent connectivity validation.

Regenerate or repair invalid layouts.

## 5.4 Persistent Generation

Once an area has been generated, its layout must remain unchanged throughout the saved game.

Revisiting a floor must never regenerate its layout.

---

# 6. World Persistence

Implement object permanence across area transitions.

Persist:

- Area layouts
- Opened and closed doors
- Enemy deaths
- Boss deaths
- Loot
- Picked-up items
- Explored map regions
- Quest-related environmental changes
- Unlocked passages
- Relevant NPC state

If the player kills an enemy, leaves, and returns, that enemy must remain dead.

If the player opens a door, leaves, and returns, the door must remain open.

## 6.1 Area Storage

Give every area a stable identifier.

Store persistent state independently of active ECS entities.

When leaving an area:

1. Commit relevant entity changes to persistent area state.
2. Despawn or unload area-specific runtime entities.
3. Preserve persistent records.
4. Load the destination area.
5. Reconstruct runtime entities from persistent state.

Avoid relying on transient Bevy entity IDs as permanent save identifiers.

Use stable gameplay IDs instead.

---

# 7. Spatially Correct Area Transitions

Area transitions must preserve directional continuity.

Examples:

- South exit → North entrance
- North exit → South entrance
- East exit → West entrance
- West exit → East entrance

Returning through the same entrance must return the player to the original exit.

A transition should have stable identifiers and explicit source/destination relationships.

For example:

```rust
struct AreaTransition {
    id: TransitionId,
    source_area: AreaId,
    destination_area: AreaId,
    source_direction: CardinalDirection,
    destination_direction: CardinalDirection,
    destination_transition: TransitionId,
}
```

Do not teleport the player to arbitrary spawn positions.

Place the player immediately inside the corresponding destination entrance.

Ensure that the arrival position is walkable and not obstructed.

---

# 8. Doors and Stairways

Do not represent transitions using tiny colored squares or generic markers.

Transitions must be recognizable architectural objects.

Implement:

- Single doors
- Double doors
- Open doors
- Closed doors
- Staircases
- Staircases behind doors
- Double doors opening onto staircases
- Exterior doors with visible light
- Interior wall openings

## 8.1 Door Behavior

Closed doors require interaction.

The player approaches, opens the door, and can then pass through.

Door state persists.

Double doors should visually behave as double doors.

## 8.2 Staircases

Stairs must appear as actual steps in perspective.

Support:

- Ascending
- Descending
- Wall-integrated staircases
- Staircases behind doors
- Open stairwells

## 8.3 Exterior Lighting

Exterior doors should show visible light through their openings.

Opening the door should reveal the illuminated passage.

The player should be able to distinguish an outdoor exit from an ordinary interior doorway.

---

# 9. Floor Numbering

Use proper floor designations.

Above-ground:

- 1F
- 2F
- 3F
- 4F

Below-ground:

- B1F
- B2F
- B3F
- B4F

Ascending increases above-ground floor numbers.

Descending deeper increases basement floor numbers.

Never use negative floor labels.

Town and wilderness should display their area names instead.

---

# 10. Player Controls

Use mouse-driven controls.

## 10.1 Movement

Left-click walkable ground to move.

Holding the left mouse button must continuously update the movement target to follow the cursor.

Do not use only the initial click position.

Support click-to-move navigation around obstacles.

## 10.2 Combat

Left-click an enemy to attack.

If out of range, navigate toward the target.

Attack when within range.

Holding the mouse button should allow continued targeting and attacking.

## 10.3 Inventory

Left-click equipment to equip it.

Right-click an item to sell it when an appropriate merchant interaction is active.

Never use the same left-click action for both equipping and selling.

## 10.4 Keyboard

Support shortcuts for:

- Inventory
- Quest journal
- Character sheet
- Automap
- Abilities
- Health potions
- Mana potions
- Pause/menu

All keyboard input should respect UI focus.

Clicking a UI element must not accidentally issue movement or combat commands.

---

# 11. Navigation and Collision

Implement proper pathfinding.

Use A* or another appropriate pathfinding algorithm for tile-based navigation.

Support:

- Static walls
- Buildings
- Trees
- Rocks
- Doors
- Dynamic actor obstruction where appropriate
- Path recalculation
- Enemy pursuit
- Player click-to-move

Do not allow characters to walk through impassable geometry.

Avoid recalculating full paths unnecessarily every frame.

Use sensible thresholds for target changes and path invalidation.

---

# 12. Combat

Implement real-time combat with:

- Attack timing
- Damage calculations
- Hit detection
- Attack range
- Recovery/cooldowns
- Armor mitigation
- Damage feedback
- Death
- XP rewards
- Loot drops

Enemies should have different:

- HP
- Damage
- Speed
- Aggression
- Detection range
- Attack patterns
- Resistances where appropriate

Include melee and ranged enemies.

## 12.1 Enemy AI

Enemies should support behavioral states such as:

- Idle
- Patrol
- Alert
- Pursuit
- Attack
- Recovery
- Dead

Avoid making every enemy behave identically.

## 12.2 Corpses

On death:

- Stop AI
- Disable attacks
- Remove living health bars
- Prevent further targeting
- Award XP
- Generate loot where appropriate
- Display a corpse or death animation

Corpses may fade or despawn after a configurable interval.

The enemy must remain permanently defeated in the persistent area state.

---

# 13. Boss Encounters

Boss floors contain exactly one hostile boss and no ordinary enemies.

Bosses should have:

- Unique names
- Larger health pools
- Distinct attacks
- Stronger damage
- Distinct visuals
- Appropriate rewards

When the boss detects or engages the player, display a dedicated boss interface at the top of the screen.

Include:

**Boss Name**

**Boss Health Bar**

The boss interface must not overlap the controls help panel.

When the boss dies, the interface disappears.

Boss defeat may unlock the next exit.

Boss death must persist.

---

# 14. Character Classes and Progression

Include selectable archetypes inspired by classic action RPG design, using original naming and content.

At minimum, support distinct playstyles such as:

- Melee-focused fighter
- Ranged specialist
- Magic-focused caster

Classes should differ meaningfully in:

- Starting statistics
- Equipment
- Abilities
- Combat effectiveness
- Progression tendencies

Include:

- Character level
- Experience
- Maximum health
- Maximum mana
- Strength
- Dexterity
- Vitality
- Magic
- Armor
- Damage
- Resistances where appropriate

Leveling should provide meaningful improvements.

---

# 15. Spells and Abilities

Implement usable abilities such as:

- Fire projectile
- Area nova
- Healing
- Additional class-appropriate abilities

Abilities should consume mana or another appropriate resource.

Include:

- Casting time
- Cooldowns where appropriate
- Range
- Damage or healing
- Visual effects
- Audio feedback

Spell effects must integrate with actual combat mechanics.

---

# 16. Items and Equipment

Implement a functional item system.

Item categories should include:

- Weapons
- Armor
- Potions
- Magical equipment
- Quest items
- Valuables

Equipment should modify player statistics.

Include item properties such as:

- Name
- Category
- Value
- Damage
- Armor
- Stat bonuses
- Rarity
- Requirements where appropriate

Items should use stable definitions and separate runtime instances.

Avoid duplicating all item data unnecessarily across ECS entities.

---

# 17. Loot

Enemies may drop:

- Gold
- Weapons
- Armor
- Potions
- Magical items

Loot should be clearly visible and interactable.

Clicking loot should collect it if inventory space permits.

Loot should remain persistent when leaving and returning to an area, unless intentionally removed by a documented gameplay rule.

---

# 18. Inventory and Equipment UI

Provide an inventory panel containing:

- Equipped weapon
- Equipped armor
- Inventory items
- Item tooltips
- Item statistics
- Gold
- Potion counts

Left-click equipment to equip it.

Inventory interactions must not accidentally trigger gameplay movement.

---

# 19. Merchants

Different merchants should have different inventories.

Examples:

Blacksmith:

- Weapons
- Armor

Occult merchant:

- Magical equipment
- Mana potions

Healer:

- Healing services
- Consumables

Shop access must require interaction with the relevant merchant.

Do not allow the player to open and use merchant services from arbitrary locations.

---

# 20. Selling and Buyback

Right-click an inventory item to sell it while trading with a merchant.

Maintain a buyback list for recently sold items.

Buyback must work without breaking normal purchasing.

Ensure:

- Clickable hitboxes match rendered items
- Buyback prices are correct
- Gold is deducted correctly
- Inventory capacity is respected
- Purchased items are added correctly
- Buyback entries disappear after repurchase

Use a shared UI layout model rather than independent rendering and input coordinate calculations.

---

# 21. NPC Dialogue

NPCs should use popup dialogue panels.

Regular dialogue contains:

- NPC name
- Dialogue text
- Dismiss button

Merchants may include a Trade action.

Healers may include a Heal action.

Do not use temporary floating text as the primary conversation system.

---

# 22. Quest System

Implement complete quest functionality.

Quests require:

- Unique quest ID
- Quest giver
- Title
- Description
- Flavor text
- Objectives
- Progress
- Acceptance state
- Completion state
- Turn-in state
- Rewards

Support objectives such as:

- Kill enemies
- Kill a particular enemy type
- Reach an area
- Reach a floor
- Defeat a boss
- Collect an item
- Explore a location

## 22.1 Acceptance

Quest dialogue should explain the quest's narrative context.

Display:

- Quest title
- Lore/flavor dialogue
- Objective
- Reward
- Accept
- Decline

Only acceptance adds the quest to the journal.

## 22.2 Completion

Completing objectives marks the quest ready for turn-in.

The player returns to the quest giver.

Rewards are granted after the completion dialogue and turn-in interaction.

---

# 23. Quest Journal

Press `J` to open the quest journal.

Display each quest in a separate, clearly spaced entry.

Include:

- Title
- Description
- Objective
- Progress
- Reward
- Status

Text must wrap properly.

No overlapping text.

Use Bevy UI layout facilities rather than manually guessing text positions.

Support scrolling when the journal contains many quests.

---

# 24. Fog of War

Implement three visibility states:

**Unexplored:** Completely hidden.

**Explored:** Visible but heavily dimmed.

**Currently Visible:** Fully illuminated according to local lighting.

Use a visibility algorithm appropriate for tile-based environments.

Visibility must account for walls and opaque obstacles.

Persist explored cells across area transitions and saves.

---

# 25. Lighting

Use lighting appropriate for a gothic action RPG.

Include:

- Torches
- Firelight
- Spell illumination
- Ambient light
- Outdoor illumination
- Dark underground environments

Lighting should distinguish environment types.

Town and wilderness should not have the same illumination profile as underground crypts.

Use Bevy-compatible rendering techniques without requiring unnecessary custom GPU infrastructure.

Prefer efficient solutions appropriate to the actual scene representation.

---

# 26. Isometric Rendering

Use an isometric presentation.

The camera should follow the player smoothly.

World-to-screen projection must be consistent.

Ensure proper draw ordering for:

- Terrain
- Walls
- Buildings
- Doors
- Stairs
- Actors
- Corpses
- Loot
- Effects

Characters must appear correctly in front of or behind environmental objects.

Avoid incorrect depth ordering and clipping.

---

# 27. Floor Mosaic Appearance

Dungeon floor tiles should contain irregular abstract shading.

Do not simply stamp identical marks onto every tile.

Vary:

- Polygon shape
- Size
- Position
- Orientation
- Opacity
- Brightness
- Number of facets

Most tiles should remain relatively unmarked.

Avoid repetitive stains and obvious procedural patterns.

Use deterministic variation so the same tile retains its appearance.

---

# 28. Health and Mana Orbs

The HUD should include large circular:

- Red health orb
- Blue mana orb

Render these as animated liquid-filled glass vessels.

Include:

- Animated liquid surface
- Subtle wave motion
- Variable fill level
- Rim/frame
- Highlights
- Mild reflections

Health and mana changes must update the liquid levels.

Use efficient Bevy-compatible rendering, such as custom materials, meshes, or shaders where appropriate.

Do not substitute flat colored circles.

---

# 29. HUD

Display:

- Health orb
- Mana orb
- Ability slots
- Current area/floor
- Character level
- Gold
- Potion information

The HUD must remain readable at common desktop resolutions.

Use responsive layout.

Do not allow text or panels to overlap.

---

# 30. Boss HUD

Reserve a separate region for boss information.

Do not overlap:

- Controls help
- Inventory
- Dialogue
- Main HUD

The boss bar appears only during an active encounter.

It disappears when the boss dies.

---

# 31. Automap

Press `M` to open the automap.

Show:

- Explored geometry
- Player position
- Known doors
- Known stairs
- Important discovered transitions

Do not reveal unexplored areas.

---

# 32. Audio

Include audio feedback for:

- Attacks
- Hits
- Deaths
- Spells
- Loot pickup
- Doors
- Stairs
- UI interaction
- Quest completion
- Leveling

Add appropriate ambient sound for:

- Town
- Wilderness
- Cathedral
- Crypts
- Boss encounters

Use original or appropriately licensed assets.

---

# 33. Save and Load

Implement native save/load functionality.

Use a versioned serialization format.

Persist:

- World seed
- Character class
- Character level
- XP
- Statistics
- Health/mana
- Gold
- Inventory
- Equipment
- Quest state
- Completed quests
- Merchant buyback
- Generated area layouts
- Explored cells
- Enemy deaths
- Boss deaths
- Door states
- Loot state
- Current area
- Player position
- Progression flags

Do not serialize raw transient ECS entity IDs as permanent references.

Save data should use stable IDs and serializable gameplay state.

Support graceful handling of missing, corrupted, or incompatible saves.

---

# 34. Performance

Optimize for smooth native desktop gameplay.

Avoid:

- Excessive entity spawning/despawning
- Full-map regeneration
- Unnecessary pathfinding every frame
- Repeated expensive visibility calculations
- Excessive allocations
- Unnecessary mesh reconstruction
- Excessive material duplication
- Unbounded particle effects

Use spatial partitioning or other acceleration structures where beneficial.

Only update systems when their inputs have changed where practical.

---

# 35. Testing

Implement automated tests for critical gameplay invariants.

## World Generation Tests

Verify:

- Entrances and exits are connected
- Required objectives are reachable
- Boss floors contain exactly one boss
- Boss floors contain no ordinary enemies
- Non-boss dungeon layouts are sufficiently labyrinthine
- Generated areas remain deterministic for a given seed

## Persistence Tests

Verify:

- Killed enemies stay dead
- Bosses remain defeated
- Opened doors remain open
- Loot remains persistent
- Explored territory remains explored
- Save/load restores state correctly

## Transition Tests

Verify:

- South exits lead to north entrances
- North exits lead to south entrances
- East exits lead to west entrances
- West exits lead to east entrances
- Returning through a transition leads to the correct previous area
- Arrival locations are walkable
- Floor numbering is correct

## Inventory and Merchant Tests

Verify:

- Equipment modifies statistics
- Selling grants gold
- Buyback deducts gold
- Buyback restores the correct item
- Normal purchasing still works with buyback entries
- Merchant access is proximity-gated
- Inventory capacity is enforced

## Quest Tests

Verify:

- Declining does not accept a quest
- Accepting adds it to the journal
- Objective progress updates
- Completion becomes available
- Turn-in grants rewards once
- Rewards cannot be claimed repeatedly

---

# 36. Build and Validation

The final project must compile using Rust 1.100 and Bevy 0.20.

Run:

```bash
cargo fmt --all -- --check
cargo check --all-targets
cargo clippy --all-targets -- -D warnings
cargo test
```

Resolve build errors before delivery.

Do not claim the project compiles unless the build has actually been executed successfully.

Do not substitute JavaScript, HTML Canvas, or a browser-only implementation for the required Rust/Bevy application.

---

# 37. Playability Validation

Verify the following manually or through appropriate automated integration tests:

- Game launches
- Player can move
- Holding left mouse continuously retargets movement
- Pathfinding navigates obstacles
- Enemies can be attacked
- Enemies can die
- Corpses lose health bars
- Loot can be collected
- Inventory works
- Equipment works
- Shops work
- Selling uses right-click
- Buyback works
- Normal buying works after buyback
- Quests can be accepted and declined
- Journal text does not overlap
- Quest objectives update
- Quest turn-in works
- Town contains no hostile enemies
- Wilderness looks outdoors
- Town looks like a settlement
- Doors look like doors
- Stairs look like stairs
- Doors open and remain open
- 1F connects to outdoors
- Floors can be ascended and descended
- Transitions preserve spatial direction
- Procedural layouts remain persistent
- Enemies stay dead when revisiting
- Boss floors contain only the boss
- Boss UI appears on encounter
- Boss UI disappears on death
- Save/load restores the same world

---

# 38. Implementation Priorities

When time or context is constrained, prioritize:

1. Reliable application startup
2. Input and movement
3. Camera and isometric rendering
4. World generation
5. Navigation and collision
6. Area transitions
7. Persistent world state
8. Combat
9. Enemies and bosses
10. Inventory and equipment
11. Loot
12. NPCs
13. Shops and buyback
14. Quests and dialogue
15. Fog of war
16. Lighting
17. Character progression
18. HUD and interface polish
19. Audio
20. Additional content and refinement

Do not sacrifice foundational correctness for superficial visual improvements.

---

# 39. Completion Standard

The finished game should allow a player to:

1. Launch the native application.
2. Select a character.
3. Enter a recognizable town.
4. Speak with NPCs.
5. Accept quests.
6. Purchase equipment.
7. Enter the cathedral.
8. Explore above-ground floors.
9. Leave through exterior doors.
10. Explore wilderness.
11. Discover dungeon entrances.
12. Descend into procedural labyrinths.
13. Fight enemies.
14. Collect loot.
15. Defeat bosses.
16. Return to previously visited areas.
17. Find those areas unchanged.
18. Return to town.
19. Sell equipment.
20. Buy back sold items.
21. Turn in quests.
22. Gain experience.
23. Improve equipment and abilities.
24. Save the game.
25. Reload and continue the same persistent world.

The game must feel like a coherent gothic action RPG rather than a collection of disconnected features.

---

# 40. Final Instructions

You are responsible for:

- Architecture
- Dependencies
- Implementation
- Gameplay systems
- Rendering
- Procedural generation
- Persistent world state
- User interface
- Integration
- Debugging
- Testing
- Performance
- Final polish

Use Rust 1.100, Edition 2024, and Bevy 0.20.

Prefer functional implementations over placeholders.

Where exact reproduction is impractical, implement the closest reasonable functional approximation.

Do not wait for the user to enumerate obvious supporting systems.

Do not provide only architecture diagrams, pseudocode, or a development plan.

Create the actual project, source code, assets, and supporting files.

Compile and test the result.

**The game must be immediately playable when launched.**

**Do not explain how you would build it. Build it.**
