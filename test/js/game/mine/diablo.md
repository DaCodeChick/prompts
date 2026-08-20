# Complete Isometric Gothic Action-RPG Recreation Benchmark

## Goal

Create a complete, immediately playable browser action RPG inspired by the gameplay structure, pacing, atmosphere, interaction model, procedural exploration, progression, and audiovisual presentation of the original **Diablo**.

The result must be an actual game, not a visual mockup, static scene, walking simulator, NPC showcase, or shallow tech demo.

It must include interconnected exploration, procedural areas, combat, enemies, bosses, loot, equipment, shops, quests, NPC interaction, persistent area state, dungeon progression, above-ground and below-ground environments, and a coherent gameplay loop.

Use original names, characters, dialogue, lore, visual assets, monsters, items, locations, and other creative content. **Do not use Diablo-specific character names such as Cain, Adria, Griswold, Pepin, or other copyrighted named characters.**

The game should capture the recognizable *kind* of experience without depending on copied game assets.

Build the game rather than explaining how you would build it.

---

# 1. Core Gameplay

The game is an isometric real-time action RPG.

The basic gameplay loop should be:

1. Explore town.
2. Talk to NPCs.
3. Receive quests.
4. Buy, sell, equip, and manage items.
5. Leave town for outdoor areas or enter interior areas.
6. Explore procedurally generated floors.
7. Fight enemies.
8. Find loot and gold.
9. Complete quest objectives.
10. Descend or ascend through interconnected areas.
11. Encounter dedicated boss floors.
12. Defeat bosses.
13. Return to quest givers.
14. Turn in quests.
15. Receive XP, gold, items, or other rewards.
16. Improve the character.
17. Continue into increasingly dangerous areas.

All major systems must function together.

---

# 2. Player Controls

The primary control scheme should be mouse-driven in the style of a classic isometric action RPG.

## Movement

- Left-clicking walkable ground moves the player there.
- Holding the left mouse button continuously updates the player's movement destination.
- The player must follow the mouse while the button remains held.
- Movement must NOT only use the location where the initial mouse-down occurred.
- Releasing the mouse stops continuous retargeting.
- Movement should feel responsive rather than sluggish or grid-snapped.

## Combat

- Left-click an enemy to attack it.
- If the enemy is outside melee range, automatically move toward it until it can be attacked.
- Continue attacking appropriately while the target remains valid.
- Dead enemies cannot be attacked.

## Items

- Left-click inventory equipment to equip it.
- Do NOT overload left-click with selling.
- Right-click an inventory item while near an appropriate merchant to sell it.

## Keyboard

Provide convenient shortcuts such as:

- `1`, `2`, `3`, etc. — abilities/spells
- `I` — inventory
- `J` — quest journal
- `C` — character sheet
- `M` — automap
- `Esc` — close current interface / open game menu
- Potion hotkeys for health and mana

Display controls unobtrusively.

Controls must be tested and actually work.

---

# 3. Camera and Presentation

Use an isometric viewpoint.

The camera should follow the player smoothly and keep the playable area readable.

The player should remain visually distinguishable from:

- enemies
- NPCs
- corpses
- loot
- scenery
- doors
- stairs
- walls

Do not allow interface panels to obscure important gameplay unnecessarily.

---

# 4. Visual Direction

Use a dark gothic medieval fantasy aesthetic.

The visual design should communicate:

- ancient stone
- candlelight
- ruins
- crypts
- cathedrals
- gloomy wilderness
- warm firelight
- deep shadows
- worn architecture
- oppressive underground environments

However, individual environment types must look genuinely different from one another.

A town should not look like a dungeon.

A wilderness should not look like a dungeon with green floor tiles.

---

# 5. Floor Tiles and Mosaic Shading

Dungeon and cathedral flooring should use isometric stone tiles.

Do NOT simply draw a repetitive identical diamond grid.

Individual stones should contain subtle abstract tonal variation resembling irregular mosaic shading.

The variation should consist of:

- irregular polygonal facets
- different sizes
- different orientations
- different positions
- different brightness levels
- occasional multi-facet stones
- many completely unmarked stones

The shading must NOT look like identical stains stamped onto every tile.

Avoid:

- repetitive centered diamonds
- identical polygons
- one mark on every tile
- excessive dark blotches
- greasy-looking stains
- obvious procedural repetition

Most tiles should have no prominent localized marking.

Broad tonal differences between stones can still provide visual richness.

---

# 6. Health and Mana Orbs

The main HUD should use large circular:

- red health orb
- blue mana orb

These should visually evoke liquid-filled glass vessels rather than flat circles.

The liquid surface must be animated.

Include:

- subtle wave motion
- moving liquid surface
- fluid level corresponding to current resource amount
- glass rim/frame
- mild highlights or reflections

Health decreases the visible red liquid level.

Mana decreases the visible blue liquid level.

The animation should remain inexpensive enough for smooth browser rendering.

---

# 7. Fog of War and Lighting

Implement real exploration visibility.

Areas should exist in three states:

### Unexplored

Completely hidden.

### Explored but not currently visible

Previously discovered terrain remains visible but significantly dimmed.

### Currently visible

Terrain near the player appears illuminated normally.

The player's visibility radius should update dynamically.

Torches and other light sources may add localized illumination.

The effect should produce the feeling of exploring darkness rather than merely applying a uniform dark overlay.

The automap should respect explored territory.

---

# 8. Town

The town must look and function like an actual medieval settlement.

It must NOT resemble another dungeon floor.

Include recognizable outdoor town elements such as:

- grass
- dirt or cobblestone roads
- central paths
- plaza or gathering space
- houses
- merchant buildings
- healer/residential structures
- cathedral or major landmark
- fences or walls where appropriate
- ponds, wells, vegetation, or other environmental details
- exterior lighting
- clearly identifiable exits

Buildings should have visible architectural mass rather than merely being rectangles drawn on dungeon flooring.

## Town Safety

The town is a safe zone.

**No hostile enemies may spawn in town.**

Only friendly NPCs and environmental entities should be present.

---

# 9. NPCs

Create original NPCs with original names.

NPCs should have roles such as:

- blacksmith
- healer
- occult merchant
- scholar
- quest giver
- lore NPC

NPCs should not simply emit floating text.

Clicking an NPC should open a proper dialogue interface.

---

# 10. Dialogue System

NPC dialogue should use a dedicated popup/modal panel.

The popup should contain:

- NPC name
- dialogue text
- optional quest title
- interaction buttons

Regular conversation should include a clear:

**Dismiss**

button.

Merchant NPCs may include:

**Trade**

Healers may include:

**Heal**

Quest interactions require dedicated acceptance dialogue.

Floating/fading text can still be used for short gameplay notifications, but must NOT replace actual NPC conversations.

---

# 11. Quest System

Implement a complete quest system.

Quests must support:

- quest giver
- title
- flavor text
- lore
- objective
- tracked progress
- completion state
- return-to-NPC state
- reward
- quest journal entry
- acceptance
- decline
- turn-in

Examples of objective types:

- kill N enemies
- kill a particular enemy type
- reach a particular floor
- explore an area
- defeat a boss
- retrieve an item

---

# 12. Quest Acceptance

A quest must NOT automatically enter the player's journal merely because the NPC was clicked.

The NPC should explain why the quest matters.

Example structure:

NPC lore/flavor dialogue

Quest title

Objective

Reward

Then:

**Accept**

**Decline**

Only accepting adds the quest.

---

# 13. Quest Completion

Completing an objective should change the journal state to something such as:

**READY TO TURN IN**

The player must return to the appropriate quest giver.

The NPC then presents completion dialogue.

Only after choosing the completion/turn-in option should rewards be granted.

Possible rewards include:

- XP
- gold
- weapons
- armor
- consumables

---

# 14. Quest Journal

Pressing `J` opens the quest journal.

The journal must have a deliberate layout.

Do NOT allow quest titles, descriptions, objectives, rewards, and other interface text to overlap.

Each quest should have its own visually separated entry containing:

**Quest Title**

Description / lore summary

**Objective:**  
Current progress

**Reward:**  
Gold / XP / item

For example:

`Vermin in the Ruins`

`Cull scavengers prowling the outskirts.`

`Objective: 3 / 4 Scavengers`

`Reward: 70 gold, 60 XP`

Use fixed spacing or calculated text layout.

Long text must wrap.

---

# 15. Inventory

Implement a functional inventory.

Items may include:

- weapons
- armor
- health potions
- mana potions
- quest items
- valuables

Equipment should visibly affect character statistics.

The player should be able to equip gear using left-click.

Provide tooltips containing useful item information.

---

# 16. Shops

Different NPCs should sell different categories of items.

Examples:

Blacksmith:

- weapons
- armor

Occult merchant:

- mana potions
- magical equipment
- unusual items

Healer:

- healing services
- consumables

The shop interface must ONLY be accessible while interacting with or standing sufficiently near the relevant merchant.

Opening the inventory somewhere else must NOT magically provide access to a merchant shop.

Leaving merchant range should invalidate shop access.

---

# 17. Selling

Selling should be deliberate and resistant to accidental clicks.

While near a merchant:

**Right-click an inventory item to sell it.**

Left-click continues to mean equip/select.

Display the amount of gold received.

Do not allow selling while nowhere near a merchant.

---

# 18. Buyback

Sold equipment should appear in a merchant buyback list.

The player should be able to repurchase recently sold equipment.

Buyback must not break:

- ordinary shop purchasing
- inventory clicks
- shop hitboxes
- selling
- item selection

The visual position of buyback entries and their clickable hitboxes must exactly correspond.

Do not calculate interaction coordinates separately from rendering coordinates in ways that cause invisible or displaced buttons.

---

# 19. Procedural Generation

Dungeon layouts should be randomized for each new game/run.

However:

**Once an area has been generated, it must remain unchanged for that run.**

Re-entering an existing floor must NOT regenerate it.

Persist:

- floor layout
- doors
- opened doors
- stairs
- enemies
- enemy deaths
- boss deaths
- loot
- explored map state
- important environmental state

---

# 20. Object Permanence

Areas require persistent world state.

If the player kills an enemy, leaves the floor, and returns:

**the enemy must still be dead.**

Do not respawn it merely because the map was reconstructed.

Likewise:

- opened doors remain open
- killed bosses remain dead
- explored territory remains explored
- persistent loot remains where appropriate
- area geometry remains identical

Save/load should preserve this state as well.

---

# 21. Dungeon Layout Generation

Ordinary dungeon floors must be labyrinthine.

Avoid generating every floor as:

- an oval
- circular blob
- large open chamber
- ring
- rounded collection of rooms
- simple chain of rectangular rooms

Use actual maze-like topology.

A good generation strategy could combine:

- randomized depth-first maze carving
- winding corridors
- occasional loops
- irregular chambers
- side rooms
- dead ends
- branching paths
- intersections
- small halls
- larger rooms inserted into the maze
- architectural variation

The resulting silhouette should generally be irregular and rectilinear rather than oval.

Different floors should feel meaningfully different.

---

# 22. Boss Floors

Boss floors are an explicit exception to labyrinth generation.

A boss floor should generate as a large open arena.

It should contain:

- one boss
- arena architecture
- lighting
- entrance
- exit
- possibly decorative objects

It must NOT contain ordinary enemy packs.

The boss should have enough room for maneuvering.

The exit to the next floor may remain sealed until the boss is defeated.

---

# 23. Boss Encounters

A boss encounter begins when the boss detects or engages the player.

At that moment display:

**Boss Name**

and a large boss health bar.

Place this interface at the top of the gameplay area.

It must NOT overlap the controls/help panel.

The boss health bar should update continuously.

When the boss dies:

- health reaches zero
- boss combat stops
- corpse behaves correctly
- boss UI disappears
- sealed progression exit unlocks if applicable

The boss UI must not remain on screen after death.

---

# 24. Enemy Combat

Include hostile enemies in dangerous areas.

Enemies should:

- idle or patrol
- detect the player
- pursue
- attack
- receive damage
- display health while alive
- die
- award XP
- potentially drop loot

Different enemies should vary in:

- HP
- speed
- damage
- appearance
- aggression
- XP value

---

# 25. Corpses

Dead enemies become corpses temporarily or persist according to area rules.

A corpse must NOT retain its living health bar.

Health bars disappear immediately when the enemy dies.

Corpses may visually remain for several seconds before fading/despawning.

Boss corpse handling may differ.

---

# 26. Outdoor World

Create a genuine outdoor wilderness.

It must NOT look like a dungeon whose tiles were recolored.

Use outdoor terrain such as:

- grass
- dirt
- trails
- roads
- trees
- rocks
- vegetation
- water
- ponds
- streams
- clearings
- ruined structures
- shrines
- caves
- landmarks

Terrain should have natural irregularity.

Outdoor areas should generally be more open than dungeon floors while still containing obstacles and points of interest.

Enemies can roam the wilderness.

The outdoor area should connect town, cathedral/interiors, and optional dungeon entrances.

---

# 27. Area Connectivity

The world must obey spatial continuity.

Every transition has:

- source area
- source wall/edge
- source direction
- destination area
- destination wall/edge
- opposite direction

For example:

If the player exits through a door on the **south wall** of 1F, the destination area must begin at a corresponding transition on its **north wall**.

Likewise:

- north → south
- south → north
- east → west
- west → east

Returning through that transition must lead back to the original transition.

Do NOT teleport the player to an arbitrary location on the destination map.

The player's arrival position should be immediately inside the corresponding entrance.

---

# 28. Transition Types

Do not represent area transitions with tiny colored squares, generic glowing markers, or abstract icons.

Transitions must appear as recognizable pieces of architecture.

Support a variety of transition designs.

### Door

A visible door installed in an actual wall opening.

### Double Doors

Two large door leaves inside a wide wall opening.

### Stairway

Clearly visible stairs descending or ascending through an architectural opening.

### Door + Stairway

Closed door or double doors with a stairwell visibly continuing behind them.

Opening the doors exposes the stairs.

### Exterior Door

Door or double doors in a wall opening with visible outdoor light shining through or around the doorway.

This visually indicates that the player is leaving an interior.

### Open Exterior Door

Once opened, exterior illumination should remain visible through the opening.

Transitions should be large enough to identify immediately during normal gameplay.

---

# 29. Doors

Doors have state.

A closed door should not instantly teleport the player.

Interaction sequence:

1. Player approaches.
2. Player clicks the door.
3. Door opens.
4. Door visually remains open.
5. Player can pass through/use the transition.

Double doors should visibly open as double doors.

Door state must persist if the player leaves and returns.

---

# 30. Stairs

Stairs must look like actual staircases.

Do not use:

- tiny squares
- single rectangles
- generic markers

Render multiple visible steps with enough size and perspective to clearly communicate vertical travel.

Stairs may:

- ascend
- descend
- sit inside wall openings
- exist behind doors
- connect interior floors
- connect basement levels

---

# 31. Floor Naming

Never represent vertical location using negative floor numbers.

Above-ground floors use:

- `1F`
- `2F`
- `3F`
- `4F`

Ascending increments these numbers.

Below-ground floors use:

- `B1F`
- `B2F`
- `B3F`
- `B4F`

Descending deeper increments the basement number.

Do NOT display:

- Floor -1
- Floor -2

Town and outdoor wilderness should use descriptive names rather than fake floor numbers.

---

# 32. Vertical Progression

Transitions must allow actual ascension and descension.

Examples:

`Town`
→ `1F`
→ `2F`
→ `3F`

and:

`1F`
→ `B1F`
→ `B2F`
→ `B3F`

The player must also be able to travel back upward.

A quest such as:

`Reach B2F`

must therefore be physically completable.

---

# 33. Loot

Enemies should have a chance to drop:

- gold
- weapons
- armor
- potions
- magical equipment

Loot should remain readable against the environment.

Clicking loot should pick it up if inventory space permits.

Equipment should have varying statistics.

Rare or improved items may use distinct text colors.

---

# 34. Character Progression

Include:

- experience
- character level
- maximum health
- maximum mana
- damage
- armor
- equipment bonuses

Defeating enemies and completing quests awards XP.

Leveling should meaningfully improve the character.

---

# 35. Abilities

Include several usable combat abilities.

For example:

### Fire projectile

Ranged magical attack.

### Nova

Area attack centered around the player.

### Heal

Restore player health at a mana cost.

Abilities require mana where appropriate.

Their visual effects should be readable but inexpensive.

---

# 36. Potions

Provide health and mana potions.

Potions should:

- have inventory counts
- restore the corresponding resource
- be usable with keyboard shortcuts
- be purchasable
- potentially drop from enemies

---

# 37. Automap

Provide an automap accessible with `M`.

It should show explored geometry rather than the entire unseen map.

Display:

- explored paths
- rooms
- player position
- important known transitions

Do not reveal unexplored dungeon topology.

---

# 38. Interface

The main gameplay HUD should contain:

- health orb
- mana orb
- ability slots
- floor/area name
- level
- gold
- potion information

Additional interfaces include:

- inventory
- shop
- buyback
- character sheet
- quest journal
- automap
- dialogue
- pause/menu

Panels must have clear layout boundaries.

Text must not overlap other text.

Buttons must have clickable regions matching their rendered positions.

---

# 39. Interface Layering

Treat UI layout as a real system.

Reserve explicit screen regions for:

### Controls Help

A small unobtrusive panel.

### Boss Interface

Separate space beneath or away from controls.

### Bottom HUD

Health, mana, abilities, floor information.

### Modal Interfaces

Inventory, shop, dialogue, journal, character sheet.

Opening one modal should not leave incompatible panels visibly stacked beneath it.

---

# 40. Save System

Persist the game using browser storage.

Save:

- player level
- XP
- health/mana as appropriate
- gold
- inventory
- equipment
- potion counts
- quests
- completed quests
- buyback state where appropriate
- generated area layouts
- explored areas
- enemy deaths
- boss deaths
- door state
- current area
- current floor
- world progression

Loading must restore the same world rather than generating a new one.

---

# 41. Performance

The game should remain smooth in an ordinary modern desktop browser.

Avoid runaway:

- particle systems
- pathfinding
- shadow calculations
- procedural generation
- canvas allocations
- per-frame object creation

Procedural generation occurs when a new area is first created, not every frame and not every time the player re-enters it.

---

# 42. Reliability Requirements

Before considering the build finished, test the complete gameplay loop.

Verify:

- game launches
- mouse movement works
- hold-to-move works
- attacks work
- spells work
- enemies can die
- corpses lose health bars
- loot can be collected
- inventory opens
- equipment works
- right-click selling works
- buyback works
- buying still works after buyback contains items
- shop access requires merchant proximity
- dialogue opens
- dialogue closes
- quests can be accepted
- quests can be declined
- quest journal is readable
- objectives update
- quests can be completed
- quests can be turned in
- rewards are granted
- town contains no enemies
- outdoor areas look outdoors
- town looks like a town
- doors visually look like doors
- stairs visually look like stairs
- closed doors open
- opened doors stay open
- outdoor transitions are obvious
- 1F can reach outdoors
- floors can be ascended
- floors can be descended
- returning through a transition arrives at the corresponding opposite-side transition
- generated layouts remain persistent
- killed enemies stay dead
- dungeon layouts are labyrinthine rather than oval
- boss floors contain only their boss
- boss health bar appears on encounter
- boss UI does not overlap controls
- boss UI disappears on death
- save/load restores world state

Perform a JavaScript syntax check before delivering the finished HTML.

A syntactically broken build that renders nothing is unacceptable.

---

# 43. Scope Priority

If implementation time becomes constrained, prioritize functional interconnected systems over decorative excess.

Priority order:

1. Game launches reliably
2. Player controls
3. Combat
4. Area transitions
5. Persistent procedural areas
6. Dungeon generation
7. Outdoor world
8. Town
9. Enemies
10. Bosses
11. Inventory/equipment
12. Loot
13. Shops/selling/buyback
14. Quests/dialogue
15. Fog of war
16. Character progression
17. Visual polish
18. Audio polish

Do not omit a core system merely to add superficial visual effects.

---

# 44. Final Quality Target

The finished game should feel like a small but coherent original gothic action RPG rather than a collection of disconnected Diablo-like UI elements.

The player should be able to:

- begin in a recognizable town
- speak with inhabitants
- accept quests
- purchase supplies
- enter a cathedral
- travel upstairs
- descend into crypts
- leave through exterior doors
- explore wilderness
- discover alternate entrances
- fight enemies
- find equipment
- return to previously visited locations
- find those locations unchanged
- delve through labyrinthine procedural floors
- encounter dedicated boss arenas
- defeat bosses
- return to town
- sell loot
- buy back mistakes
- turn in quests
- improve their character
- save
- reload
- continue the same persistent world

The town, wilderness, cathedral floors, labyrinthine basements, and boss arenas must each have distinct visual and structural identities.

Do not fake systems that can reasonably be implemented.

Do not create placeholder interactions where functional gameplay is expected.

Do not wait for additional instructions to implement obvious supporting systems.

Where exact reproduction is impractical, implement the closest functional approximation.

The game must be immediately playable when launched.

You are responsible for architecture, implementation, debugging, scope decisions, gameplay integration, and polish.

**Do not explain how you would build it. Build it.**