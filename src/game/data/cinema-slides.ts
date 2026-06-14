export type CinemaSlide =
  | {
      id: string;
      kind: "links";
      items: Array<{ url: string; label: string }>;
    }
  | {
      id: string;
      kind: "image";
      src: string;
      alt: string;
      fileName: string;
    }
  | {
      id: string;
      kind: "video";
      src: string;
      label: string;
      fileName: string;
    }
  | {
      id: string;
      kind: "youtube";
      youtubeId: string;
      label: string;
    };

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

interface BuildCinemaSlidesInput {
  links: string[];
  mediaFiles: string[];
  youtubeId: string;
}

export function normalizeCinemaLinks(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean);
}

export function sortSupportedCinemaMedia(fileNames: string[]): string[] {
  return [...fileNames]
    .filter((fileName) => {
      const extension = getLowerCaseExtension(fileName);
      return IMAGE_EXTENSIONS.has(extension) || VIDEO_EXTENSIONS.has(extension);
    })
    .sort((left, right) => left.localeCompare(right));
}

export function buildCinemaSlides(input: BuildCinemaSlidesInput): CinemaSlide[] {
  const seenIds = new Map<string, number>();

  const normalizedLinks = normalizeCinemaLinks(input.links);
  const linksSlide: CinemaSlide[] = normalizedLinks.length > 0
    ? [{ id: "links", kind: "links", items: normalizedLinks.map((url) => ({ url, label: url })) }]
    : [];

  const mediaSlides: CinemaSlide[] = sortSupportedCinemaMedia(input.mediaFiles).flatMap<CinemaSlide>(
    (fileName) => {
      const extension = getLowerCaseExtension(fileName);
      const src = `/api/cinema/media/${encodeURIComponent(fileName)}`;

      if (IMAGE_EXTENSIONS.has(extension)) {
        return [
          {
            id: createUniqueId(seenIds, `image-${fileName}`),
            kind: "image" as const,
            src,
            alt: fileName,
            fileName,
          },
        ];
      }

      if (VIDEO_EXTENSIONS.has(extension)) {
        return [
          {
            id: createUniqueId(seenIds, `video-${fileName}`),
            kind: "video" as const,
            src,
            label: fileName,
            fileName,
          },
        ];
      }

      return [] as CinemaSlide[];
    },
  );

  const youtubeId = input.youtubeId.trim();

  return youtubeId
    ? [
        ...linksSlide,
        ...mediaSlides,
        {
          id: createUniqueId(seenIds, `youtube-${youtubeId}`),
          kind: "youtube",
          youtubeId,
          label: "YouTube",
        },
      ]
    : [...linksSlide, ...mediaSlides];
}

function getLowerCaseExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

function createUniqueId(seenIds: Map<string, number>, baseId: string): string {
  const count = (seenIds.get(baseId) ?? 0) + 1;
  seenIds.set(baseId, count);

  return count === 1 ? baseId : `${baseId}-${count}`;
}
