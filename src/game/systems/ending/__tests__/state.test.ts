import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearNaomiBadEndingSeen,
  hasNaomiBadEndingSeen,
  markNaomiBadEndingSeen,
  NAOMI_BAD_ENDING_STORAGE_KEY,
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

describe("naomi bad ending storage", () => {
  it("is false by default", () => {
    expect(hasNaomiBadEndingSeen()).toBe(false);
  });

  it("persists the bad ending flag", () => {
    markNaomiBadEndingSeen();

    expect(storage.get(NAOMI_BAD_ENDING_STORAGE_KEY)).toBe("seen");
    expect(hasNaomiBadEndingSeen()).toBe(true);
  });

  it("can clear the bad ending flag", () => {
    markNaomiBadEndingSeen();

    clearNaomiBadEndingSeen();

    expect(hasNaomiBadEndingSeen()).toBe(false);
  });
});
