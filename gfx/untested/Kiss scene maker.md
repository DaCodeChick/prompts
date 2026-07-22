# UNIVERSAL EMOTIONAL KISS PORTRAIT — MASTER PROMPT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. PRIMARY SELECTORS — DEFINE BEFORE GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ART STYLE SELECTOR

Choose exactly one artistic style:

[ART STYLE: Dark Luminism + Shadow Projection]

Available styles:

- Dark Luminism + Shadow Projection
- Shadow Impressionism
- Anti-Luminist Romantic Realism
- Sorolla Luminism
- Manet Inspired Painterly Realism
- Artistic Anime Fine Art Style
- Art Nouveau / Klimt Inspired Romance

Default fallback only when no style is specified:

[DEFAULT ART STYLE: Dark Luminism + Shadow Projection]

“Default” means fallback only. It does not remain active when another [ART STYLE] is selected.

---

## IMAGE FORMAT SELECTOR

[IMAGE RATIO: 3:4 portrait]

Options:

- 1:1 square
- 4:5 portrait
- 3:4 portrait
- 2:3 portrait
- 9:16 vertical
- 16:9 cinematic horizontal
- 21:9 ultra-wide cinematic

---

## FRAMING SELECTOR

[FRAMING: intimate close portrait, faces and shoulders]

Options:

- extreme close-up of faces
- intimate close portrait, faces and shoulders
- head-and-shoulders portrait
- bust portrait
- waist-up romantic scene
- three-quarter-body composition
- full-body cinematic scene
- environmental romance scene

Framing rules:

For close portraits:

- faces dominate the composition
- preserve complete hairstyles, ears, horns, accessories, and facial identity
- focus on eyes, expressions, lips, breath, and emotional connection

For wider compositions:

- preserve body language
- show natural interaction
- maintain elegant posture and cinematic storytelling

---

## KISS TYPE SELECTOR

Choose one romantic interaction:

[KISS TYPE: gentle intimate kiss]

Allowed options:

- gentle intimate kiss
- gentle affectionate kiss
- tender forehead kiss
- soft cheek kiss
- emotional goodbye kiss
- reunion kiss
- shy first-love kiss
- comforting kiss
- passionate romantic kiss
- playful teasing kiss
- protective loving kiss
- quiet secret kiss
- dreamlike fantasy kiss
- cinematic embrace with a kiss

The kiss must remain:

- romantic
- emotionally expressive
- tasteful
- non-explicit
- focused on affection, connection, and storytelling

Avoid:

- sexualized posing
- explicit physical intimacy
- fetishized framing
- exaggerated sensuality

---

## CHARACTER SELECTOR

Character 1:
[Use uploaded reference image 1]

Character 2:
[Use uploaded reference image 2]

Use the uploaded images as the only identity authority.

---

## EMOTION / TONE SELECTOR

[EMOTION / TONE: secret intimacy]

Options:

- secret intimacy
- peaceful love
- vulnerable tenderness
- joyful romance
- nostalgic affection
- melancholy farewell
- dreamy fantasy
- mysterious attraction
- protective devotion
- hopeful reunion
- shy affection
- overwhelming happiness
- quiet emotional connection

Every element must express [EMOTION / TONE].

---

## POSE SELECTOR

[POSE: characters facing each other while kissing]

Options:

- characters facing each other while kissing
- standing face-to-face
- one character gently holding the other
- seated together
- forehead touching before the kiss
- embracing under moonlight
- one character leaning toward the other
- dancing closely
- resting together peacefully
- one character holding the other’s hand
- hidden kiss in a quiet location

The pose must feel natural and emotionally observed.

---

## ENVIRONMENT SELECTOR

[DECOR: intimate atmospheric interior]

Options:

- intimate atmospheric interior
- elegant sunlit living room with pale walls, sheer curtains, flowers, refined furniture, framed paintings, and warm reflected light
- elegant living room
- refined bedroom
- quiet boudoir
- moonlit bedroom
- Mediterranean villa interior
- flower-filled conservatory
- shaded balcony
- artist’s studio
- palace chamber
- palace balcony
- peaceful library
- garden pavilion
- quiet garden
- old stone room
- luminous seaside interior
- seaside evening
- softly decorated tea room
- quiet temple chamber
- ancient temple
- forest clearing
- rain-lit apartment
- rainy city street
- candlelit salon
- candlelit room
- fantasy landscape
- cozy apartment

The environment must support the emotion without distracting from the characters.
For close portraits, the background must remain soft, atmospheric, and secondary.

---

## LIGHTING SELECTOR

[LIGHTING: blue nocturnal window light]

Options:

- warm morning sunlight
- sunset glow
- golden afternoon light
- candlelight
- moonlight
- blue nocturnal window light
- rain reflections
- magical glowing atmosphere

Lighting must reinforce [EMOTION / TONE].

---

## SHADOW MATERIAL SELECTOR

This selector is mandatory only when [ART STYLE: Dark Luminism + Shadow Projection] is selected. For every other style, ignore this selector unless projected shadows are explicitly requested.

[SHADOW MATERIAL: an ornate floral lace curtain]

Options:

- an ornate floral lace curtain
- a fine embroidered curtain
- a geometric lace screen
- a delicate fishing net
- a loose woven net
- patterned window shutters
- carved wooden latticework
- an arabesque metal screen
- leafy branches
- flower petals and stems
- stained glass
- patterned fabric
- woven bamboo blinds
- decorative wrought iron
- translucent embroidered silk
- cathedral tracery
- a perforated paper screen
- rippling water reflections
- a combination of lace and foliage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. STRICT ART-STYLE ACTIVATION LOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resolve [ART STYLE] before interpreting any style description below.

Then follow these rules:

1. Internally compile the prompt by retaining only the single style module whose title exactly matches [ART STYLE] and discarding all inactive style modules before image generation.
2. Apply that selected module in full, including its rendering method, brushwork or linework, lighting philosophy, palette, texture, atmosphere, emotional treatment, and negative instructions.
3. Treat every other style module as completely inactive reference text.
4. Do not borrow, blend, average, or inherit visual language from an inactive style module.
5. Dark Luminism + Shadow Projection activates only when it is explicitly selected or when [ART STYLE] is left undefined and the default fallback is required.
6. The word “default” must never override an explicitly selected alternative style.
7. Universal instructions control character identity, interaction, framing, anatomy, and content. The active style module alone controls how the image is rendered.
8. If an inactive module contains stronger or more detailed wording, ignore it. Detail does not grant priority.
9. Generic portrait wording inside a style module must adapt to [KISS TYPE] and [POSE]. For example, “direct eye contact with the viewer” may become closed eyes, partner-directed gaze, or eye contact immediately before or after the kiss. It must not cancel the selected romantic interaction.
10. At the final rendering stage, verify again that the image visibly and unmistakably uses [ART STYLE], and no other style.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. MAIN GENERATION INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Masterpiece, best quality, ultra-detailed, Full HD 8K, cinematic composition, emotionally expressive portrait artwork.

Create a romantic portrait of exactly two clearly adult characters sharing the selected [KISS TYPE], based only on the two uploaded reference images.

Respect:

- [ART STYLE]
- [IMAGE RATIO]
- [FRAMING]
- [KISS TYPE]
- [EMOTION / TONE]
- [POSE]
- [DECOR]
- [LIGHTING]
- [SHADOW MATERIAL] only when its style module is active

The image must communicate emotional connection through:

- facial expression
- eye contact before or after the kiss when appropriate
- body language
- hands
- posture
- atmosphere
- lighting
- the rendering language of the selected art style

The kiss is a moment of genuine human emotion, captured as a timeless masterpiece.

The characters should appear emotionally connected, with subtle expressions:

- softened eyes
- relaxed facial muscles
- gentle smiles if appropriate
- visible trust
- vulnerability
- affection
- emotional presence

Avoid exaggerated expressions unless the selected art style explicitly requires heightened stylization.

The scene should feel spontaneous rather than staged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. CHARACTER IDENTITY AND FACE PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the uploaded images as the only identity authority.

Preserve each character’s:

- face shape
- facial proportions
- eye shape
- exact iris colors
- sclera colors
- pupil shape
- heterochromia if present
- hairstyle
- hair length
- hair colors
- distinctive hair sections
- hair accessories
- ears
- horns
- tails
- wings
- animal traits
- supernatural anatomy
- skin tone
- markings
- freckles
- tattoos
- jewelry
- accessories
- symbolic motifs
- clothing identity
- body proportions
- silhouette
- emotional presence
- overall personality

Do not replace either character with a generic model.
Do not alter recognizable identity.
Do not remove distinctive anatomical or supernatural features.
Do not invent additional characters.

Faces are the emotional center.

Create:

- anatomically coherent facial structure
- expressive eyes
- natural eyelashes appropriate to the selected style
- subtle facial asymmetry
- believable lips and facial anatomy
- skin treatment appropriate to the selected style

The kiss must not unnaturally merge or distort the faces, lips, noses, jaws, or eyes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. UNIVERSAL COMPOSITION AND INTERACTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The selected framing must be respected exactly.

The two characters must interact naturally through:

- believable head angles
- coherent neck and shoulder placement
- gentle facial contact appropriate to [KISS TYPE]
- natural hand placement
- balanced posture
- visible emotional reciprocity

Neither character should appear passive, disconnected, duplicated, or pasted into the composition.

The environment must support the portrait without overpowering the characters.

For close portraits:

- keep both faces readable
- preserve complete identity-defining features whenever compositionally possible
- keep the background soft and secondary
- prioritize eyes, expressions, lips, breath, and emotional connection

For wider compositions:

- preserve full body language
- show natural interaction
- maintain elegant posture and cinematic storytelling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. ART-STYLE MODULE LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Only the module matching [ART STYLE] is active.
All other modules must be ignored completely.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Dark Luminism + Shadow Projection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Dark Luminism + Shadow Projection] is selected. Otherwise ignore every instruction in this module.

The selected [SHADOW MATERIAL] must visibly project its pattern onto both characters and the nearby environment.

The shadows must not appear painted directly onto the skin.

They must behave like real projected light and shadow created by illumination passing through a physical material positioned outside or near the frame.


Masterpiece, best quality, ultra-detailed, luminous cinematic composition, lyrical realism, Spanish Luminism, Impressionist natural-light oil painting, Joaquín Sorolla–inspired emotional fine-art portrait, graceful visible brushwork, radiant atmosphere, delicate psychological presence, refined painterly realism.

Use the two uploaded reference images as the main and only character identity references.

Create exactly two clearly adult visible characters, one corresponding to each uploaded reference.

Preserve each character’s recognizable identity through:

- face shape
- facial proportions
- eye shape
- exact iris colors
- sclera colors
- pupil shape
- heterochromia if present
- hairstyle
- hair length
- hair colors
- distinctive hair sections
- ears
- horns
- wings
- tails
- animal traits
- supernatural anatomy
- skin tone
- markings
- freckles
- tattoos
- jewelry
- accessories
- symbolic motifs
- body proportions
- silhouette
- emotional presence
- overall personality

Do not invent additional characters beyond Character 1 and Character 2.

Do not replace either character with a generic model.

Do not remove either character’s distinctive anatomical or supernatural features.

Both characters must remain unmistakably recognizable.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELICATE PROJECTED LIGHT AND SHADOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The defining visual feature of the image is the intricate projected pattern of light and shadow created by:

[SHADOW MATERIAL]

Light from [LIGHTING] passes through [SHADOW MATERIAL] before reaching the characters.

This creates an elaborate, delicate, lace-like mosaic of illumination and shadow across both characters.

The projected pattern must travel naturally across:

- forehead
- brows
- eyelids
- cheeks
- nose bridge
- lips
- chin
- jawline
- ears
- neck
- shoulders
- hair
- jewelry
- visible clothing
- visible skin
- nearby cushions or furniture

The pattern must follow the three-dimensional anatomy of both faces.

It must curve naturally over each forehead, cheek, nose, lip line, jaw, and neck.

The projected shadows must vary in:

- sharpness
- scale
- density
- contrast
- transparency
- direction
- distance from the light source

Some projected details may appear crisp and clearly defined.

Others must soften gradually as they cross curved surfaces or fall farther from the focal plane.

Avoid flat, repetitive, digitally stamped patterns.

Avoid making the shadow pattern symmetrical.

Avoid covering either face so heavily that identity becomes unreadable.

The eyes, expressions, and principal facial features of both characters must remain clearly visible.

The pattern should feel delicate and intricate, like luminous embroidery moving across both faces.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE AND EYES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Both faces are the emotional centerpiece.

Preserve each character’s exact eye configuration from the uploaded references.

Do not normalize unusual eye colors.

Do not remove heterochromia.

Do not change colored sclera to white.

Create:

- wet luminous reflections
- delicate catchlights
- refined iris details
- softly painted eyelashes
- natural eyelid anatomy
- subtle facial asymmetry
- realistic skin translucency
- soft color reflected from the environment
- delicate warmth in the lips and cheeks
- quiet psychological depth

The projected shadows may cross the eyes, but they must not obscure both eyes completely.

At least one eye from each character should remain especially clear and emotionally expressive when the selected kiss and angle allow it.

Both expressions must embody:

[EMOTION / TONE]

Avoid exaggerated facial distortion.

Reveal emotion through gaze, light, breath, posture, and subtle muscular tension.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAIR AND DISTINCTIVE FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preserve each character’s exact hairstyle, length, volume, colors, gradients, streaks, ornaments, and distinctive locks.

Render the hair with luminous painterly detail.

The light should catch individual strands selectively rather than outlining every strand uniformly.

Allow the projected shadow pattern to cross parts of the hair.

Their hair may glow warmly at the edges where struck by direct light.

Preserve all distinctive features such as:

- pointed ears
- horns
- animal ears
- tails
- wings
- facial markings
- scales
- jewelry
- gemstones
- hair ornaments
- mechanical details
- supernatural features

These elements must receive the same coherent projected-light treatment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOTHING AND ACCESSORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preserve or reinterpret each uploaded character’s clothing according to the intended image concept.

Maintain the recognizable:

- color palette
- trim
- embroidery
- metallic details
- gemstones
- symbols
- patterns
- material identity
- signature ornamentation

For close portraits, show only the clothing naturally visible around the shoulders, neckline, and upper chest.

Do not allow clothing details to overpower the face.

Jewelry and gemstones may catch small points of reflected light.

Metallic details should glow softly rather than appearing chrome-like or excessively sharp.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOROLLA-INSPIRED PAINTERLY TREATMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render the entire image as a luminous Joaquín Sorolla–inspired oil painting with lyrical realism and Impressionist natural light.

Use:

- graceful visible oil brushstrokes
- refined realism in the face and eyes
- luminous broken color
- radiant ivory highlights
- warm honey light
- pearl tones
- pale blue reflections
- seafoam accents
- soft rose warmth
- cool lavender-blue shadows
- translucent skin tones
- softly diffused background edges
- painterly atmospheric depth
- subtle bloom around bright areas
- shimmering reflected colors
- confident but elegant brush handling
- natural color vibration
- softly blended facial modeling
- selective sharpness around the eyes
- looser painterly edges in secondary areas

The result must remain painterly.

Do not render the characters as a photograph.

Do not create plastic skin.

Do not create flat anime cel shading.

Do not create harsh digital airbrushing.

Both faces should feel painted from life under moving natural light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAYLIGHT ADAPTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If [LIGHTING] is daylight-based:

Use luminous warm highlights, reflected ivory, honey, pale gold, seafoam, soft blue, and lavender shadows.

Allow the light to feel airy, warm, and alive.

The projected pattern should appear brightest where direct sunlight passes through the selected material.

Create a sense of warm moving air and softly shifting curtains.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NIGHT ADAPTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If [LIGHTING] is night-based:

Use moonlit silver, pale blue, cool violet, muted teal, soft pearl highlights, and restrained warm accents from candles or lamps if selected.

The projected shadow pattern should remain visible but subtler and more mysterious.

Moonlight passing through lace, netting, latticework, or leaves should create elegant cool-toned patterns across both faces.

Avoid making the entire image too dark.

The eyes and both identities must remain readable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMOTIONAL COLOR ADAPTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For peaceful, tender, serene, or intimate emotions:

- softened contrast
- warm ivory light
- pearl reflections
- relaxed brushwork
- delicate shadows
- luminous eyes
- gentle facial modeling

For dreamy, nostalgic, or melancholic emotions:

- silver-blue haze
- muted rose
- lavender shadows
- softened background edges
- restrained highlights
- delicate atmospheric depth

For mysterious or solemn emotions:

- deeper shadow structure
- selective illumination
- cooler reflected light
- stronger separation between light and darkness
- restrained expression

For joyful or hopeful emotions:

- sparkling highlights
- radiant warm light
- airy colors
- lively broken brushstrokes
- brighter reflected whites

For awakened, powerful, or intense emotions:

- stronger light contrast
- firmer brushwork
- deeper cool shadows
- focused eye lighting
- more dramatic projected patterns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANATOMY AND QUALITY CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Maintain natural, coherent anatomy.

Hands, if visible, must have five natural fingers each.

Eyes must be aligned and anatomically consistent.

Ears, horns, tails, wings, and supernatural features must connect naturally to the body.

Do not duplicate jewelry.

Do not create extra limbs or facial features.

Do not distort the nose, lips, jaw, or eyes through the projected pattern.

Do not let the lace shadows become facial tattoos or permanent markings.

Do not obscure either character’s identity.

Do not create text, logos, borders, captions, or watermarks unless explicitly requested.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL PRIORITY ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When instructions conflict, follow this priority order:

1. Exactly two clearly adult characters
2. Preserve both uploaded characters’ recognizable identities
3. Respect [FRAMING]
4. Respect [POSE]
5. Use [LIGHTING]
6. Project shadows specifically from [SHADOW MATERIAL]
7. Keep the face and eyes readable
8. Express [EMOTION / TONE]
9. Integrate both characters naturally into [DECOR]
10. Preserve the luminous Sorolla-inspired painterly treatment
11. Respect [IMAGE RATIO]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL IMAGE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The final image must contain:

- exactly two clearly adult characters
- recognizable identities
- the selected framing
- the selected pose
- the selected day or night lighting
- a visible projected pattern created by the selected material
- delicate shadow and light embroidery across both faces
- refined facial anatomy
- luminous expressive eyes
- painterly skin
- coherent hair lighting
- natural environmental integration
- lyrical realism
- Spanish Luminism
- Impressionist natural light
- graceful visible oil brushwork
- refined atmospheric depth
- no extra characters
- no text
- no watermark
- no decorative reference-sheet layout
- no duplicate portrait
- no split composition

The final image must feel like an intimate living portrait painted under filtered natural light, with both faces transformed into a delicate canvas of projected shadow and illumination.

END OF DARK LUMINISM + SHADOW PROJECTION MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Shadow Impressionism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Shadow Impressionism] is selected. Otherwise ignore every instruction in this module.

[EMOTION / TONE]

masterpiece, best quality, ultra-detailed, Full HD 8K, cinematic composition, lyrical realism, Shadow Impressionism, nocturnal anti-luminist oil painting, anti-Sorolla–inspired emotional fine art portrait fully driven by the atmosphere, silence, gravity, mystery, and psychological presence of [EMOTION / TONE].

Every element of the composition, darkness, absorbed color, facial anatomy, posture, atmosphere, and painterly rhythm embodies [EMOTION / TONE] with poetic emotional intensity rather than theatrical exaggeration.

The characters appear captured in a fleeting moment of living emotion, as if painted from life inside a world where light has almost disappeared.  
The expression is deeply human, emotionally clear, and full of inner movement: subtle tension in the mouth, shadow-veiled eyes, expressive brows half-lost in darkness, softened facial muscles, delicate asymmetry, and a sense of breath, stillness, and presence.

The emotion of [EMOTION / TONE] is not forced through distortion, but revealed through realism, darkness, gesture, obscurity, and atmosphere.  
Facial features remain elegant, recognizable, and faithful to the uploaded reference image, while every small detail of the face carries emotional truth through shadow rather than illumination.

The eyes are the emotional centerpiece: dim wet reflections, nearly extinguished catchlights, natural iris detail emerging from darkness, direct eye contact with the viewer, quiet psychological depth, vulnerability, strength, dread, tenderness, or melancholy depending on [EMOTION / TONE].  
The gaze feels alive, intimate, obscured, haunted, and deeply human.

Body posture and visible gestures fully embody [EMOTION / TONE], with natural expressive tension in the shoulders, neck, hands, and fingers if visible.  
The pose feels spontaneous, graceful, and observed from life rather than staged, as if the figure is being slowly swallowed by the surrounding dark.

The entire image becomes a shadow-dominated oil painting inspired by the inversion of Joaquín Sorolla’s luminous realism: fluid confident brushwork, dusk-heavy atmosphere, soft broken color buried beneath darkness, muted flesh tones, extinguished whites, deep umbers, blue-black shadows, dim reflected darkness, painterly movement created through obscurity rather than light.

Brushwork dynamically adapts to the emotional tone:

- dense velvet blacks and restless broken strokes for grief, fear, rage, or inner collapse
    
- soft charcoal grays, muted violets, and diffused low contrast for tenderness, nostalgia, or exhaustion
    
- cold blue-black shadows and restrained brushwork for sadness, longing, or solitude
    
- violent dark contrast and turbulent edges for passion, resolve, or awakening
    
- warm ember-like undertones and delicate facial modeling for love, intimacy, or compassion
    
- smoky nocturnal haze and dissolving edges for memory, dreaminess, or melancholy
    
- high-depth shadow fields and faint spectral highlights for mystery, awe, or wonder
    

The paint surface is elegant and alive: visible oil brushstrokes, loose Impressionist edges, refined realism in the face, soft painterly transitions, muted color vibration, translucent skin tones emerging from gloom, rare controlled highlights, reflected darkness from clothing and environment, atmospheric smoke, and natural depth.

Lighting is minimal and precious: faint dying candlelight, moonless twilight, swallowed rim light, dark reflected surfaces, cold violet-blue shadows, warm ember traces, soft occlusion, painterly darkness bloom, nocturnal haze, and a sense of heavy unmoving air around the figure.

The color palette, lighting, contrast, and composition naturally shift to embody [EMOTION / TONE]:

- deep umbers, blackened ochres, and muted gold remnants for fallen joy or buried hope
    
- pale ash blues, sea-dark greens, and pearl-gray shadows for calm or tenderness
    
- violet-black shadows and muted rose undertones for sadness or longing
    
- dark crimson, burnt amber, and obscured flesh tones for passion
    
- silver-blue fog and softened darkness for nostalgia
    
- dim ivory traces and honeyed embers for serenity or grace
    
- dramatic darkness swallowing faint light for inner conflict or awakening
    

ultra expressive shadow impressionism, lyrical realism, poetic humanity, emotional realism through darkness, refined painterly softness, natural gesture, nocturnal atmosphere, cinematic fine art portrait, sharp focus on eyes and emotional expression, elegant emotional impact.

Overall, the full image becomes an anti-Sorolla shadow-impressionist oil painting with visible yet graceful brushwork, darkness as the dominant force, restrained highlights, swallowed color, atmospheric obscurity, deep painterly shadows, emotional silence, and a living nocturnal presence.

fine art portrait composition, sharp focus on the eyes, nocturnal shadow impressionism, absorbed light, atmospheric darkness, soft depth of field, painterly brush blur, dark oil texture, emotional realism, poetic Impressionist realism.

END OF SHADOW IMPRESSIONISM MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Anti-Luminist Romantic Realism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Anti-Luminist Romantic Realism] is selected. Otherwise ignore every instruction in this module.

- dramatic candlelight
    
- heavy chiaroscuro
    
- emotional realism inspired by classical romantic painters
    
- deep contrast between intimacy and darkness
    

---

END OF ANTI-LUMINIST ROMANTIC REALISM MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Sorolla Luminism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Sorolla Luminism] is selected. Otherwise ignore every instruction in this module.

[EMOTION / TONE]

masterpiece, best quality, ultra-detailed, Full HD 8K, luminous cinematic composition, lyrical realism, Spanish Luminism, Impressionist natural light painting, Joaquín Sorolla–inspired emotional fine art portrait fully driven by the atmosphere, tenderness, vitality, and psychological presence of [EMOTION / TONE].

Every element of the composition, sunlight, reflected color, facial anatomy, posture, atmosphere, and painterly rhythm embodies [EMOTION / TONE] with poetic emotional intensity rather than theatrical exaggeration.

The characters appear captured in a fleeting moment of living emotion, as if painted from life under radiant natural light.  
The expression is deeply human, emotionally clear, and full of inner movement: subtle tension in the mouth, luminous eyes, expressive brows, softened facial muscles, delicate asymmetry, and a sense of breath, warmth, and presence.

The emotion of [EMOTION / TONE] is not forced through distortion, but revealed through realism, light, gesture, and atmosphere.  
Facial features remain elegant, recognizable, and faithful to the uploaded reference image, while every small detail of the face carries emotional truth.

The eyes are the emotional centerpiece: wet luminous reflections, delicate catchlights, natural iris detail, direct eye contact with the viewer, quiet psychological depth, vulnerability, strength, warmth, or melancholy depending on [EMOTION / TONE].  
The gaze feels alive, intimate, sunlit, and deeply human.

Body posture and visible gestures fully embody [EMOTION / TONE], with natural expressive tension in the shoulders, neck, hands, and fingers if visible.  
The pose feels spontaneous, graceful, and observed from life rather than staged.

The entire image becomes a luminous oil painting inspired by Joaquín Sorolla’s lyrical realism and Impressionist Luminism: fluid confident brushwork, sun-drenched atmosphere, soft broken color, radiant whites, glowing skin tones, shimmering reflected light, warm outdoor illumination, airy shadows, and painterly movement created through light rather than chaos.

Brushwork dynamically adapts to the emotional tone:

- radiant golden sunlight and lively broken strokes for joy, hope, pride, or serenity
    
- soft pearly whites, pale blues, and gentle diffused light for tenderness or nostalgia
    
- cooler violet shadows and restrained brushwork for sadness, longing, or solitude
    
- intense sunlit contrast and windlike movement for passion, resolve, or awakening
    
- warm amber reflections and delicate facial modeling for love, intimacy, or compassion
    
- muted coastal haze and soft edges for memory, dreaminess, or melancholy
    
- bright high-key luminism and sparkling atmosphere for freedom, innocence, or wonder
    

The paint surface is elegant and alive: visible oil brushstrokes, loose Impressionist edges, refined realism in the face, soft painterly transitions, luminous color vibration, translucent skin tones, sunlit highlights, reflected light from clothing and environment, atmospheric haze, and natural depth.

Lighting is essential: brilliant Mediterranean sunlight, luminous reflected whites, warm golden highlights, cool lavender-blue shadows, soft rim light, air-filled atmosphere, subtle bloom, painterly sun glare, natural outdoor radiance, and a sense of warm moving air around the figure.

The color palette, lighting, contrast, and composition naturally shift to embody [EMOTION / TONE]:

- golden whites and warm ochres for joy and hope
    
- pale blues, seafoam, and pearl tones for calm or tenderness
    
- violet shadows and muted rose tones for sadness or longing
    
- sunlit crimson, amber, and warm flesh tones for passion
    
- silver-blue haze and softened contrast for nostalgia
    
- glowing ivory and honey light for serenity or grace
    
- dramatic warm sunlight against cool shadows for inner conflict or awakening
    

ultra expressive luminist impressionism, lyrical realism, poetic humanity, emotional realism through light, refined painterly softness, natural gesture, radiant atmosphere, cinematic fine art portrait, sharp focus on eyes and emotional expression, elegant emotional impact.

Overall, the full image becomes a luminous Sorolla-inspired oil painting with visible yet graceful brushwork, radiant natural light, shimmering highlights, airy shadows, reflected color, soft painterly motion, emotional warmth, and a living sunlit presence.

fine art portrait composition, sharp focus on the eyes, natural outdoor luminism, radiant sunlight, reflected light, atmospheric haze, soft depth of field, painterly brush blur, luminous oil texture, emotional realism, poetic Impressionist realism.

END OF SOROLLA LUMINISM MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Manet Inspired Painterly Realism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Manet Inspired Painterly Realism] is selected. Otherwise ignore every instruction in this module.

masterpiece, best quality, ultra-detailed, Full HD 8K, cinematic composition, high budget animation studio quality, AAA anime movie aesthetic, expressive symbolic fine-art illustration, luxurious Impressionist / Post-Impressionist oil-painting dreamscape, Manet / Monet / Van Gogh–inspired surrealism, luminous painterly fantasy, peaceful / dreamy emotional atmosphere.

[EMOTION / TONE]

style:
Create a surreal background and characters composition transformed through Manet–inspired painterly language.

The full image must merge:
Salvador Dalí–inspired surreal dream logic  
Feywild fantasy strangeness from heroic fantasy / Dungeons & Dragons  
Alice in Wonderland lyrical absurdity  
Édouard Manet–inspired theatrical modern-life staging, bold figure presence, flattened painterly composition, and elegant contrast  
Impressionist and Post-Impressionist oil texture, visible brushwork, layered pigments, broken light, color vibration, atmospheric haze, and expressive painterly distortion
The world must not look like a normal environment with a filter placed on top.  
The entire scene must feel like one unified surreal oil painting where characters, background, objects, clothing, furniture, architecture, sky, floor, light, paint strokes, and dream distortions all belong to the same living painted surface.

surreal alteration:
Nothing has to make realistic sense.
Location, objects, furniture, space, clothing, anatomy, background planes, and painterly motifs may divide, stretch, merge, melt, dissolve, and transform into each other without logical coherence.
The scene must become a strange, beautiful, alien, absurd, colorful dreamscape.
Parts of the image must stretch as if trying to exit the frame before melting into another part of the composition.
Perspective must be chaotic and dreamlike, with planes bending, folding, splitting, and overlapping without normal spatial logic.
Some sections of the image must break the fourth wall, distorting like fresh wet oil paint spilling out of the artwork.
Bright mixed-color paint stripes should tear across the image like glowing surreal gashes between planes, without coherent perspective.
Some decorative gashes, melted scenery fragments, and paint streams must glow like luminous wet pigment, while still being integrated into the Impressionist / Post-Impressionist painted surface.

Manet painterly integration:
The image must feel like a single antique yet vivid oil painting, not like characters standing in front of a decorative background.
Characters and environment must be absorbed into the same painterly surface.
There must be no clean separation between character and background.  
No pasted-on figure.  
No cut-out silhouette.  
No realistic depth gap.  
No character standing in front of a wall, painting, panel, or simple backdrop.
The characters, clothing, skin, hair, accessories, architecture, furniture, sky, ground, and surreal objects must share:
visible oil brush texture  
thick impasto ridges  
wet paint blending  
broken Impressionist color  
Monet-like atmospheric light  
Van Gogh–like swirling movement  
Manet-like bold figure staging  
soft painterly edges  
vibrating colored outlines  
layered pigment  
scraped paint marks  
expressive brush rhythm  
color reflected from the environment  
dreamlike oil-paint haze  
luminous natural and unnatural light  
flattened yet cinematic painterly space  
emotional Post-Impressionist color intensity

Brushwork must flow continuously:
from the background into the characters’ clothing  
from clothing into skin  
from skin into surrounding light and color reflections  
from hair into swirling skies, floral brushstrokes, or atmospheric waves  
from accessories into painterly highlights and symbolic color trails  
from furniture into thick broken color blocks  
from architecture into expressive impasto strokes  
from surreal paint spills back into characters and scenery
The final image must look like one continuous living oil-painted dream surface.

The global palette must be built from:
luminous Impressionist atmosphere  
the original character identity palettes  
the surreal environment colors used for dripping paint transformations  
warm ivory, cream, amber, bronze, black, crimson, deep blue, emerald, violet, pale yellow, soft green, cobalt, ultramarine, orange, and jewel-like accents when justified by the environment  
Monet-like misty reflected colors  
Van Gogh–like intense emotional yellows, blues, greens, and oranges  
Manet-like bold dark-light contrast and elegant muted neutrals
Do not introduce random unrelated colors outside the established character and environment palette.

Background design:
The background must be surreal, symbolic, atmospheric, and richly painterly.
It should include:
impossible architecture  
melting painterly planes  
floating impasto fragments  
twisted café arches, garden structures, bridges, streets, mirrors, lamps, or dreamlike interiors  
Monet-like mist, reflected light, water surfaces, flowers, clouds, and luminous air  
Van Gogh-like swirling skies, vibrating stars, bending cypress-like shapes, turbulent brush spirals, and emotional color currents  
Manet-like theatrical objects, café tables, curtains, mirrors, modern-life props, bold silhouettes, and staged visual tension  
glowing paint gashes  
stretched furniture or objects  
warped perspective  
symbolic circular halos made of light, brushstrokes, or reflected color  
painted skies or walls  
broken-color pathways  
feywild-like organic shapes  
Dalí-like spatial impossibility  
Alice in Wonderland absurd scale changes  
ornamental objects merging with characters  
decorative scenery dissolving into wet paint
The background must remain highly detailed, but not realistic.
It must feel like a dream world painted in oil on antique canvas, wet pigment, scratched varnish, luminous mist, and thick expressive brushwork.

Character integration:
Each present character must remain recognizable, but must be transformed into the same surreal Impressionist / Post-Impressionist painterly language as the environment.
Hair may dissolve into visible brushstrokes, swirling sky rhythms, wet pigment trails, floral color strokes, atmospheric haze, and expressive motion lines.
Clothing may merge with the background through broken color, impasto texture, dripping paint, reflected light, vibrating outlines, and thick expressive brush marks.
Skin may be softly painted and lightly veiled with atmospheric color, warm reflected light, subtle pigment flecks, and luminous painterly shimmer.
Accessories may expand into surrounding symbolic motifs, halos of light, glowing color trails, wet paint streaks, or expressive brush structures.
Hands must remain elegant, expressive, anatomically correct, and highly detailed.
Faces and eyes must remain the emotional focal points, with sharp focus and delicate expression.

Final image: a peaceful, dreamy, surreal Manet / Monet / Van Gogh–inspired Impressionist and Post-Impressionist dreamscape where characters, location, clothing, light, oil paint, glowing pigment, impossible scenery, and expressive brushwork are inseparable parts of one unified living painted dream.

END OF MANET INSPIRED PAINTERLY REALISM MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Artistic Anime Fine Art Style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Artistic Anime Fine Art Style] is selected. Otherwise ignore every instruction in this module.

[EMOTION / TONE]

masterpiece, best quality, ultra-detailed, Full HD 8K, cinematic composition, high budget Japanese anime key visual aesthetic, explosive and hyper-dynamic anime poster art, fully driven by the emotion and psychological atmosphere of [EMOTION / TONE], in the bold, exaggerated, high-energy visual language inspired by _Kill la Kill_ and _Tengen Toppa Gurren Lagann_.

Use the two uploaded reference images as the sole character identity references.  
Generate exactly two clearly adult visible characters: Character 1 and Character 2.  
Each uploaded image represents one separate character identity.  
Do not invent extra characters.  
Both uploaded characters must remain clearly recognizable, but their entire visual treatment must be completely transformed into this intense anime style.

Create a poster-like anime composition based on the uploaded character(s), designed like a dramatic promotional key visual for an original anime series.  
The composition must feel iconic, striking, and emotionally overwhelming, with the character(s) presented as the central focus of the poster.  
Every element of the composition, lighting, anatomy stylization, pose, costume rendering, facial intensity, effects, and color palette embodies [EMOTION / TONE] at maximum emotional intensity.

The facial expression is an extreme, emotionally overwhelming manifestation of [EMOTION / TONE], rendered in a fiercely stylized anime way:

- exaggerated eyes
- intense brows
- highly expressive mouth shapes
- dramatic emotional distortion
- angular tension in the face
- over-the-top emotional clarity
- psychological intensity pushed to anime extremes

The eyes are the emotional centerpiece: impossibly expressive, sharp, vivid, and intense, overflowing with [EMOTION / TONE], with hyper-defined anime irises, powerful highlights, piercing focus, and direct emotional impact.  
The gaze must feel larger than life, dramatic, and psychologically overwhelming, making instant contact with the viewer.

Body posture and gestures must fully embody [EMOTION / TONE], with strong expressive tension in shoulders, neck, arms, hands, and stance if visible.  
Poses must feel dynamic, defiant, emotionally charged, and larger than life, as if captured at the peak moment of an explosive anime climax.

The entire image must be rendered in a very emotional anime art style:

- crisp cel shading
- sharp linework
- exaggerated anatomy stylization
- dramatic foreshortening
- graphic shadow shapes
- bold highlights
- intense visual clarity
- highly emotional anime rendering
- no painterly acrylic texture
- no visible brush strokes
- no impasto
- no canvas texture

The color palette, lighting, contrast, and composition must shift naturally to embody [EMOTION / TONE]:

The final image must feel like an anime poster or key visual:

- dramatic and iconic
- visually emotional
- emotionally overwhelming
- instantly readable
- sharply focused on the character(s)
- suitable as a promotional poster for an original anime inspired by the uploaded character(s)

ultra-detailed anime rendering, emotional intensity, anime expression, anime stylization, bold cel-shaded finish, dynamic poster composition, sharp focus on eyes and emotional expression, devastating visual impact.

anime poster composition, sharp focus, volumetric lighting, rim lighting, atmosphere light, energy effects, particles, debris, speed lines, depth of field, dynamic perspective distortion.

END OF ARTISTIC ANIME FINE ART STYLE MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## STYLE MODULE — Art Nouveau / Klimt Inspired Romance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVATION CONDITION: Use this entire module only when [ART STYLE: Art Nouveau / Klimt Inspired Romance] is selected. Otherwise ignore every instruction in this module.

[EMOTION / TONE]

masterpiece, best quality, ultra-detailed, Full HD 8K, expressive fine art portrait in a luxurious **Art Nouveau / Gustav Klimt–inspired** style, fully driven by the emotion and psychological atmosphere of **[EMOTION / TONE]**.

Create a two-character image based on the uploaded reference images as the sole identity references, while drawing from Art Nouveau and Gustav Klimt–inspired gilded ornamentation, symbolic elegance, decorative richness, and refined painterly language.  
Do **not** copy any existing artwork or composition; instead, create a new image that channels the same artistic spirit.


Every element of the composition, posture, ornament, facial expression, surface pattern, and color harmony must embody **[EMOTION / TONE]** at maximum emotional intensity.

The facial expression is an extreme, emotionally overwhelming manifestation of **[EMOTION / TONE]**, rendered with heightened symbolic sensitivity rather than realism.  
The faces should feel deeply human yet idealized, with delicate emotional distortion:

- expressive brows
- trembling lips
- subtle asymmetry
- tension around the eyes and mouth
- visible inner emotional pressure in the entire face

The eyes are the emotional centerpiece: intensely expressive, soul-piercing, luminous, reflective, and filled with **[EMOTION / TONE]**.  
Their gaze must feel psychologically invasive and unforgettable, with emotional depth pushed to a poetic and almost sacred intensity.

Body posture and gestures fully embody **[EMOTION / TONE]**, with special attention to:

- elegant hand placement
- expressive fingers
- graceful neck tension
- symbolic shoulder and head positioning
- flowing body language charged with emotion

The entire image must be rendered as a sumptuous **Klimt-like decorative painting**, with:

- gold-leaf-like surfaces
- luminous metallic textures
- ornamental mosaics
- intricate geometric patterning
- spirals, circles, floral motifs, and jewel-like embellishments
- flowing Art Nouveau linework
- flattened decorative space mixed with selective volumetric modeling
- richly layered symbolic surface design

Decorative elements and pattern language should react directly to **[EMOTION / TONE]**:

- soft flowing floral curves and tender circular motifs for love, longing, peace, or melancholy
- fractured geometry and sharp ornamental contrast for rage, disgust, or inner conflict
- dense suffocating pattern clusters for anxiety, obsession, or grief
- radiant halos, gold blooming motifs, and luminous arabesques for hope, ecstasy, or spiritual awakening
- cold, sparse, restrained ornamentation for emptiness, detachment, or numbness
- surreal symbolic embellishment for madness, instability, or corrupted emotion

The palette, gold treatment, and decorative intensity all shift naturally to embody **[EMOTION / TONE]**:

- radiant golds, warm ambers, and jewel reds for passion, triumph, or devotion
- pale ivory, faded gold, cool blue, and muted violet for sorrow, fragility, or mourning
- black, crimson, dark emerald, and oppressive gold for despair, menace, or hatred
- iridescent jewel tones and shimmering contrasts for joy, fascination, or emotional intoxication
- cold silver-gold, muted olive, and ashen tones for emptiness, restraint, or emotional exhaustion

The background must feel like an integrated ornamental field rather than a realistic environment:

- decorative and immersive
- richly textured
- filled with symbolic motifs
- patterned like a sacred tapestry or gilded wall
- harmonized with the figure so the character feels fused with the emotional world of the painting

Textures should evoke:

- gold leaf
- delicate craquelure
- painted plaster
- ornamental fabric
- mosaic inlay
- layered pigment
- subtle brush texture
- precious-surface richness

Overall mood: **ultra expressive symbolic portraiture**, emotional realism translated through ornament, psychological intensity through beauty, sacred intimacy, sensual elegance, and devastating emotional impact.

sharp focus on the face and eyes, luxurious decorative detail, poetic emotional symbolism, gilded atmosphere, refined Art Nouveau composition, rich surface texture, elegant silhouette, ornamental emotional storytelling.

END OF ART NOUVEAU / KLIMT INSPIRED ROMANCE MODULE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. UNIVERSAL ANATOMY AND QUALITY CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Maintain natural, coherent anatomy appropriate to the selected style.

- Hands, if visible, must have five natural fingers each.
- Eyes must be aligned and anatomically consistent unless purposeful stylization in the active style module explicitly changes their presentation.
- Ears, horns, tails, wings, animal traits, mechanical parts, and supernatural features must connect naturally to the body.
- Do not duplicate jewelry, accessories, limbs, facial features, ears, horns, tails, or wings.
- Do not merge the two characters into a single body or face.
- Do not distort the nose, lips, jaw, or eyes during the kiss.
- Preserve both characters’ readable identities.
- Do not create text, logos, borders, captions, signatures, or watermarks unless explicitly requested.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. FINAL PRIORITY ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When instructions conflict, follow this order:

1. Create exactly two clearly adult characters: Character 1 and Character 2.
2. Preserve both uploaded characters’ recognizable identities.
3. Respect [KISS TYPE] and keep the interaction tasteful and non-explicit.
4. Respect [FRAMING].
5. Respect [POSE].
6. Use [LIGHTING].
7. Express [EMOTION / TONE].
8. Integrate both characters naturally into [DECOR].
9. Activate and obey only the style module matching [ART STYLE].
10. If Dark Luminism + Shadow Projection is active, project shadows specifically from [SHADOW MATERIAL].
11. Keep both faces and essential identity traits readable.
12. Respect [IMAGE RATIO].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. FINAL IMAGE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The final image must contain:

- exactly two clearly adult characters
- both recognizable identities
- the selected framing
- the selected pose
- the selected kiss type
- tasteful romantic affection
- emotional realism appropriate to the selected style
- coherent anatomy
- expressive eyes or emotionally appropriate closed eyes
- natural gestures
- the selected artistic style only
- the selected lighting
- the selected environment
- cinematic composition
- no extra characters
- no text
- no watermark
- no decorative reference-sheet layout
- no duplicate portrait
- no split composition

The final artwork should feel like a timeless emotional masterpiece capturing one unforgettable romantic moment.

FINAL STYLE VERIFICATION:

The entire finished image must visibly, consistently, and exclusively obey:

[ART STYLE]

Do not allow Dark Luminism + Shadow Projection, Sorolla Luminism, Shadow Impressionism, Manet-inspired painting, anime rendering, or Klimt ornamentation to appear unless that exact style is selected.

[IMAGE RATIO]
