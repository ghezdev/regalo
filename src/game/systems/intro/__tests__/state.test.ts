import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasSeenNaomiIntro,
  markNaomiIntroAsSeen,
  NAOMI_INTRO_STORAGE_KEY,
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

describe("naomi intro storage", () => {
  it("returns false when the intro has not been seen yet", () => {
    expect(hasSeenNaomiIntro()).toBe(false);
  });

  it("marks the intro as seen in localStorage", () => {
    markNaomiIntroAsSeen();

    expect(storage.get(NAOMI_INTRO_STORAGE_KEY)).toBe("seen");
    expect(hasSeenNaomiIntro()).toBe(true);
  });
});
