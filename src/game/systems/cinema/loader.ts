import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import {
  buildCinemaSlides,
  normalizeCinemaLinks,
  sortSupportedCinemaMedia,
} from "../../data/cinema-slides";
import { cineVideoConfig } from "../../data/cine";

const LINKS_FILE_PATH = path.join(process.cwd(), "links.txt");
const FOTOS_DIR_PATH = path.join(process.cwd(), "fotos");

export async function loadCinemaSlides() {
  const [links, mediaFiles] = await Promise.all([
    loadCinemaLinks(),
    loadCinemaMediaFiles(),
  ]);

  return buildCinemaSlides({
    links,
    mediaFiles,
    youtubeId: cineVideoConfig.youtubeId,
  });
}

export async function loadCinemaLinks(): Promise<string[]> {
  try {
    const fileContents = await fs.readFile(LINKS_FILE_PATH, "utf8");
    return normalizeCinemaLinks(fileContents.split(/\r?\n/));
  } catch (error) {
    warnOnUnexpectedFileSystemError(
      error,
      "Failed to load cinema links from links.txt.",
    );
    return [];
  }
}

export async function loadCinemaMediaFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(FOTOS_DIR_PATH, { withFileTypes: true });

    return sortSupportedCinemaMedia(
      entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
    );
  } catch (error) {
    warnOnUnexpectedFileSystemError(
      error,
      "Failed to load cinema media from fotos/.",
    );
    return [];
  }
}

function warnOnUnexpectedFileSystemError(error: unknown, message: string) {
  if (isExpectedFileSystemError(error)) {
    return;
  }

  console.warn(message, error);
}

function isExpectedFileSystemError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return ["ENOENT", "EACCES", "EPERM", "ENOTDIR"].includes(String(error.code));
}
