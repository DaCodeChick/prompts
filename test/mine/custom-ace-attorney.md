# 3D Character-Driven Courtroom Mystery Game

Create a polished, fully playable **3D courtroom mystery/adventure game inspired by the dramatic deduction structure of courtroom games such as Ace Attorney**, while creating an entirely original case, world, dialogue, interface, evidence, and presentation.

The game should combine:

**3D character acting + investigation + evidence gathering + courtroom testimony + cross-examination + contradictions + deductions + dramatic legal confrontations**

The result should feel like a compact high-end indie courtroom game, not a visual novel, static dialogue demo, or collection of pre-rendered character images.

---

# CHARACTER REFERENCES

I will provide exactly **four character reference images/sheets**.

Interpret them in this order:

1. **Defense Attorney — Player Character**
2. **Prosecutor**
3. **Witness**
4. **Judge**

Use each supplied reference as the visual identity authority for that character.

## IMPORTANT: CREATE 3D CHARACTERS

Do **not** create collections of 2D poses, sprites, character cards, or pre-rendered reaction images.

Instead, interpret each supplied character reference as a **3D character-modeling reference** and construct a recognizable real-time 3D representation of that character.

Faithfully reproduce as much of the supplied design as reasonably possible, including:

* Face shape
* Facial proportions
* Eyes
* Eyebrows
* Nose
* Mouth
* Hairstyle
* Hair color
* Skin tone
* Body proportions
* Height relationships
* Clothing
* Clothing silhouette
* Accessories
* Distinctive features
* Overall visual personality

Do not simply paste the reference image onto a flat plane or billboard.

The characters must exist as actual dimensional figures within the courtroom.

Prioritize **recognizable identity over unnecessary geometric complexity**. A well-designed stylized 3D approximation that clearly resembles the supplied reference is preferable to an extremely expensive model that fails to preserve the character's identity.

---

# FACIAL EXPRESSIONS

Each 3D character should have a functional facial-expression system.

At minimum support variations of:

* Neutral
* Happy
* Confident
* Concerned
* Angry
* Sad
* Shocked
* Suspicious
* Nervous
* Frustrated
* Thinking

Expressions should be created through actual changes to the face wherever technically practical, such as:

* Eyebrow positioning
* Eyelid openness
* Eye direction
* Mouth shape
* Jaw movement
* Head orientation

Avoid simply changing the character's texture to simulate every emotion.

Characters should blink naturally and occasionally shift their gaze.

---

# BODY LANGUAGE

Body language is extremely important.

Characters should not remain frozen while dialogue occurs.

Create reusable procedural or skeletal animation states such as:

### Defense Attorney

* Neutral courtroom stance
* Reading documents
* Thinking
* Leaning over the bench
* Nervous hesitation
* Confident posture
* Looking toward prosecutor
* Looking toward witness
* Pointing during a major objection
* Recoiling in surprise
* Celebrating a breakthrough

### Prosecutor

* Neutral
* Arms crossed
* Reading evidence
* Confident
* Smug
* Pointing toward defense
* Objecting
* Frustrated
* Surprised
* Losing composure

### Witness

* Calm testimony
* Casual gesturing
* Thinking
* Looking away
* Nervous fidgeting
* Sweating/panicking through animation
* Defensive posture
* Anger
* Shock
* Physical hesitation
* Breakdown

### Judge

* Listening
* Thinking
* Looking between attorneys
* Confused
* Stern
* Surprised
* Gavel strike
* Delivering a ruling
* Delivering the verdict

Animations can be procedurally generated, skeletal, IK-assisted, or otherwise implemented without external animation assets.

Transitions between poses should be reasonably smooth.

---

# CONTEXTUAL ACTING

Character animation must respond to the actual conversation.

Do not simply loop idle animations regardless of context.

For example, if the defense discovers a contradiction:

* Defense becomes confident.
* Camera shifts toward the defense.
* Defense points toward the witness.
* Witness recoils.
* Prosecutor reacts.
* Judge looks surprised.

If the prosecutor successfully counters the argument:

* Defense's confidence drops.
* Prosecutor becomes smug.
* Witness relaxes slightly.
* Judge looks toward the defense.

If a witness is being cornered:

* Their posture should gradually deteriorate.
* Eye contact becomes less consistent.
* Idle movement becomes more nervous.
* Facial expression changes.
* Their final breakdown should be visually distinct from their initial testimony.

The 3D characters should therefore **perform the courtroom scene**, not merely stand inside it.

---

# 3D COURTROOM

Construct a complete 3D courtroom containing:

* Defense bench
* Prosecutor bench
* Witness stand
* Judge's bench
* Gallery
* Doors
* Railings
* Courtroom decorations
* Lighting fixtures
* Relevant architectural detail

The courtroom should have a strong visual identity of its own rather than directly reproducing an existing game's courtroom.

Use good lighting with clearly visible characters.

Avoid excessively dark shadows or washed-out lighting.

---

# CINEMATIC CAMERA SYSTEM

Use a dynamic camera system to make dialogue visually engaging.

Possible shots include:

* Defense close-up
* Prosecutor close-up
* Witness close-up
* Judge close-up
* Wide courtroom shot
* Defense versus prosecutor composition
* Low-angle objection shot
* Evidence close-up
* Witness reaction shot
* Slow push toward a character during a revelation

Important deductions should use more dramatic framing than ordinary dialogue.

Camera changes should follow conversational context.

Avoid excessive random camera movement.

---

# ORIGINAL CASE

Create an entirely original legal mystery that you find interesting.

Do not reveal the solution to the player beforehand.

Internally establish the complete truth before gameplay:

* What actually happened
* Exact timeline
* Motive
* Culprit, if applicable
* Locations
* Actions of relevant characters
* What the witness actually observed
* What the witness believes happened
* What information is deliberately hidden
* Physical evidence
* Incorrect investigative assumptions
* Prosecution theory
* Defense theory
* Ultimate contradiction

The mystery must have a fixed solution.

**Never dynamically change the culprit to agree with the player's theory.**

Every major revelation must follow logically from previously obtainable evidence.

Include misdirection, but play fair.

---

# INVESTIGATION

Before the trial, provide a playable investigation sequence.

Allow the player to explore relevant **3D locations** associated with the case.

The player should be able to:

* Move around
* Inspect objects
* Examine important areas
* Speak with characters
* Gather evidence
* Discover clues
* Unlock conversation topics
* Review information

Important evidence should exist as actual objects within the environment whenever practical.

The investigation should reward observation.

---

# COURT RECORD

The player has a persistent evidence inventory called the **Court Record**.

Evidence can include:

* Physical objects
* Photographs
* Documents
* Receipts
* Maps
* Forensic reports
* Security records
* Personal belongings
* Digital evidence
* Witness statements

Each item should contain:

* Name
* Visual representation
* Description
* Known facts

Evidence descriptions may update as new information is discovered.

Evidence must have actual gameplay relevance.

---

# TESTIMONY AND CROSS-EXAMINATION

Witness testimony is divided into individual statements.

Allow the player to navigate backward and forward between statements.

For each statement provide:

**PRESS**

Question the witness about that particular statement.

Pressing may:

* Reveal additional details
* Produce new dialogue
* Change testimony
* Add a statement
* Reveal nervous behavior
* Update evidence
* Unlock new information

**PRESENT**

Open the Court Record and allow the player to select evidence contradicting the current statement.

Do not indicate which statement contains the contradiction.

Do not highlight the correct evidence.

The player must reason it out.

---

# DRAMATIC OBJECTIONS

When the player successfully proves a contradiction, make it feel important.

Use:

* Dramatic camera cut
* Defense animation
* Pointing gesture
* Facial expression change
* Impact effect
* Screen shake where appropriate
* Sound effect
* Original objection callout
* Prosecutor reaction
* Witness reaction
* Judge reaction

The entire courtroom should momentarily feel affected by a major objection.

Do not end every contradiction with immediate success.

The prosecutor should frequently respond with another plausible interpretation that forces the player to reason further.

---

# MULTIPLE-CHOICE DEDUCTIONS

Important arguments should occasionally require the player to answer a question.

Example:

**If the witness couldn't have seen the defendant leave, what does that imply?**

A. The witness invented the entire story
B. The defendant used another exit
C. The witness was somewhere else
D. The recorded time is incorrect

Some deductions should require:

**Choose conclusion → Present supporting evidence**

Wrong choices should produce unique responses rather than immediately converging on the correct path.

---

# FAILURE SYSTEM

Use a visible **Court Confidence** or **Credibility** meter.

Incorrect actions reduce it.

Examples:

* Wrong evidence
* Unsupported accusations
* Illogical conclusions
* Repeated incorrect answers

If the meter reaches zero, the defense loses the case.

Use checkpoints so failure does not require restarting the entire game.

---

# PROSECUTOR BEHAVIOR

The prosecutor should behave like an intelligent opponent rather than a dialogue obstacle.

They should:

* Present evidence
* Question testimony
* Object
* Attack weaknesses in defense arguments
* Reinterpret evidence
* Defend their theory
* Challenge unsupported deductions

Unless the story establishes otherwise, the prosecutor does **not** secretly know the true solution.

They are arguing what they genuinely believe the evidence proves.

As their theory begins collapsing, their facial expressions, animation, body language, and dialogue should visibly change.

---

# WITNESS BEHAVIOR

The witness must not automatically be the culprit.

They may lie because they are:

* Protecting someone
* Embarrassed
* Afraid
* Hiding unrelated misconduct
* Covering up negligence
* Mistaken
* Misremembering something

Their behavior should evolve naturally as questioning progresses.

A confident witness at the beginning might gradually become:

**relaxed → irritated → defensive → nervous → frightened → exposed**

Use their 3D facial expressions and body language to communicate these changes.

---

# DIALOGUE

Use character-driven dialogue with:

* Mystery
* Legal arguments
* Humor
* Internal defense thoughts
* Character banter
* Emotional reactions
* Dramatic confrontations

Give each character a distinctive personality informed partly by their visual design.

Do not make everyone speak with the same voice.

---

# AUDIO

Create an original dynamic soundtrack with states for:

* Investigation
* Courtroom
* Testimony
* Cross-examination
* Suspicion
* Successful contradiction
* Escalating argument
* Major revelation
* Final confrontation
* Verdict

Include appropriate sound effects for:

* UI interaction
* Dialogue
* Footsteps
* Evidence
* Gavel
* Objections
* Court reactions
* Major revelations

Provide music and SFX volume controls.

---

# GAME STRUCTURE

Create a compact but complete episode:

**Title Screen**

↓

**Case Introduction**

↓

**3D Investigation**

↓

**Evidence Gathering**

↓

**Trial Begins**

↓

**Opening Arguments**

↓

**Witness Testimony**

↓

**Cross-Examination**

↓

**First Contradiction**

↓

**New Evidence / Testimony**

↓

**Major Deduction**

↓

**Case Theory Begins Collapsing**

↓

**Major Revelation**

↓

**Final Cross-Examination**

↓

**Final Evidence Presentation**

↓

**Truth Revealed**

↓

**Verdict**

↓

**Epilogue**

The game should be substantial enough that solving the case feels earned.

---

# TECHNICAL / RESOURCE PRIORITIES

This version intentionally uses **real-time 3D characters instead of generating large collections of 2D character assets**.

Reuse intelligently:

* One primary 3D model per character
* Reusable skeletons where practical
* Procedural animation
* Facial morphs / expression parameters
* Reusable gesture animations
* IK
* Camera animation
* Lighting
* Particle/impact effects

Spend resources on making the four primary character models recognizable and expressive rather than generating dozens of redundant visual assets.

Keep the experience self-contained wherever technically possible.

Do not rely on online APIs or remote runtime services for essential gameplay.

Once generated, the game should be playable without continually requesting additional AI-generated character poses or artwork.

---

# MOST IMPORTANT REQUIREMENTS

This must simultaneously function as:

1. **A reference-to-3D-character test**
2. **A facial expression and body-language test**
3. **A cinematic 3D presentation test**
4. **A coherent mystery-generation test**
5. **An evidence-management game**
6. **A genuine deduction game**

The supplied character references must remain recognizably themselves throughout the experience.

The player must genuinely solve the case through observation and reasoning.

Do not create a glorified dialogue slideshow.

Do not create characters that simply stand motionless while text appears.

Do not substitute 2D sprites for the requested 3D characters.

Do not make the correct deductions automatically.

Create a complete, expressive **3D courtroom drama built around the four supplied characters**.

Take creative ownership of the case, setting, evidence, mystery, dialogue, motives, twists, animations, cinematography, and final revelation.

**Go all out.**
