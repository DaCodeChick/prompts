# Game Recreation Benchmark — Space Station Silicon Valley

## Role

You are an experienced game programmer, gameplay systems designer, technical artist, level designer, and audio designer.

Your task is to recreate **Space Station Silicon Valley** as a complete, immediately playable game.

This is a **game recreation benchmark**, not a request for a mockup, screenshot, visual homage, proof of concept, or minimally interactive demonstration.

The result should attempt to reproduce the recognizable **gameplay structure, animal possession mechanics, level design philosophy, movement, combat, puzzle solving, visual character, humor, progression, objectives, interface, world interactions, and overall feel** of the original game as faithfully as reasonably possible within the available environment.

Where exact reproduction is impractical, create the closest functional approximation rather than removing the system entirely.

---

# 1. Core Identity

The recreation must capture the defining premise of **Space Station Silicon Valley**:

The player controls a small electronic microchip/robotic core that is physically weak by itself but can take control of robotic animals encountered throughout the station.

Animals are not merely cosmetic character skins.

Every animal must behave as a genuinely different playable character with its own combination of:

* movement speed
* acceleration
* maneuverability
* size
* mass
* health
* attacks
* traversal abilities
* environmental interactions
* special abilities
* strengths
* weaknesses

Changing animals should fundamentally change how the player approaches the environment.

The game should therefore revolve around the loop:

**explore → encounter animals → disable or discover usable animals → possess them → exploit their abilities → solve environmental problems → fight enemies → collect objectives → reach previously inaccessible areas → complete the level.**

Animal swapping must be a central gameplay mechanic rather than an optional gimmick.

---

# 2. Player Core / Microchip

The player must be able to exist outside an animal as a small robotic microchip/core.

The core should:

* move independently
* be visibly distinct from animals
* be substantially more vulnerable than an animal host
* have limited offensive capability
* be capable of approaching disabled robotic animals
* enter/possess compatible animal bodies
* inherit that animal's gameplay properties after possession

If the current animal body is destroyed, the player's core should be expelled rather than automatically causing immediate game over whenever practical.

This creates a vulnerable recovery state in which the player must locate another body.

The player should also be able to voluntarily leave a functioning animal where appropriate.

Possession must visibly and mechanically transition control from the core to the selected animal.

---

# 3. Animal Roster

Include a varied roster of robotic animals inspired by the different ecological regions and bizarre mechanical wildlife of the original game.

Representative archetypes should include animals equivalent in function to creatures such as:

* sheep
* dogs
* mice
* foxes
* bears
* penguins
* camels
* hyenas
* frogs
* gorillas
* birds

Do not make every animal mechanically identical.

Examples of meaningful differentiation include:

### Sheep-type animal

* moderate movement
* headbutt or charge
* unusual jumping or hovering capability
* useful for crossing certain hazards

### Dog-type animal

* fast running
* melee bite
* rapid dash or charge
* useful for chasing enemies or traversing open terrain

### Mouse-type animal

* very high speed
* low durability
* small collision profile
* capable of entering narrow areas

### Bear-type animal

* high health
* slow movement
* powerful melee attacks
* capable of destroying weak environmental barriers

### Penguin-type animal

* efficient movement across ice
* sliding attack or traversal move
* poorer handling on unsuitable terrain

### Fox-type animal

* agile movement
* ranged or explosive mechanical attack
* moderate durability

### Camel-type animal

* heavy body
* strong ranged attack
* high durability
* slower maneuverability

### Hyena-type animal

* fast aggressive melee
* stun, howl, or disruptive special ability

### Frog-type animal

* strong jumping capability
* ability to cross gaps or water that other animals cannot

### Gorilla-type animal

* extremely powerful melee
* ability to interact with or throw heavy objects
* slow but durable

### Bird-type animal

* flight or hovering
* ability to cross terrain barriers
* comparatively fragile
* ranged attack where appropriate

These are functional examples rather than strict limits.

Add additional animals if doing so improves the recreation.

---

# 4. Animal Possession

Possession must work reliably.

A disabled or otherwise possessable animal should provide clear feedback indicating that the player's core can enter it.

The player should be able to:

1. leave their current host
2. move around as the core
3. approach another valid animal
4. activate possession
5. immediately gain control of that animal

The old body should remain in the world when appropriate rather than inexplicably disappearing.

Animal bodies should therefore behave as persistent physical entities wherever feasible.

---

# 5. Controls

Controls must function immediately when the game launches.

Keyboard input must be tested as an actual gameplay requirement rather than assumed to work.

At minimum provide:

* **WASD** — movement
* **Arrow keys** — alternative movement
* **Attack key** — primary animal attack
* **Space** — animal-specific special ability
* **Interaction/Possession key** — enter or leave animal bodies
* **Escape** — pause/menu

Input handling must work reliably in a browser without requiring the player to manually click an invisible element to obtain keyboard focus.

The game should:

* explicitly obtain gameplay focus where appropriate
* handle both `KeyboardEvent.code` and sensible `KeyboardEvent.key` fallbacks
* maintain held-key state independently from single-frame key presses
* clear movement states if browser focus is lost
* prevent browser scrolling when gameplay keys such as Space or arrows are used

Do not ship the game with nonfunctional movement or interaction controls.

---

# 6. Movement and Physics

Movement should have enough physical character that different animals feel different.

Avoid simply translating every character at a constant velocity.

Consider:

* acceleration
* deceleration
* inertia
* mass
* turning response
* collision radius
* terrain modifiers
* knockback
* attack recoil
* sliding
* jumping
* hovering
* charging

Heavy animals should feel heavier.

Fast animals should feel more responsive or reckless.

Flying or jumping animals should genuinely bypass appropriate obstacles rather than merely playing an animation.

---

# 7. Combat

Combat must be functional.

Animals should have attacks appropriate to their physical design.

Possible attack types include:

* bite
* headbutt
* charge
* claw
* punch
* body slam
* projectile
* explosive projectile
* tongue
* peck
* laser
* mechanical weapon
* stun attack

Enemies must:

* have health
* react to attacks
* be damageable
* attack the player
* be capable of killing animal hosts
* provide visible feedback when hit
* become disabled or destroyed appropriately

Combat should include:

* hit feedback
* knockback where appropriate
* impact effects
* projectiles
* health loss
* death/destruction
* simple sound effects

Some robotic animals should be hostile until defeated or disabled.

Defeating an animal may create a new body the player's core can subsequently possess.

---

# 8. Environmental Interaction

The world must contain obstacles that interact with specific animal abilities.

Examples:

* water
* pits
* ice
* destructible barriers
* cracked walls
* heavy objects
* narrow passages
* pressure switches
* locked gates
* environmental machinery
* hazards
* terrain requiring jumping
* terrain requiring hovering or flight

The player should periodically encounter situations where their current animal cannot proceed efficiently.

The solution should involve finding and possessing another animal with the necessary ability.

This animal-based environmental puzzle solving is essential.

---

# 9. Puzzle Design

Levels must contain actual puzzles rather than merely corridors containing enemies.

Include systems such as:

* pressure plates
* switches
* gates
* destructible barriers
* animal-specific traversal challenges
* sequential objectives
* environmental machinery
* optional secrets
* alternate routes

For example:

A heavy animal might break a wall.

A flying animal might cross a pit.

A frog might jump across water.

A mouse might reach an otherwise inaccessible passage.

A fast animal might complete a traversal challenge.

A powerful animal might move or throw an object onto a pressure plate.

Solutions should emerge naturally from animal abilities.

---

# 10. Level Structure

Create multiple substantial playable regions rather than one arena.

The game's progression should evoke the ecological sectors of the original station.

Include approximately four major themed regions such as:

## European / Pastoral Sector

Features:

* grass
* agricultural imagery
* mechanical countryside
* sheep
* dogs
* mice
* water
* fences
* industrial machinery hidden within pastoral scenery

## Arctic Sector

Features:

* snow
* ice
* frozen water
* polar wildlife
* penguins
* bears
* slippery surfaces
* breakable ice
* cold industrial architecture

## Desert Sector

Features:

* sand
* rocky terrain
* industrial ruins
* camels
* hyenas
* hazardous pits
* mechanical structures
* heat-themed machinery

## Jungle Sector

Features:

* dense vegetation
* water
* cliffs
* frogs
* gorillas
* birds
* vertical traversal
* overgrown technological structures

Each region should have its own:

* visual palette
* animal selection
* environmental hazards
* traversal challenges
* puzzles
* enemies

---

# 11. Level Objectives

Every level should have explicit goals.

Objectives can include combinations of:

* collecting power cells
* activating machinery
* opening gates
* defeating important enemies
* reaching an uplink or exit
* solving environmental puzzles
* locating hidden collectibles

The player should always have enough information to understand what remains to be accomplished.

Example objective structure:

**Recover 5 power cells.**

**Activate 3 pressure nodes.**

**Open the uplink gate.**

**Reach the exit.**

These objectives should require exploration rather than simply being placed directly along a straight path.

---

# 12. Collectibles

Include meaningful collectibles.

At minimum:

### Power cells

Scattered throughout levels.

Collecting them should:

* contribute toward level completion
* provide clear visual/audio feedback
* optionally restore some health

### Secret trophy / souvenir

Each major region should contain a hidden collectible.

These should encourage exploration and use of animal abilities.

Track collected trophies across progression.

---

# 13. Enemies

Include several enemy types.

At minimum include:

### Hostile animals

Robotic animals capable of:

* wandering
* detecting the player
* chasing
* attacking
* being disabled
* becoming possessable afterward

### Security drones

Mechanical enemies capable of:

* patrolling
* detecting the player
* firing projectiles
* pursuing the player

### Guardian enemies

Important areas or exits should occasionally be defended by stronger mechanical enemies.

Guardians should have:

* significantly more health
* recognizable attack patterns
* visible health feedback
* stronger projectile or melee attacks

The player should need to exploit animal abilities to defeat them efficiently.

---

# 14. AI

Enemy behavior should be simple but coherent.

Implement states such as:

* idle
* wander
* detect
* pursue
* attack
* stunned
* disabled
* destroyed

Animals not currently hostile should wander naturally.

Hostile animals should pursue when the player enters an appropriate range.

Ranged enemies should maintain useful attack distances.

Enemies must not simply remain stationary waiting to be hit.

---

# 15. Health and Destruction

Every possessed animal should have its own health capacity.

The interface must display:

* current host
* current health
* maximum health

Larger/heavier animals generally have more health.

If the animal reaches zero health:

* destroy or disable the host
* eject the player's core
* leave the player vulnerable

If the exposed core is destroyed, restart the current level or return to an appropriate checkpoint.

Avoid restarting the entire game unnecessarily.

---

# 16. Interface

Create a compact late-1990s science-fiction HUD appropriate to the game.

Display:

* current animal name
* health
* current objectives
* collected power cells
* activated switches
* secret collectible status
* minimap

The HUD must remain readable without covering excessive amounts of the playfield.

Provide clear feedback when:

* an animal is possessed
* an animal is destroyed
* a switch activates
* a gate opens
* a collectible is obtained
* a secret is discovered
* a level is completed

---

# 17. Minimap

Provide a functional minimap.

It should show at least:

* approximate level geometry
* player position
* important collectibles where appropriate

The minimap must update as the player moves.

---

# 18. Visual Direction

Reproduce the recognizable visual character of **Space Station Silicon Valley** within technical limitations.

Target the feel of colorful late-1990s console 3D graphics:

* chunky geometry
* exaggerated robotic animals
* bright environmental colors
* mechanical details
* playful industrial architecture
* readable silhouettes
* deliberately strange combinations of nature and machinery

Avoid making the recreation visually resemble a generic modern shooter or generic abstract prototype.

Animals should visibly resemble mechanical interpretations of their species.

If full 3D implementation is impractical, use a convincing pseudo-3D, isometric, or top-down approximation that preserves gameplay clarity and mechanical depth.

Gameplay takes priority over graphical complexity.

---

# 19. Animation and Feedback

Even with primitive geometry, provide visual feedback for:

* walking
* attacking
* taking damage
* possession
* destruction
* projectiles
* explosions
* collectibles
* switches
* gates
* animal special abilities

Use squash, rotation, recoil, particles, flashes, movement, and other inexpensive techniques where skeletal animation is impractical.

---

# 20. Sound

Provide lightweight generated sound effects without requiring external files where possible.

Include sounds for:

* attacks
* impacts
* possession
* collectibles
* switch activation
* gate unlocking
* projectiles
* explosions
* animal destruction
* level completion

Audio should reinforce actions rather than merely playing continuously in the background.

---

# 21. Progression

Completing one ecological sector should unlock the next.

Create a progression approximately resembling:

**Pastoral Sector → Arctic Sector → Desert Sector → Jungle Sector → Control Core / Ending**

Track:

* completed sectors
* collected trophies
* collected cells
* recovered components

Completion of the final region should produce a proper victory state rather than simply ending gameplay.

---

# 22. Pause and Game States

Implement complete game states:

* title screen
* gameplay
* pause
* level completion
* death/restart
* final victory

The title screen should communicate the premise and controls.

Escape should pause gameplay.

The player should be able to restart after death without refreshing the browser.

---

# 23. Camera

Use a camera suitable for exploring reasonably large levels.

The camera should:

* smoothly follow the player
* remain inside level boundaries
* provide sufficient visibility for navigation
* react subtly to powerful impacts or explosions

Camera shake may be used for:

* heavy attacks
* explosions
* destruction

Do not make camera shake excessive enough to impair gameplay.

---

# 24. Level Persistence

Within a level, world state should remain coherent.

Examples:

* activated switches remain activated
* opened gates remain open
* collected objects remain collected
* destroyed barriers remain destroyed
* disabled animals remain available
* abandoned animal bodies remain where appropriate

Do not reset the world merely because the player changes animals.

---

# 25. Performance

The game should maintain smooth interactive performance on a normal desktop browser.

Avoid:

* unbounded particle generation
* excessive object allocation every frame
* unnecessarily expensive collision checks
* runaway AI loops
* uncontrolled projectile accumulation

Remove destroyed projectiles and expired particles.

Cap effects where necessary.

---

# 26. Browser Implementation

Deliver the recreation as a **single self-contained HTML file** whenever reasonably possible.

The file must:

* open directly in a modern browser
* require no build process
* require no server
* require no package installation
* require no external asset downloads
* begin functioning immediately

Use:

* HTML
* CSS
* JavaScript
* Canvas/WebGL or another browser-native rendering approach

External libraries should be avoided unless absolutely necessary.

If libraries are required, prefer embedding everything necessary into the delivered artifact rather than depending on a CDN.

---

# 27. Reliability Requirements

Before considering the recreation complete, ensure that the fundamental gameplay loop actually functions.

Specifically verify:

* title screen starts the game
* WASD works
* arrow keys work
* movement continues while keys are held
* attack controls work
* special abilities work
* interaction works
* animal possession works
* animal ejection works
* collision works
* hazards affect the player
* enemies can damage the player
* the player can damage enemies
* disabled animals can be possessed
* collectibles can be collected
* switches can be activated
* gates can open
* objectives can be completed
* level exits function
* progression reaches subsequent sectors
* death can be recovered from
* pause/resume works
* the game can reach its final victory state

A visually impressive game with broken controls does **not** satisfy the benchmark.

---

# 28. Scope Priority

If implementation time or environment limitations require prioritization, use this order:

1. Functional controls
2. Animal possession
3. Distinct animal abilities
4. Movement and collision
5. Environmental puzzles
6. Combat
7. Level objectives
8. Multiple regions
9. Progression
10. Enemy AI
11. Collectibles and secrets
12. Interface
13. Visual polish
14. Audio
15. Additional animals and content

Never sacrifice the defining possession mechanic merely to increase visual fidelity.

---

# 29. Quality Bar

Do not produce:

* a static scene
* an animation pretending to be gameplay
* a one-room tech demo
* a walking simulator
* one animal with cosmetic transformations
* a collection of disconnected mechanics
* a game where possession is nonfunctional
* a game where keyboard controls fail
* a generic arena shooter wearing Space Station Silicon Valley aesthetics

The recreation should feel like a small but genuine playable version of **Space Station Silicon Valley**.

The player should be able to spend meaningful time:

* exploring
* fighting
* possessing different animals
* discovering their abilities
* solving puzzles
* collecting secrets
* opening new areas
* completing sectors

---

# 30. Final Requirement

Do not respond with an explanation of how the game could be implemented.

Do not provide pseudocode.

Do not merely describe the architecture.

Do not stop after producing a framework.

**Build the playable game.**

Make reasonable implementation decisions independently.

Where the original game's exact behavior cannot practically be reproduced, implement the nearest functional equivalent.

The finished artifact must be immediately playable and should push the available environment as far as reasonably possible toward recreating the complete **Space Station Silicon Valley** experience.
