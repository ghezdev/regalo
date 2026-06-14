import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CINEMA_OPENED_LINKS_STORAGE_KEY,
  getOpenedCinemaLinks,
  markCinemaLinkOpened,
} from "../visited-links";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

describe("cinema visited links storage", () => {
  it("is empty by default", () => {
    expect(getOpenedCinemaLinks()).toEqual([]);
  });

  it("persists opened urls", () => {
    markCinemaLinkOpened("https://example.com/a");
    markCinemaLinkOpened("https://example.com/b");

    expect(storage.get(CINEMA_OPENED_LINKS_STORAGE_KEY)).toBe(
      JSON.stringify(["https://example.com/a", "https://example.com/b"]),
    );
    expect(getOpenedCinemaLinks()).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
  });

  it("ignores invalid json", () => {
    storage.set(CINEMA_OPENED_LINKS_STORAGE_KEY, "{not-json");

    expect(getOpenedCinemaLinks()).toEqual([]);
  });

  it("does not duplicate urls when marked more than once", () => {
    markCinemaLinkOpened("https://example.com/a");
    markCinemaLinkOpened("https://example.com/a");

    expect(getOpenedCinemaLinks()).toEqual(["https://example.com/a"]);
    expect(storage.get(CINEMA_OPENED_LINKS_STORAGE_KEY)).toBe(
      JSON.stringify(["https://example.com/a"]),
    );
  });

  it("fails safely when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(getOpenedCinemaLinks()).toEqual([]);
    expect(() => markCinemaLinkOpened("https://example.com/a")).not.toThrow();
  });
});
