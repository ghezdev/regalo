import { describe, expect, it } from "vitest";

import {
  buildCinemaSlides,
  normalizeCinemaLinks,
  sortSupportedCinemaMedia,
} from "../cinema-slides";

describe("cinema slide normalization", () => {
  it("builds a single links slide, then media, then youtube", () => {
    const slides = buildCinemaSlides({
      links: ["https://example.com/a", "https://example.com/b"],
      mediaFiles: [
        "zeta.mp4",
        "alfa.jpeg",
        "middle image.png",
        "beta.webp",
        "notes.txt",
      ],
      youtubeId: "video123",
    });

    expect(slides.map((slide) => slide.kind)).toEqual([
      "links",
      "image",
      "image",
      "image",
      "video",
      "youtube",
    ]);

    expect(slides[0]).toMatchObject({
      id: "links",
      kind: "links",
      items: [
        { url: "https://example.com/a", label: "https://example.com/a" },
        { url: "https://example.com/b", label: "https://example.com/b" },
      ],
    });

    expect(slides[1]).toMatchObject({
      id: "image-alfa.jpeg",
      kind: "image",
      fileName: "alfa.jpeg",
      src: "/api/cinema/media/alfa.jpeg",
    });

    expect(slides[3]).toMatchObject({
      id: "image-middle image.png",
      kind: "image",
      fileName: "middle image.png",
      src: "/api/cinema/media/middle%20image.png",
    });

    expect(slides[4]).toMatchObject({
      id: "video-zeta.mp4",
      kind: "video",
      fileName: "zeta.mp4",
      src: "/api/cinema/media/zeta.mp4",
    });

    expect(slides.at(-1)).toMatchObject({
      id: "youtube-video123",
      kind: "youtube",
      youtubeId: "video123",
    });
  });

  it("omits the youtube slide when the youtube id is blank", () => {
    const slides = buildCinemaSlides({
      links: ["https://example.com/a"],
      mediaFiles: ["photo.jpeg"],
      youtubeId: "   ",
    });

    expect(slides.map((slide) => slide.kind)).toEqual(["links", "image"]);
    expect(slides.find((slide) => slide.kind === "youtube")).toBeUndefined();
  });

  it("omits the links slide when there are no links", () => {
    const slides = buildCinemaSlides({
      links: [],
      mediaFiles: ["photo.jpeg"],
      youtubeId: "video123",
    });

    expect(slides.map((slide) => slide.kind)).toEqual(["image", "youtube"]);
    expect(slides.find((slide) => slide.kind === "links")).toBeUndefined();
  });

  it("keeps media ids unique when duplicate file names appear", () => {
    const slides = buildCinemaSlides({
      links: ["https://example.com/a"],
      mediaFiles: ["photo.jpeg", "photo.jpeg", "clip.mp4", "clip.mp4"],
      youtubeId: "video123",
    });

    expect(slides.map((slide) => slide.id)).toEqual([
      "links",
      "video-clip.mp4",
      "video-clip.mp4-2",
      "image-photo.jpeg",
      "image-photo.jpeg-2",
      "youtube-video123",
    ]);

    expect(new Set(slides.map((slide) => slide.id)).size).toBe(slides.length);
  });

  it("trims blank links and filters unsupported media", () => {
    expect(
      normalizeCinemaLinks(["  https://example.com  ", "", "   ", "\thttps://example.com/b\t"]),
    ).toEqual(["https://example.com", "https://example.com/b"]);

    expect(
      sortSupportedCinemaMedia([
        "c.txt",
        "b.mp4",
        "A.JPEG",
        "notes.md",
        "z.webm",
        "d",
        "a.jpeg",
      ]),
    ).toEqual(["a.jpeg", "A.JPEG", "b.mp4", "z.webm"]);
  });

  it("normalizes incoming links before creating the links slide", () => {
    const slides = buildCinemaSlides({
      links: ["  https://example.com/a  ", "", "   ", "\thttps://example.com/b\t"],
      mediaFiles: [],
      youtubeId: "video123",
    });

    expect(slides.map((slide) => slide.kind)).toEqual(["links", "youtube"]);
    expect(slides[0]).toMatchObject({
      id: "links",
      kind: "links",
      items: [
        { url: "https://example.com/a", label: "https://example.com/a" },
        { url: "https://example.com/b", label: "https://example.com/b" },
      ],
    });
  });
});
