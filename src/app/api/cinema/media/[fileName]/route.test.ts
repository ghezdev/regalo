import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fileSystemMocks = vi.hoisted(() => ({
  createReadStream: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
}));

vi.mock("node:fs", () => ({
  createReadStream: fileSystemMocks.createReadStream,
  promises: {
    realpath: fileSystemMocks.realpath,
    stat: fileSystemMocks.stat,
  },
}));

import { GET } from "./route";
import { parseRangeHeader, resolveMediaPath } from "./media-route-helpers";

describe("cinema media route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects symlink escapes that resolve outside fotos", async () => {
    fileSystemMocks.realpath.mockImplementation(async (input: string) => {
      if (input.endsWith("/fotos")) {
        return "/repo/fotos";
      }

      return "/repo/outside/secret.mp4";
    });
    fileSystemMocks.stat.mockResolvedValue({
      isFile: () => true,
      size: 128,
    });

    await expect(resolveMediaPath("safe.mp4")).rejects.toMatchObject({
      code: "EINVAL",
    });
  });

  it("parses byte ranges for bounded and open-ended requests", () => {
    expect(parseRangeHeader("bytes=0-99", 500)).toEqual({ start: 0, end: 99 });
    expect(parseRangeHeader("bytes=100-", 500)).toEqual({ start: 100, end: 499 });
    expect(parseRangeHeader("bytes=100-9999", 500)).toEqual({ start: 100, end: 499 });
    expect(parseRangeHeader("bytes=-50", 500)).toEqual({ start: 450, end: 499 });
  });

  it("returns partial content for ranged video requests", async () => {
    fileSystemMocks.realpath.mockImplementation(async (input: string) => {
      if (input.endsWith("/fotos")) {
        return "/repo/fotos";
      }

      return "/repo/fotos/movie.mp4";
    });
    fileSystemMocks.stat.mockResolvedValue({
      isFile: () => true,
      size: 1000,
    });
    fileSystemMocks.createReadStream.mockReturnValue(Readable.from(["chunk"]));

    const response = await GET(new Request("http://localhost", {
      headers: {
        range: "bytes=100-199",
      },
    }), {
      params: Promise.resolve({ fileName: "movie.mp4" }),
    });

    expect(response.status).toBe(206);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect(response.headers.get("Accept-Ranges")).toBe("bytes");
    expect(response.headers.get("Content-Range")).toBe("bytes 100-199/1000");
    expect(response.headers.get("Content-Length")).toBe("100");
    expect(fileSystemMocks.createReadStream).toHaveBeenCalledWith(
      "/repo/fotos/movie.mp4",
      { start: 100, end: 199 },
    );
  });
});
