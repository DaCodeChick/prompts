# High-Fidelity Minecraft-Style Browser Game

Create a **fully playable, polished 3D voxel sandbox game that recreates the look, feel, controls, and core gameplay loop of classic Minecraft as faithfully as possible**.

This is not a request for a small voxel-tech demo. The finished result should feel like an actual survival sandbox game: a procedurally generated world, mining, building, inventory management, crafting, creatures, day/night progression, exploration, and survival mechanics.

The game must run directly in a **desktop web browser**.

## PRIMARY GOAL

When the game starts, the player should immediately recognize the experience:

* First-person voxel exploration
* Large procedurally generated block world
* Familiar block proportions and chunky pixel-art aesthetic
* Break and place individual blocks
* Hotbar and inventory
* Crafting
* Health and hunger
* Survival and creative gameplay
* Animals and hostile creatures
* Trees, caves, ores, water, terrain variation, and structures
* Day/night cycle
* Minecraft-like movement, interaction timing, reach distance, camera behavior, and general game feel

Do **not** stop after implementing terrain generation and block placement. Build an actual game around the voxel engine.

Use original or procedurally generated textures, sounds, names, UI artwork, and other assets rather than copying proprietary Minecraft assets directly.

---

# 1. WORLD GENERATION

Generate a convincing procedural voxel world divided into chunks.

The terrain should include:

* Plains
* Forests
* Hills
* Mountains
* Rivers
* Lakes
* Oceans
* Beaches
* Deserts
* Snowy regions
* Underground caves
* Ravines where practical
* Bedrock/deep-world boundary
* Distinct underground layers

Terrain should use coherent noise rather than random block placement.

Biome transitions should be reasonably gradual.

Generate appropriate vegetation:

* Trees with trunks and leaf canopies
* Flowers
* Grass
* Shrubs or similar decorative vegetation
* Cacti in dry biomes
* Mushrooms where appropriate

Underground generation should contain resources at different depths, including equivalents of:

* Coal
* Iron
* Copper
* Gold
* Redstone-like material
* Diamond-like rare material

Do not expose every ore on the surface.

Implement deterministic world seeds so entering the same seed generates the same world.

---

# 2. VOXEL ENGINE

Use chunk-based voxel rendering.

Do **not** render every cube as six independent faces.

Implement:

* Hidden-face culling
* Chunk meshes
* Mesh rebuilding when blocks change
* Frustum culling
* Reasonable chunk loading/unloading
* Separate handling for transparent blocks
* Texture atlas or similarly efficient material system

Greedy meshing is strongly encouraged if practical.

The game should maintain smooth performance while presenting a world substantially larger than the immediately visible area.

Chunk generation should be distributed across frames or workers where appropriate so exploration does not constantly freeze the game.

---

# 3. VISUAL STYLE

Aim for the visual character of classic Minecraft:

* Cubic geometry
* Pixel-art block textures
* Bright but natural outdoor colors
* Square sun and moon
* Blocky clouds
* Atmospheric distance fog
* Distinct biome coloring
* Pixelated item icons
* Simple but readable particles

Blocks should have recognizable materials rather than merely being solid-colored cubes.

Include visually distinct equivalents of:

* Grass
* Dirt
* Stone
* Sand
* Gravel
* Logs
* Leaves
* Wooden planks
* Cobblestone
* Glass
* Water
* Snow
* Ice
* Various ores
* Crafting/workstation blocks
* Furnace
* Chest
* Torch

Generate original textures procedurally if external assets are unavailable.

---

# 4. LIGHTING

Implement a voxel-appropriate lighting system.

Include:

* Sunlight
* Darkness underground
* Local light sources
* Torches
* Day/night brightness changes
* Basic ambient occlusion if feasible

Caves should actually become dark rather than remaining globally illuminated.

Torches placed underground should visibly illuminate nearby blocks.

---

# 5. DAY/NIGHT CYCLE

Implement a continuous day/night cycle.

The sun should travel across the sky and eventually be replaced by the moon.

Lighting and sky appearance should transition through:

**Morning → Day → Sunset → Night → Sunrise**

At night:

* Overall illumination decreases
* Stars become visible
* Hostile creatures become substantially more common
* Artificial lighting becomes important

Sunrise should gradually restore daylight rather than instantly changing the scene.

---

# 6. PLAYER CONTROLS

Use familiar first-person PC controls:

* **WASD** — movement
* **Mouse** — look
* **Space** — jump
* **Shift** — sneak/crouch
* **Ctrl** — sprint
* **Left Mouse** — attack/mine
* **Right Mouse** — place/use
* **1–9** — hotbar selection
* **Mouse Wheel** — cycle hotbar
* **E** — inventory
* **Esc** — pause/menu

Use pointer lock during gameplay.

Movement should feel grounded and responsive.

Implement:

* Gravity
* Collision
* Jumping
* Sprinting
* Sneaking
* Swimming
* Falling
* Fall damage
* Step handling where appropriate

The player must not walk through blocks or randomly become stuck in terrain.

---

# 7. BLOCK INTERACTION

Use voxel raycasting from the player's camera.

Highlight the targeted block with a thin selection outline.

Mining should not simply delete every block instantly in survival mode.

Different blocks should have:

* Hardness
* Mining duration
* Preferred tool type

While mining, display progressive cracking/damage feedback.

When destroyed:

* Play particles
* Play an appropriate sound
* Spawn or award the corresponding item

Block placement should occur against the selected face.

Prevent the player from placing solid blocks inside their own collision volume.

---

# 8. TOOLS

Implement tool categories:

* Pickaxe
* Axe
* Shovel
* Sword

Provide multiple material tiers such as:

* Wood
* Stone
* Iron
* Diamond-like high tier

Tools should differ in:

* Mining speed
* Durability
* Effectiveness
* Attack damage

Using the wrong tool should generally be slower.

Tool durability should decrease through use.

---

# 9. INVENTORY

Create a Minecraft-like inventory system.

Include:

* Nine-slot hotbar
* Main inventory grid
* Stackable items
* Maximum stack sizes
* Drag-and-drop interaction
* Item splitting
* Item swapping
* Tool durability
* Selected hotbar slot indicator
* Item tooltips

The hotbar must remain visible during normal gameplay.

The inventory should actually control what the player can place and use.

Do not make it decorative.

---

# 10. CRAFTING

Implement functional crafting.

The player's inventory should contain a small crafting grid.

A crafting-table-equivalent block should provide a larger crafting grid.

Recipes should include at minimum:

* Planks from logs
* Sticks
* Crafting table
* Wooden tools
* Stone tools
* Furnace
* Torches
* Chest
* Iron tools
* High-tier tools

Recipe matching must consume ingredients and create the resulting item.

Where reasonable, use spatial crafting recipes rather than turning crafting into a generic button menu.

---

# 11. FURNACE / SMELTING

Implement a furnace-like workstation.

It should have:

* Input slot
* Fuel slot
* Output slot
* Smelting progress
* Fuel consumption

Allow examples such as:

* Raw iron → iron ingot
* Raw gold → gold ingot
* Sand → glass
* Logs → charcoal

The furnace should continue processing according to game time while its interface is closed.

---

# 12. SURVIVAL SYSTEMS

Display:

* Health
* Hunger
* Armor if implemented
* Experience if implemented

Damage sources should include:

* Creatures
* Falling
* Drowning
* Environmental hazards

Hunger should decrease gradually and faster during strenuous activity.

Food should restore hunger.

Health regeneration should occur under suitable hunger conditions.

Death should display a death screen and allow the player to respawn.

Dropped inventory on death is strongly encouraged.

---

# 13. CREATURES

Populate the world with simple blocky creatures.

Include peaceful equivalents of animals such as:

* Cow
* Pig
* Sheep
* Chicken

Include hostile archetypes such as:

* Melee undead creature
* Skeleton-like ranged enemy
* Spider-like creature
* Explosive ambush creature

Creatures should not merely stand still.

Implement basic AI:

* Wandering
* Looking around
* Following/attacking targets
* Avoiding obvious obstacles
* Taking damage
* Knockback
* Death
* Item drops

Hostile creatures should generally become more important at night and in dark areas.

The explosive creature should have a warning phase before detonating and should be capable of damaging terrain.

---

# 14. COMBAT

Implement responsive first-person melee combat.

Include:

* Attack timing
* Damage
* Enemy knockback
* Player damage
* Brief damage indication
* Death animation/effect
* Weapon differences

Add a ranged weapon if feasible, with visible projectiles.

Combat should have enough feedback that hits feel intentional rather than enemies simply losing hidden numerical health.

---

# 15. WATER

Water must visually and mechanically behave differently from solid terrain.

Implement:

* Transparent/semi-transparent rendering
* Water surface
* Swimming
* Reduced movement speed
* Buoyancy
* Drowning

Basic propagation into neighboring empty blocks is encouraged if feasible.

Avoid rendering water as an opaque blue cube.

---

# 16. DROPPED ITEMS

Destroyed blocks and defeated creatures should be capable of producing item entities.

Dropped items should:

* Appear in the world
* Rotate/bob gently
* Fall under gravity
* Rest on terrain
* Be collected when approached
* Enter the player's inventory

Stack nearby compatible drops where practical for performance.

---

# 17. STRUCTURES

Procedurally generate occasional points of interest.

Examples:

* Small houses
* Wells
* Ruins
* Underground rooms
* Simple villages
* Mines

Structures should be uncommon enough that finding one feels meaningful.

---

# 18. GAME MODES

Provide at least:

## Survival

Normal health, hunger, inventory, mining speed, crafting, creatures, and resource progression.

## Creative

* Unlimited blocks
* Instant breaking
* Flight
* No survival damage
* Easy access to all available blocks/items

The mode should be selectable when creating a world.

---

# 19. MENUS

Create a polished title screen with options such as:

**Singleplayer**
**Create World**
**Options**
**Controls**

World creation should allow:

* World name
* Seed
* Survival/Creative selection

The pause menu should contain:

* Resume
* Options
* Controls
* Save & Quit

Do not immediately dump the player into the world without presentation.

---

# 20. SOUND

Include procedural or original sound effects for:

* Walking on different surfaces
* Mining
* Block destruction
* Block placement
* Item pickup
* Creature sounds
* Player damage
* Water
* UI interaction

Different surface materials should ideally produce different footsteps.

Add subtle ambient sound where useful.

Do not copy Minecraft's copyrighted audio files.

---

# 21. POLISH

Add small details that make the implementation feel like a game rather than a technical demonstration:

* Hand/tool visible in first person
* Hand swing while attacking/mining
* View bobbing
* Mining particles
* Block placement particles
* Footsteps
* Damage feedback
* Underwater visual effect
* Smooth fog
* Clouds
* Stars
* Sunrise/sunset transitions
* Crosshair
* Selected-block outline
* Item pickup animation
* Creature shadows if practical
* FOV change while sprinting
* Menu transitions
* Autosaving

---

# 22. SAVE SYSTEM

Persist worlds locally using an appropriate browser storage mechanism such as IndexedDB.

Save:

* World seed
* Modified/generated chunk data where necessary
* Player position
* Inventory
* Health
* Hunger
* Time of day
* Game mode
* Placed/destroyed blocks

A saved world should remain altered when reopened.

---

# 23. PERFORMANCE

Target approximately **60 FPS on a normal desktop PC**.

Prioritize:

* Chunk meshes rather than individual cube objects
* Face culling
* Frustum culling
* Limited creature simulation distance
* Efficient raycasting
* Reusing geometry/materials
* Avoiding unnecessary allocations every frame
* Incremental chunk generation
* Sensible render distance

Do not create thousands of individual scene objects when they can be combined into chunk meshes.

---

# 24. IMPLEMENTATION REQUIREMENTS

Use whatever browser-compatible technology is appropriate, such as:

* JavaScript
* WebGL
* Three.js
* Web Workers
* Web Audio
* IndexedDB

Prefer a **self-contained implementation with no runtime network dependency**. If a library is required, bundle it locally rather than relying on a CDN.

The result must be directly playable by opening/running the supplied project.

Do not replace major requested systems with fake UI, static scenery, placeholder buttons, or comments saying they would be implemented later.

---

# 25. DEVELOPMENT PRIORITIES

If implementation complexity requires prioritization, use this order:

1. Stable first-person controls and collision
2. Chunked procedural voxel terrain
3. Mining and block placement
4. Hotbar and inventory
5. World saving/loading
6. Lighting and day/night cycle
7. Crafting and tools
8. Survival mechanics
9. Creatures and combat
10. Water
11. Structures
12. Additional polish

A smaller **fully functioning** world is preferable to a gigantic world containing broken or fake systems.

---

# FINAL QUALITY BAR

Do not interpret this as:

> "Make a simple Minecraft-inspired voxel demo."

Interpret it as:

> **"Build as much of a genuine Minecraft-style survival sandbox as can reasonably fit into a browser implementation."**

The opening five minutes should already support the basic gameplay loop:

**spawn → explore → punch a tree → collect the dropped resource → craft basic materials → make a tool → mine stone → build a shelter → survive nightfall.**

Most importantly, **go beyond the minimum specification when doing so improves the experience**. Add sensible details, feedback, optimizations, environmental features, and quality-of-life improvements without waiting for them to be explicitly requested.

The final product should feel cohesive, responsive, visually convincing, and fun to explore—not like a voxel-engine proof of concept.
