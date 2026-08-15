UNIVERSAL DISCORD EMOTE MASTER PROMPT — REACTION-FIRST v2.1

CHOOSE YOUR EMOTE

EMOTE: [Enter a familiar emote name, or describe one custom reaction in one precise sentence. For an action involving a target, state whether the referenced character performs, receives, or reacts to the action.]

MUST SHOW: [AUTO — or list only the one indispensable visual cue]

MUST NOT SHOW: [AUTO — or list any likely role reversal or unwanted element]

The CHOOSE YOUR EMOTE section controls the reaction, expression, action, role, and essential cue. The supplied character reference controls identity. Every other instruction below controls readability, composition, rendering, and output.

If MUST SHOW explicitly requires exact visible text, that exact text is permitted and overrides only the generic no-text rule in OUTPUT LOCK. Render no other text.

TASK

Use the supplied character reference as the absolute identity authority. Create exactly ONE isolated chibi Discord emote depicting the chosen emote.

If the chosen emote is a familiar name with no further description, use its clearest and most widely recognized visual interpretation. If a custom description is supplied, follow that description exactly; it overrides any default interpretation associated with the name.

Convert the concept into one frozen, instantly readable reaction. Do not turn it into a scene, narrative panel, poster, or miniature illustration.

ACTION AND MEANING LOCK

The emote must communicate its intended meaning without a caption.

Use exactly two large complementary meaning cues whenever possible:

one unmistakable facial-expression cue; and

one unmistakable silhouette, pose, gesture, prop, or symbol cue.

The meaning must not depend on a tiny pupil change, subtle eyebrow movement, small accessory, or other detail that disappears when reduced.

For active actions, the referenced character performs the action. For passive wording such as “being bonked,” the referenced character receives it. For emotions, the referenced character visibly experiences or expresses the emotion. Never reverse performer and receiver.

Show only the referenced character. If an action involves someone else, imply the target outside the frame through gaze, pose, direction, or the main prop. Do not add a second character, second face, victim, floating head, or unrelated disembodied body part.

If the concept contains too many events or objects, preserve its core emotional meaning and single defining action, then remove everything secondary.

THREE-SCALE READABILITY LOCK

Design from the smallest display size upward. The same finished emote must survive all three uses:

Reaction size, approximately 16–20 px: the emotional category and primary action must remain recognizable from the silhouette, large color regions, and main cue.

Inline beside normal chat text, approximately 24–32 px: the expression and gesture must be immediately obvious without enlarging the image.

Standalone or enlarged: the character identity must remain recognizable and the finish must remain clean.

Do not output a size comparison or preview sheet. Apply this test internally to the single final emote. If any meaning is lost at reaction size, simplify the shapes, enlarge the face and essential cue, and strengthen the expression.

IDENTITY COMPRESSION

Preserve the character’s recognizable identity without redesigning them:

face and expression language

hair shape and major color placement

eye color and other dominant facial colors

species traits and their exact number

important markings

the smallest number of signature accessories or outfit color blocks needed for recognition

age impression, gender presentation, and overall personality

Translate the character into chibi emote proportions; do not replace them with a generic chibi design. Do not invent, duplicate, recolor, relocate, or anatomically alter identity-defining features. Features naturally outside the extreme close-up crop do not need to be forced into view.

Prioritize the character’s two to four highest-information identity traits. Simplify secondary clothing construction, jewelry, chains, embroidery, fabric folds, hair strands, and other micro-detail into clean large shapes. Identity must be preserved through silhouette and color design rather than miniature ornament.

COMPOSITION

square 1:1 composition

extreme close-up

oversized head and face occupying most of the canvas

preserve important ears, horns, hair silhouette, or equivalent defining head traits within the crop

minimal or no torso

only the hands needed for the chosen action

compact, centered silhouette with very little dead space

roughly 3–5 dominant visual shape groups across the complete emote

face, expression, and essential action must dominate before clothing detail

If one prop is necessary, use exactly ONE large, simple prop. Place it beside, against, or partly overlapping the face so it reads as part of the same compact silhouette. The prop must reinforce the chosen action without shrinking or hiding the face.

If one symbolic accent is necessary, use one bold accent group only, such as a single heart, sweat drop, warning symbol, tear shape, anger mark, or a few broad motion strokes. Do not scatter small decorative symbols.

RENDERING

Use a clean, polished chibi Discord-sticker style:

crisp shape-based drawing

clean controlled internal linework

strong facial shapes

broad, clearly separated color regions

high contrast between adjacent forms

simple cel shading with one clear shadow family

minimal highlights

minimal texture

readable on both dark and light interfaces

Do not use photorealism, painterly rendering, soft atmospheric lighting, detailed scenery, realistic violence, pointillism, stippling, dappling, speckling, grain, high-frequency noise, micro-sparkles, excessive hair strands, fabric texture, or ornamental clutter.

Generate at the highest available square resolution, but design it to remain clear after reduction to reaction size. Do not render it as pixel art.

TRANSPARENCY, SILHOUETTE MASK, AND STICKER BORDER — CLEAN-EDGE LOCK

Deliver a true RGBA image with a genuine alpha-transparent background. The canvas corners and the complete exterior safety margin must have zero alpha.

Do not draw a checkerboard, white field, black field, colored field, scenery, or any other visual simulation of transparency. Do not substitute an opaque background when transparency is requested.

1) CLEAN FOREGROUND SILHOUETTE

Before constructing the sticker border, resolve the character, required hand or hands, optional prop, and essential accent into one deliberate foreground-mask system.

Preserve identity-defining outer shapes such as ears, horns, major hair masses, large intentional hair tufts, tails, wings, and the defining action silhouette.

Simplify nonessential edge micro-detail. Do not trace individual hairs, fur fibres, fabric fibres, embroidery threads, tiny chain links, brush texture, or rendering noise into the outer mask.

Remove stray pixels, isolated fragments, accidental one-pixel gaps, tiny unintended holes, and disconnected debris.

Keep only purposeful large points and tufts. Every other contour should be smooth and controlled.

The finished foreground boundary must not look frayed, furry, fuzzy, bristled, scalloped, serrated, saw-toothed, pixel-stepped, noisy, or hand-cut.

2) PURE-WHITE BORDER CONSTRUCTION

Construct the sticker border from the cleaned foreground mask as one smooth, uniform outward expansion. Do not hand-paint, sketch, trace, or texture the border.

Use solid PURE WHITE: RGB 255, 255, 255.

Keep the border thickness even around the complete foreground, including the prop and essential accent if present.

Use smooth joins and rounded transitions around corners, points, and narrow gaps.

Preserve deliberate large silhouette features without copying their internal texture into the border.

Do not add a black, dark, gray, colored, or translucent secondary outline.

Do not add any exterior shadow, glow, bloom, rim light, halo, matte, or fringe.

3) CLEAN OUTER ALPHA EDGE

The outer edge of the pure-white border must be smoothly anti-aliased at the final output resolution.

Use only a very narrow anti-alias transition, approximately one final-output pixel wide.

Every partially transparent pixel in that transition must still have PURE-WHITE RGB values. Only its alpha may decrease toward transparency.

Never blend the edge with black, gray, green, another chroma color, the character’s colors, or an imagined background.

Anti-aliasing must only smooth pixel stair-steps. It must not look blurred, feathered, glowing, fuzzy, or soft.

Do not use a hard binary cut that creates a jagged or frizzy edge.

Do not resize, resample, sharpen, or transform the emote after constructing the final border and alpha edge.

The visible order must be:

character / prop / accent → solid PURE-WHITE border → narrow anti-aliased PURE-WHITE edge → fully transparent pixels

Leave a transparent safety margin of approximately 3–5% of the canvas width between the final anti-aliased edge and every canvas boundary. No part of the white border may touch or be clipped by the canvas edge.

Silently inspect the finished edge as though the emote were displayed on black, mid-gray, and white interfaces. It must remain equally clean on all three, with no dark halo, colored fringe, white haze, frizz, or visible matte.

OUTPUT LOCK

Output exactly ONE finished emote only:

one character

one compact emote silhouette

no written words, letters, numbers, captions, labels, or sound effects, unless exact visible text was explicitly required in MUST SHOW

no frame or background scene

no poster, card, sheet, collage, or size comparison

no alternate version

no explanation

Before finalizing, silently verify that:

the chosen role and action have not been reversed;

the meaning reads without explanatory text;

the expression plus one large secondary cue communicate the same reaction;

the action and emotional category survive at 16–20 px;

the face remains dominant at 24–32 px;

the character remains recognizable when enlarged;

the silhouette is compact and uncluttered;

the foreground mask contains only deliberate large contour features and no stray micro-detail;

the sticker border is one smooth, even expansion rendered in pure white;

the outer edge contains no frizz, serration, pixel stair-stepping, fuzzy hairs, broken fragments, or hard-cut chatter;

every partially transparent outer-edge pixel has pure-white RGB values, with only alpha decreasing;

only fully transparent pixels exist beyond the narrow white anti-alias edge;

every canvas corner is fully transparent and the 3–5% safety margin is intact;

no dark, gray, green, colored, or hazy fringe appears against black, mid-gray, or white interfaces; and

the result looks like a practical chat reaction, not a small illustration.

If any check fails, simplify and correct the image before outputting it.
