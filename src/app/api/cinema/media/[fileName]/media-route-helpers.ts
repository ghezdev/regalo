import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";

const FOTOS_DIRECTORY = path.resolve(process.cwd(), "fotos");

export const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

interface ResolvedMediaPath {
  filePath: string;
  size: number;
}

export interface ByteRange {
  start: number;
  end: number;
}

export function getMediaStream(filePath: string, range: ByteRange | null) {
  return createReadStream(
    filePath,
    range ? { start: range.start, end: range.end } : undefined,
  );
}

export async function resolveMediaPath(fileName: string): Promise<ResolvedMediaPath> {
  const requestedPath = path.resolve(FOTOS_DIRECTORY, fileName);
  const [resolvedDirectoryPath, resolvedFilePath] = await Promise.all([
    fs.realpath(FOTOS_DIRECTORY),
    fs.realpath(requestedPath),
  ]);

  if (!isPathInsideDirectory(resolvedFilePath, resolvedDirectoryPath)) {
    throw createInvalidPathError();
  }

  const stats = await fs.stat(resolvedFilePath);

  if (!stats.isFile()) {
    throw createInvalidPathError();
  }

  return {
    filePath: resolvedFilePath,
    size: stats.size,
  };
}

export function parseRangeHeader(
  rangeHeader: string | null,
  fileSize: number,
): ByteRange | "invalid" | null {
  if (!rangeHeader) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);

  if (!match) {
    return "invalid";
  }

  const [, startValue, endValue] = match;

  if (!startValue && !endValue) {
    return "invalid";
  }

  if (!startValue) {
    const suffixLength = Number(endValue);

    if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
      return "invalid";
    }

    const start = Math.max(fileSize - suffixLength, 0);
    return { start, end: fileSize - 1 };
  }

  const start = Number(startValue);
  const requestedEnd = endValue ? Number(endValue) : fileSize - 1;
  const end = Math.min(requestedEnd, fileSize - 1);

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(requestedEnd) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    return "invalid";
  }

  return { start, end };
}

export function decodeFileName(rawFileName: string): string | null {
  try {
    return decodeURIComponent(rawFileName);
  } catch {
    return null;
  }
}

export function isValidFileName(fileName: string | null): fileName is string {
  if (!fileName || fileName === "." || fileName === "..") {
    return false;
  }

  if (fileName.includes("/") || fileName.includes("\\")) {
    return false;
  }

  return path.basename(fileName) === fileName;
}

export function buildResponseHeaders(input: {
  contentType: string;
  size: number;
  range: ByteRange | null;
}): Headers {
  const headers = new Headers();

  headers.set("Content-Type", input.contentType);
  headers.set("Accept-Ranges", "bytes");

  if (input.range) {
    headers.set("Content-Length", String(input.range.end - input.range.start + 1));
    headers.set("Content-Range", `bytes ${input.range.start}-${input.range.end}/${input.size}`);
    return headers;
  }

  headers.set("Content-Length", String(input.size));
  return headers;
}

export function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

export function isInvalidPathError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EINVAL";
}

export function createInvalidPathError(): NodeJS.ErrnoException {
  const error = new Error("Invalid file path") as NodeJS.ErrnoException;
  error.code = "EINVAL";
  return error;
}

export function isVideoContentType(contentType: string): boolean {
  return contentType.startsWith("video/");
}

function isPathInsideDirectory(filePath: string, directoryPath: string): boolean {
  const relativePath = path.relative(directoryPath, filePath);

  return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}
