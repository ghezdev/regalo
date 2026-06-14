import type { EndingChoice, NaomiStoryState, StoryStepId } from "../../types/story";

const STEP_ORDER: Record<StoryStepId, StoryStepId> = {
  "castle-intro": "castle-exit",
  "castle-exit": "plaza-castle-front",
  "plaza-castle-front": "cinema-intro",
  "cinema-intro": "cinema-exit",
  "cinema-exit": "discoteca-intro",
  "discoteca-intro": "discoteca-exit",
  "discoteca-exit": "thoughts-intro",
  "thoughts-intro": "thoughts-exit",
  "thoughts-exit": "home-intro",
  "home-intro": "home-exit",
  "home-exit": "camp-approach",
  "camp-approach": "camp-choice",
  "camp-choice": "ending",
  ending: "ending",
};

const ALLOWED_DESTINATIONS: Partial<Record<StoryStepId, string[]>> = {
  "plaza-castle-front": ["cine"],
  "discoteca-intro": ["discoteca"],
  "thoughts-intro": ["casa-pensamientos"],
  "home-intro": ["casa"],
};

export function completeStep(state: NaomiStoryState, expectedStepId: StoryStepId): NaomiStoryState {
  if (state.stepId !== expectedStepId) {
    return state;
  }
  return { ...state, stepId: STEP_ORDER[state.stepId] };
}

export function getAllowedDestinations(state: NaomiStoryState): string[] {
  if (!(state.stepId in ALLOWED_DESTINATIONS)) {
    return [];
  }
  return ALLOWED_DESTINATIONS[state.stepId] ?? [];
}

export function isPlazaStep(stepId: StoryStepId): boolean {
  return stepId in ALLOWED_DESTINATIONS;
}

export function markEndingChoice(
  state: NaomiStoryState,
  endingChoice: EndingChoice,
): NaomiStoryState {
  return { ...state, stepId: "ending", endingLocked: true, endingChoice };
}

export function isNaomiLocked(state: NaomiStoryState) {
  return state.endingLocked;
}

export const INTERIOR_STORY_STEPS: Record<string, { intro: StoryStepId; exit: StoryStepId }> = {
  castillo: { intro: "castle-intro", exit: "castle-exit" },
  cine: { intro: "cinema-intro", exit: "cinema-exit" },
  discoteca: { intro: "discoteca-intro", exit: "discoteca-exit" },
  "casa-pensamientos": { intro: "thoughts-intro", exit: "thoughts-exit" },
  casa: { intro: "home-intro", exit: "home-exit" },
};
