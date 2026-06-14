import { Readable } from "node:stream";
import path from "node:path";
import {
  buildResponseHeaders,
  CONTENT_TYPES,
  decodeFileName,
  getMediaStream,
  isInvalidPathError,
  isMissingFileError,
  isValidFileName,
  isVideoContentType,
  parseRangeHeader,
  resolveMediaPath,
} from "./media-route-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileName: string }> },
): Promise<Response> {
  const { fileName: rawFileName } = await params;
  const fileName = decodeFileName(rawFileName);

  if (!isValidFileName(fileName)) {
    return new Response("Invalid file name", { status: 400 });
  }

  const extension = path.extname(fileName).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    return new Response("Invalid file name", { status: 400 });
  }

  try {
    const { filePath, size } = await resolveMediaPath(fileName);
    const rangeHeader = request.headers.get("range");
    const range = isVideoContentType(contentType)
      ? parseRangeHeader(rangeHeader, size)
      : null;

    if (rangeHeader && isVideoContentType(contentType) && range === "invalid") {
      return new Response("Invalid range", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    const stream = getMediaStream(filePath, range && range !== "invalid" ? range : null);
    const headers = buildResponseHeaders({
      contentType,
      size,
      range: range && range !== "invalid" ? range : null,
    });

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: range && range !== "invalid" ? 206 : 200,
      headers,
    });
  } catch (error) {
    if (isMissingFileError(error)) {
      return new Response("Not found", { status: 404 });
    }

    if (isInvalidPathError(error)) {
      return new Response("Invalid file name", { status: 400 });
    }

    return new Response("Failed to read file", { status: 500 });
  }
}
