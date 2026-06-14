# Naomi Guided Story Design

## Summary

Add a guided narrative mode for the `naomi` player only. Naomi starts inside the castle near the bed, meets Maia the orange cat, and is led through a fixed emotional route across the world: castle, plaza, cinema, discoteca, house of thoughts, home, and camp.

Naomi always keeps manual control. Maia never drags or auto-moves Naomi. Instead, Maia appears at stage-specific locations, delivers configurable dialogue, unlocks the next destination, and advances the story when Naomi reaches the expected trigger.

The final choice is physical, not menu-based. At the camp, Naomi decides by walking into one of two world zones. After the final choice, a full black screen with `Te amo, perdon.` is shown and Naomi is blocked from entering the game again on that browser via local storage.

## Goals

- Preserve the current free-movement feel for Naomi.
- Make the guided route deterministic and easy to extend.
- Keep all narrative text outside scene logic.
- Reuse the current plaza/interior scene structure instead of replacing it.
- Limit the irreversible ending to Naomi in the current browser/session storage context.

## Non-Goals

- No real authentication or server persistence.
- No guided story for Guillermo.
- No auto-follow or pathfinding.
- No multiplayer or shared progression state.
- No generic quest editor UI in this iteration.

## Chosen Approach

Use a story state machine for Naomi, backed by content data files. Each story step defines:

- the scene context where it runs;
- Maia's spawn position;
- dialogue sequence IDs to play;
- the destination currently enabled;
- the completion trigger;
- the next story step;
- optional behavior flags such as one-time, repeatable, or blocked exit behavior.

This is preferred over ad hoc scene-specific checks because the route spans multiple maps and has strict sequencing.

## Player Experience Flow

### Naomi

1. Naomi logs in and, if not already locked, starts inside the castle near the bed.
2. Maia is present in the castle and starts the opening dialogue.
3. After that dialogue, Maia relocates to the castle exit area and guides Naomi outside.
4. In the plaza, Maia speaks again and unlocks the cinema as the next valid destination.
5. Inside the cinema, Maia explains the room and advances the route once Naomi reaches the interior exit after the dialogue sequence.
6. In the discoteca, Maia explains the playlist and asks Naomi to explore. The step completes only when Naomi returns to the exit after the room has been visited.
7. In the house of thoughts, Maia explains the button order and the emotional context. The step completes when Naomi returns to the exit after the room has been entered.
8. In the home interior, Maia asks Naomi to explore while Luna wanders inside the house. The step completes when Naomi returns to the exit after exploration.
9. Back outside, Maia delivers the final explanation about Guillermo and leads Naomi to the camp.
10. At the camp, two physical decision zones are available: stay and talk, or leave.
11. Entering either zone triggers a black full-screen ending with `Te amo, perdon.` and stores a local Naomi lock.
12. On future Naomi logins in that browser, entry is denied with a dedicated blocked-state screen/message.

### Guillermo

Guillermo keeps the current game flow. He does not use the guided story state machine and is not affected by Naomi's local ending lock.

## Story Data Model

Add a dedicated data file for Naomi's guided route, separate from generic building dialogue.

Proposed shape:

```ts
type StoryStepId =
  | "castle-intro"
  | "castle-exit"
  | "plaza-castle-front"
  | "cinema-intro"
  | "cinema-exit"
  | "discoteca-intro"
  | "discoteca-exit"
  | "thoughts-intro"
  | "thoughts-exit"
  | "home-intro"
  | "home-exit"
  | "camp-approach"
  | "camp-choice"
  | "ending";

interface StoryDialogueBlock {
  id: string;
  speaker: "maia";
  lines: string[];
  autoStart?: boolean;
  repeatable?: boolean;
}

interface StoryStepDefinition {
  id: StoryStepId;
  scene:
    | { kind: "plaza" }
    | { kind: "interior"; interiorId: "castillo" | "cine" | "discoteca" | "casa-pensamientos" | "casa" };
  maiaSpawn?: { x: number; y: number };
  dialogueIds: string[];
  objective?: {
    type: "reach-zone" | "enter-interior" | "exit-interior" | "decision-zone";
    zoneId?: string;
    interiorId?: string;
  };
  allowedDestinations?: string[];
  nextStep?: StoryStepId;
  onComplete?: "advance" | "show-ending";
}
```

Narrative text remains fully editable by changing data only. Scene code consumes IDs and conditions, not hardcoded lines.

## Runtime State Model

Add Naomi-only story state stored in local storage alongside the existing session model.

Proposed state:

```ts
interface NaomiStoryState {
  stepId: StoryStepId;
  visitedInteriors: string[];
  triggeredDialogues: string[];
  endingLocked: boolean;
  endingChoice?: "stay" | "leave";
}
```

Behavior rules:

- State is created on Naomi's first allowed login.
- State advances only when the active step objective is satisfied.
- Dialogue blocks marked one-time are tracked through `triggeredDialogues`.
- `endingLocked` blocks Naomi from entering again on that browser.
- Guillermo never reads or writes this state.

## Scene Integration

### PlazaScene

Extend the plaza scene to support two operating modes:

- default free mode for Guillermo;
- guided story mode for Naomi.

Responsibilities in guided mode:

- load the current Naomi story step;
- override Naomi's plaza spawn based on story state, not default plaza spawn;
- spawn Maia if the active step belongs to the plaza;
- only allow the currently enabled destination or interaction;
- show Maia's dialogue when Naomi reaches Maia's trigger zone;
- render final decision zones at camp during the `camp-choice` step;
- trigger the ending overlay when a decision zone is chosen.

Existing entrance labels can still render, but only the story-approved destination should respond for Naomi during guided mode.

### InteriorScene

Extend interior scene behavior for guided mode:

- support custom Naomi spawn positions per story step instead of always spawning at the exit;
- optionally spawn Maia inside the interior;
- run story dialogue on entry or near Maia;
- allow step completion when Naomi returns to the exit after the room has been visited;
- keep the current generic button-audio logic for the house of thoughts;
- keep standard exit transitions, but report completion back into Naomi story state.

The castle interior specifically needs a bed-side spawn point for Naomi and a separate Maia position.

## NPC Design

### Maia

Maia is a lightweight NPC, not a full AI actor.

Required behavior:

- static per step or relocated when the step changes;
- optional idle animation if available, otherwise static sprite;
- has a trigger zone that starts dialogue;
- can be hidden when the step does not need Maia visible.

Maia does not:

- navigate dynamically;
- collide with Naomi in a blocking way;
- escort through pathfinding;
- speak outside configured dialogue blocks.

### Luna

Luna appears only in the house interior.

Required behavior:

- uses the `cat_5` sprite set;
- wanders inside allowed walkable sub-zones;
- respects collision limits and does not leave the house walkable area;
- does not block story progression.

Luna can be implemented as a simple timed wandering NPC with random target points inside allowed movement bounds.

## Map and Zone Additions

Add data-defined helper zones for the story:

- Maia trigger zones for each relevant step.
- Optional spawn markers for Naomi inside interiors.
- Camp decision zones: `stay` and `leave`.
- A distinct castle bed spawn marker.
- House roaming bounds for Luna.

These should live in map/interior data files, not be embedded in scene logic.

## Dialogue System Changes

The current dialogue system is line-based and sufficient as a base, but it needs story-aware orchestration.

Required additions:

- support callbacks or events on dialogue completion;
- allow auto-start dialogue blocks when entering a step;
- distinguish story dialogue from generic building interaction dialogue;
- avoid replaying one-time dialogue after reload if the block has already been completed.

The dialogue box UI itself can remain visually unchanged for this iteration.

## Access Lock Behavior

After Naomi reaches either final decision zone:

- show a blocking black overlay covering the full game view;
- display only `Te amo, perdon.`;
- persist `endingLocked: true` in Naomi's local story state;
- deny Naomi access on future logins in that browser.

Denied access should happen before creating Phaser, ideally at the `/game` shell level after reading session plus Naomi lock state from local storage. This avoids loading the world just to reject entry.

## Testing Strategy

Follow TDD for the new behavior.

Add test coverage for:

- Naomi story state initialization.
- Naomi lock persistence and access rejection.
- Story step advancement rules.
- Allowed destination gating for Naomi.
- Dialogue completion advancing the correct step.
- Final decision zones marking the selected ending choice and local lock.

Prefer extracting pure helper modules for story progression so most logic can be unit-tested without Phaser scene bootstrapping.

Manual verification is still needed for:

- spawn positions in each interior;
- Maia placement and visibility;
- Luna wandering bounds;
- final black-screen presentation;
- Naomi re-login rejection after ending.

## Risks and Mitigations

### Risk: Story logic becomes tangled across both scenes

Mitigation:
Create a dedicated story controller/helper layer and keep scene responsibilities thin.

### Risk: Naomi gets soft-locked by missing triggers

Mitigation:
Represent every step with explicit objective and allowed transitions in data, then test progression helpers independently.

### Risk: Interior spawn handling conflicts with current exit-based spawn logic

Mitigation:
Add optional story-specific spawn markers and preserve current exit spawn logic as the fallback path for non-story gameplay.

### Risk: Final lock blocks the wrong player

Mitigation:
Namespace local storage by character and check the lock only for `naomi`.

## Implementation Outline

1. Add Naomi story data definitions and local-state helpers.
2. Add pure story progression helpers and tests.
3. Extend `/game` session bootstrap to reject locked Naomi access.
4. Extend plaza scene with story mode, Maia NPC, and destination gating.
5. Extend interior scene with story-aware spawn, Maia, and completion triggers.
6. Add Luna wandering behavior in the house.
7. Add final ending overlay and lock persistence.
8. Verify the full route end to end for Naomi and regression-test Guillermo.

## Open Decisions Already Resolved

- Naomi keeps manual control at all times.
- The final choice is done by walking into physical map zones.
- The post-ending lock is local to that browser/session environment, not global.
- Dialogues must remain configurable and easy to edit later.
