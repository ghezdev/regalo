import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitialNaomiStoryState,
  loadNaomiStoryState,
  saveNaomiStoryState,
  STORY_STORAGE_KEY,
} from "../state";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

describe("naomi story state storage", () => {
  it("creates the castle intro state by default", () => {
    expect(createInitialNaomiStoryState()).toMatchObject({
      stepId: "castle-intro",
      visitedInteriors: [],
      triggeredDialogues: [],
      endingLocked: false,
    });
  });

  it("returns the initial state when storage is empty", () => {
    expect(loadNaomiStoryState()).toMatchObject({
      stepId: "castle-intro",
      endingLocked: false,
    });
  });

  it("round-trips a saved story state", () => {
    const state = {
      stepId: "camp-choice" as const,
      visitedInteriors: ["cine", "discoteca"],
      triggeredDialogues: ["castle.intro.1"],
      endingLocked: false,
      endingChoice: undefined,
    };

    saveNaomiStoryState(state);

    expect(storage.get(STORY_STORAGE_KEY)).toContain("\"camp-choice\"");
    expect(loadNaomiStoryState()).toMatchObject(state);
  });
});
