Create a polished **2D physics-based ragdoll obstacle-course game** inspired by the chaotic gameplay style of *Happy Wheels*. It should capture the combination of vehicle physics, dangerous obstacle courses, exaggerated ragdoll reactions, environmental interaction, and user-created-level potential, but it should use **original characters, vehicles, environments, and visual designs**.

The game must be **fully playable**, not merely a visual mockup.

## CORE GAMEPLAY

The player selects a character and attempts to reach the finish line of a dangerous side-scrolling obstacle course.

Gameplay should emphasize:

* Physics-driven movement
* Ragdoll character simulation
* Vehicle handling
* Momentum and inertia
* Environmental hazards
* Breakable objects
* Moving platforms and machinery
* Jumps, ramps, drops, and loops
* Comedic physics failures
* Multiple possible routes through some sections
* A clearly defined finish area

The physics should be unpredictable enough to produce funny situations while remaining controllable enough that completing a level feels skill-based rather than random.

## PHYSICS SYSTEM

Implement a proper 2D physics simulation.

Characters should consist of multiple connected body segments rather than behaving as single rigid sprites.

At minimum, simulate:

* Head
* Torso
* Upper and lower arms
* Upper and lower legs

Body parts should be connected using physics constraints/joints.

Characters should respond dynamically to:

* Gravity
* Collisions
* Vehicle acceleration
* Sudden stops
* Falling
* Rotational forces
* Moving machinery
* Explosions
* Impacts from objects

Characters should visibly lean, tumble, rotate, get thrown from vehicles, and collapse into ragdolls when appropriate.

Avoid canned death animations whenever possible. The physics engine should determine how characters fall.

## DAMAGE

Implement an exaggerated arcade-style damage system.

Strong impacts can:

* Stun the character
* Knock the character off their vehicle
* Cause temporary loss of control
* Damage individual limbs
* Disable limbs
* Detach limbs under extreme circumstances
* Cause the character to become a complete ragdoll

Keep the presentation stylized and comedic rather than realistic.

A character does not necessarily lose immediately after being injured. If the character is still capable of operating their vehicle or moving toward the goal, the player should be allowed to continue.

The resulting situations should occasionally become absurd, such as reaching the finish line with a badly damaged vehicle or barely functional character.

## ORIGINAL PLAYABLE CHARACTERS

Create at least **four original characters**, each using a different form of transportation.

For example, invent archetypes such as:

* A reckless delivery worker riding an electric cargo bike
* An elderly daredevil driving a mobility scooter
* A stunt enthusiast riding a unicycle
* An office worker using a heavily modified rolling chair

These are examples only. Feel free to invent more interesting characters.

Each character should have different:

* Weight
* Center of gravity
* Acceleration
* Maximum speed
* Handling
* Jump behavior
* Vehicle dimensions
* Strengths and weaknesses

Character selection should meaningfully change how a level plays.

## CONTROLS

Use keyboard controls.

Suggested layout:

**Arrow Left / Right**
Lean or rotate the character/vehicle.

**Arrow Up**
Accelerate.

**Arrow Down**
Brake or reverse.

**Space**
Character/vehicle-specific special ability.

**Z**
Grab or release nearby objects where applicable.

**R**
Restart the level.

**Esc**
Pause.

Controls should remain responsive even when the physics simulation becomes chaotic.

Display the controls somewhere accessible in the interface.

## SPECIAL ABILITIES

Every character should have an ability related to their vehicle.

Examples include:

* Temporary boost
* Jump mechanism
* Vehicle suspension bounce
* Deployable stabilizer
* Short propulsion burst
* Throwing a carried object
* Changing vehicle configuration

Abilities should interact with the physics system rather than simply playing an animation.

## LEVEL DESIGN

Include at least **three substantial levels**.

Do not make them simple straight lines with obstacles randomly placed across them.

Each level should feel deliberately designed and should introduce recognizable gameplay sections.

Possible environments include:

### Industrial Disaster

Conveyor belts, hydraulic presses, forklifts, falling cargo, elevators, pipes, rotating machinery, and collapsing platforms.

### Hillside Neighborhood

Steep roads, garages, construction equipment, swimming pools, fences, rooftops, traffic, ramps, and downhill sections.

### Questionable Amusement Park

Roller-coaster tracks, spinning rides, launch ramps, swinging objects, collapsing bridges, giant rotating mechanisms, and dangerous shortcuts.

Each level should contain a mixture of:

* Safe introductory areas
* Precision obstacles
* Speed sections
* Large jumps
* Physics puzzles
* Moving hazards
* Destructible scenery
* Optional shortcuts
* Spectacular high-risk obstacles
* Checkpoints
* Finish line

Levels should encourage experimentation.

## HAZARDS

Create several reusable physics-driven hazards.

Examples:

* Rotating blades
* Swinging wrecking balls
* Hydraulic crushers
* Falling objects
* Explosive barrels
* Launch pads
* Pistons
* Collapsing floors
* Moving vehicles
* Pendulums
* Conveyors
* Cannons
* Spring platforms
* Breakable glass
* Rolling boulders
* Falling signs
* Rotating beams

Whenever practical, hazards should use the same physics simulation as the player instead of relying entirely on scripted animation.

Objects knocked loose by one hazard should be capable of colliding with other objects and creating chain reactions.

## VEHICLE DAMAGE

Vehicles should react visibly to collisions.

Depending upon implementation complexity, allow:

* Wheels to bend or detach
* Vehicle bodies to rotate independently
* Suspension to compress
* Components to break
* Vehicle handling to deteriorate after impacts

A damaged vehicle should not automatically trigger failure.

Allow ridiculous situations where the player attempts to finish with only part of their vehicle remaining.

## CAMERA

Use a smooth side-scrolling camera.

The camera should:

* Follow the player
* Look slightly ahead in the direction of movement
* Zoom outward somewhat during large jumps
* Avoid excessive shaking
* Keep important upcoming hazards visible

Large crashes may produce a brief restrained camera shake.

## PRESENTATION

Use an original colorful cartoon style with readable silhouettes and exaggerated animation.

Characters should have expressive faces and visible reactions to:

* Acceleration
* Falling
* Impacts
* Dangerous situations
* Victory

Use procedural/simple generated graphics where necessary rather than depending on external assets.

Include environmental details such as:

* Background buildings
* Signs
* Trees
* Fences
* Pipes
* Machinery
* Clouds
* Spectators
* Debris
* Foreground scenery

Levels should look intentionally constructed rather than like physics primitives placed on an empty background.

## AUDIO

If possible, generate sound effects using the Web Audio API so the game requires no external audio files.

Include sounds for:

* Impacts
* Vehicle motors
* Crashes
* Springs
* Machinery
* Explosions
* Breaking objects
* Character reactions
* Checkpoints
* Victory

Do not require externally hosted assets.

## UI

Create a polished menu flow:

**Title Screen → Character Selection → Level Selection → Gameplay**

During gameplay display:

* Character name
* Level name
* Current checkpoint
* Restart control
* Pause control
* Optional timer
* Damage/status indicator

When the player reaches the goal, show:

**LEVEL COMPLETE**

along with completion time and an option to replay or select another level.

## CHECKPOINTS

Longer courses should contain checkpoints.

After reaching one, restarting should optionally respawn the player at the latest checkpoint rather than forcing the entire level to restart.

Restore the character and vehicle to a usable state when respawning.

## REPLAY VALUE

Track:

* Completion time
* Number of crashes
* Restarts
* Character used

Award medals or ratings based primarily on completion time.

Encourage players to replay levels with different characters because their different physics should create substantially different approaches.

## OPTIONAL LEVEL EDITOR

If feasible, include a simple level editor.

Allow placement of objects such as:

* Platforms
* Ramps
* Walls
* Hazards
* Explosives
* Moving platforms
* Rotating objects
* Breakable objects
* Spawn point
* Finish line

Objects should support basic properties such as:

* Position
* Rotation
* Scale
* Movement speed
* Rotation speed

Allow the player to immediately switch between **Edit** and **Test** modes.

Levels should be serializable to JSON so users can export and import custom courses.

Prioritize the core game over the editor if implementing both would compromise gameplay quality.

## TECHNICAL REQUIREMENTS

Build the game as a browser application using:

* HTML
* CSS
* JavaScript
* Canvas

A physics library may be used only if it can be bundled directly with the project. **The finished game must not require CDNs, web APIs, remote scripts, remote images, or an internet connection.**

If no physics library can be bundled, implement the required rigid-body and constraint behavior directly in JavaScript.

The finished project should run by opening the supplied HTML file locally in a modern browser.

Prefer a **single self-contained `index.html`** wherever practical.

If additional local files are absolutely necessary, keep the project structure minimal and clearly document it.

## PHYSICS QUALITY

Physics quality is the highest priority.

Spend implementation effort on:

1. Stable collision detection
2. Ragdoll joints
3. Vehicle handling
4. Environmental interactions
5. Moving hazards
6. Damage and breakage
7. Camera behavior
8. Level design
9. Visual polish
10. Menus and secondary features

Avoid replacing physics with fake animations.

The entertainment should emerge from interacting physical systems.

## IMPORTANT QUALITY REQUIREMENTS

Do not create a superficial prototype consisting of rectangles moving around an empty canvas.

Do not create menu buttons that do nothing.

Do not leave major gameplay systems as TODOs or placeholders.

Test the complete flow:

**Launch → Character Selection → Level Selection → Spawn → Drive → Crash → Restart → Checkpoint → Finish → Replay**

Ensure every required button and control actually works.

Pay particular attention to:

* Restart behavior
* Character spawning
* Ragdoll constraints
* Collision stability
* Vehicle wheels
* Camera tracking
* Level boundaries
* Checkpoint respawning
* Level completion detection

The final result should feel like a small but genuinely playable indie physics game rather than a technology demonstration.

The goal is simple:

**Give the player a vehicle, an absurdly dangerous obstacle course, a physics-driven character, and enough interacting systems for hilarious disasters to happen naturally.**

Go all out on physics, course design, environmental interaction, and polish.
