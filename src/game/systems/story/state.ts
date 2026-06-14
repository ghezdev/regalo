import type { NaomiStoryState } from "../../types/story";

export const STORY_STORAGE_KEY = "regalo.story.naomi";

export function createInitialNaomiStoryState(): NaomiStoryState {
  return {
    stepId: "castle-intro",
    visitedInteriors: [],
    triggeredDialogues: [],
    endingLocked: false,
  };
}

export function loadNaomiStoryState(): NaomiStoryState {
  if (typeof localStorage === "undefined") {
    return createInitialNaomiStoryState();
  }

  const raw = localStorage.getItem(STORY_STORAGE_KEY);

  if (!raw) {
    return createInitialNaomiStoryState();
  }

  try {
    const parsed = JSON.parse(raw) as NaomiStoryState;

    return {
      ...parsed,
      endingChoice: parsed.endingChoice,
    };
  } catch {
    return createInitialNaomiStoryState();
  }
}

export function saveNaomiStoryState(state: NaomiStoryState) {
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(state));
}
