# Prompt: Open-World Crime Game

## Role

You are a systems-level game programmer writing software for vintage hardware. Correctness on first build is the top priority; treat every modern-era assumption (shaders, C++11, package managers internet access) as a bug.

## Target hardware - hard constraints, not suggestions

- **RAM:** 512 MB total. Budget the game at **<= 128 MB resident** to leave room for the OS.
- **GPU:** **8 MB VRAM**. **No shaders of any kind - no GLSL, no ARB programs.** No VBOs guaranteed; use vertex arrays or display lists.
- **Display:** 800x600 native. Render at 800x600 or 640x480 fullscreen.
- **Storage/IO:** Keep total install size under 50 MB. No loading hitches during gameplay -- stream nothing, load everything at startup or peer-district.

## Scope - what to actually build

Do **not** attempt GTA III visual fidelity. Build an open-world crime sandbox in the spirit of **GTA 1/2 with simple 3D** specifically:

- One contiguous city (~1 km^2) divided into 3-4 districts, with roads, blocks of extruded low-poly buildings, and a waterfront.
- Third-person on-foot movement and enterable, drivable vehicles (at least 3 vehicle types) with simple arcade physics (no rigid-body solver -- kinematic + friction model).
- Pedestrians and traffic as lightweight agents on spline/waypoint networks; hard cap of **20 active NPCs + 8 vehicles** simulated at once, with pooling and distance-based despawn.
- A wanted system (2-3 escalation levels, police chase behavior), 6-10 scripted missions triggered at map markers, on-screen minimap, money/score, and save/load to a file in game's local directory.
- a handful of short 22 kHz mono sound effecta. No streamed music required.

## Rendering budget (must be respected in code, not aspirational)

- Target **30 fps sustained** at 640x480, acceptable floor 20 fps.
- <= **8,000 triangles per frame**, <= 150 draw calls.
- Total texture budget **4 MB in VRAM: 256x256 max texture size, palettized or RGB565 where possible, texture atlases for the city.
- Frustrum culling + a simple grid/cell visibility system; draw distance ~150 m with distance fog to hide the cutoff.
- Flat or vertex-lit shading only. No per-pixel effects, no multitexture beyond 2 units, no stencil tricks.

## Code and toolchain rules

1. **Language:** C99 (preferred, otherwise C89 for Visual C on Win32), C++98 or C++03. Absolutely no C++11 or later, no `auto`, no lambdas, no `<unordered_map>`.
2. **Alignment:** No unaligned pointer casts.
3. **Memory:** Allocate pools up front; no per-frame malloc in the hot loop. Check every allocation.
. **Assets:** Everything procedural or generated at build time (no Python, no Node). City geometry generated from a seed; textures generated procedurally or included as raw RGB565 with documented byte order. No downloads, no placeholder URLs.
4. **Timing:** Fixed timestep simulation (e.g., 30 Hz) with frame interpolation; never assume vsync.

## Deliverables

1. Full source tree with `Makefile` that produces a double-clickable executable via single `make`.
2. `BUILD.md`: exact build steps, including how to statically link or bundle third party dependencies.
3. `DESIGN.md`: memory map (what uses the 128 MB), triangle/texture budget accounting, and the culling scheme.
4. A `--selftest` command-line mode that runs headless checks (endian round-trip of all file formats, seed-deterministic city generation hash, save/load round-trip) and exits 0 -- so basic correctness is verifiable before ever launching the game.

## Acceptance criteria ("works first try" defined)

- `make` completes with zero errors
- Game executable launches to gameplay in under 15 seconds.
- 30 minutes of continuous play (driving across all districts, triggering police chases, completing one mission, saving and reloading) with no crash, no leak growth beyond 5 MB, and frame rate never below 20 fps.

## Explicit failure modes to avoid

- Assuming little-endian anywhere.
- Relying on preinstalled libraries, frameworks, or fonts.
- Unbounded entity spawning, per-frame allocations, or O(n^2) collision over all entities (use the spatial grid).
- Modern build systems (CMake, Ninja) or modern language features.

If any requirement is impossible within these budgets, cut scope (fewer missions, smaller map) rather than raising budgets. The budgets are the contract.
