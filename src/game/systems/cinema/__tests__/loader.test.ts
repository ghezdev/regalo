import { beforeEach, describe, expect, it, vi } from "vitest";

const fileSystemMocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("node:fs", () => ({
  promises: fileSystemMocks,
}));

import { cineVideoConfig } from "../../../data/cine";
import {
  loadCinemaLinks,
  loadCinemaMediaFiles,
  loadCinemaSlides,
} from "../loader";

function createDirent(name: string, isFile: boolean) {
  return {
    name,
    isFile: () => isFile,
  };
}

describe("cinema loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and normalizes cinema links from links.txt", async () => {
    fileSystemMocks.readFile.mockResolvedValue(
      "  https://example.com/a  \n\nhttps://example.com/b\n   \n",
    );

    await expect(loadCinemaLinks()).resolves.toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
  });

  it("reads media files, keeps only files, and filters unsupported extensions", async () => {
    fileSystemMocks.readdir.mockResolvedValue([
      createDirent("zeta.mp4", true),
      createDirent("folder", false),
      createDirent("alfa.jpeg", true),
      createDirent("notes.txt", true),
      createDirent("beta.webp", true),
    ]);

    await expect(loadCinemaMediaFiles()).resolves.toEqual([
      "alfa.jpeg",
      "beta.webp",
      "zeta.mp4",
    ]);
  });

  it("returns empty results for missing links.txt and fotos/", async () => {
    const missingError = Object.assign(new Error("missing"), { code: "ENOENT" });
    fileSystemMocks.readFile.mockRejectedValue(missingError);
    fileSystemMocks.readdir.mockRejectedValue(missingError);

    await expect(loadCinemaLinks()).resolves.toEqual([]);
    await expect(loadCinemaMediaFiles()).resolves.toEqual([]);
  });

  it("warns on unexpected filesystem failures while preserving the empty fallback", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unexpectedError = new Error("disk offline");
    fileSystemMocks.readFile.mockRejectedValue(unexpectedError);

    await expect(loadCinemaLinks()).resolves.toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      "Failed to load cinema links from links.txt.",
      unexpectedError,
    );

    warnSpy.mockRestore();
  });

  it("builds slides from loaded links, media, and the configured youtube id", async () => {
    fileSystemMocks.readFile.mockResolvedValue("https://example.com/a\n");
    fileSystemMocks.readdir.mockResolvedValue([
      createDirent("photo.jpeg", true),
      createDirent("clip.mp4", true),
    ]);

    const slides = await loadCinemaSlides();

    expect(slides.map((slide) => slide.kind)).toEqual([
      "link",
      "video",
      "image",
      "youtube",
    ]);
    expect(slides.at(-1)).toMatchObject({
      kind: "youtube",
      youtubeId: cineVideoConfig.youtubeId,
    });
  });
});
