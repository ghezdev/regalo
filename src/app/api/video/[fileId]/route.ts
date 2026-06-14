const FILE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

const GOOGLE_DRIVE_DOWNLOAD_URL = "https://drive.google.com/uc?export=download";
const GOOGLE_DRIVE_CONFIRM_URL = "https://drive.usercontent.google.com/download";

interface ConfirmFormData {
  id: string;
  export: string;
  confirm: string;
  uuid: string;
}

function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("text/html");
}

async function parseConfirmForm(response: Response): Promise<ConfirmFormData | null> {
  const text = await response.text();

  const id = text.match(/name=["']id["']\s+value=["']([^"']+)["']/i)?.[1];
  const exportValue = text.match(/name=["']export["']\s+value=["']([^"']+)["']/i)?.[1];
  const confirm = text.match(/name=["']confirm["']\s+value=["']([^"']+)["']/i)?.[1];
  const uuid = text.match(/name=["']uuid["']\s+value=["']([^"']+)["']/i)?.[1];

  if (!id || !exportValue || !confirm || !uuid) {
    return null;
  }

  return { id, export: exportValue, confirm, uuid };
}

function buildResponseHeaders(upstream: Response, rangeHeader: string | null): Headers {
  const headers = new Headers();

  const contentType = upstream.headers.get("content-type");
  headers.set("Content-Type", contentType ?? "video/mp4");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  const acceptRanges = upstream.headers.get("accept-ranges");
  if (acceptRanges) {
    headers.set("Accept-Ranges", acceptRanges);
  } else if (rangeHeader) {
    headers.set("Accept-Ranges", "bytes");
  }

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }

  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Access-Control-Allow-Origin", "*");

  return headers;
}

function buildUpstreamHeaders(request: Request): Headers {
  const headers = new Headers();
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    headers.set("Range", rangeHeader);
  }
  return headers;
}

async function fetchVideoWithConfirmation(
  fileId: string,
  upstreamHeaders: Headers
): Promise<Response | null> {
  const initialUrl = new URL(GOOGLE_DRIVE_DOWNLOAD_URL);
  initialUrl.searchParams.set("id", fileId);

  const initial = await fetch(initialUrl.toString(), {
    headers: upstreamHeaders,
    redirect: "follow",
  });

  if (initial.status === 404) {
    return null;
  }

  if (!initial.ok && initial.status !== 206) {
    throw new Error("Failed to fetch video");
  }

  if (!isHtmlResponse(initial)) {
    return initial;
  }

  const formData = await parseConfirmForm(initial);
  if (!formData) {
    throw new Error("Failed to parse confirmation form");
  }

  const confirmUrl = new URL(GOOGLE_DRIVE_CONFIRM_URL);
  confirmUrl.searchParams.set("id", formData.id);
  confirmUrl.searchParams.set("export", formData.export);
  confirmUrl.searchParams.set("confirm", formData.confirm);
  confirmUrl.searchParams.set("uuid", formData.uuid);

  const confirmed = await fetch(confirmUrl.toString(), {
    headers: upstreamHeaders,
    redirect: "follow",
  });

  if (confirmed.status === 404) {
    return null;
  }

  if (!confirmed.ok && confirmed.status !== 206) {
    throw new Error("Failed to fetch video");
  }

  return confirmed;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
): Promise<Response> {
  const { fileId } = await params;

  if (!FILE_ID_REGEX.test(fileId)) {
    return new Response("Invalid file ID", { status: 400 });
  }

  const upstreamHeaders = buildUpstreamHeaders(request);
  const rangeHeader = request.headers.get("range");

  try {
    const upstream = await fetchVideoWithConfirmation(fileId, upstreamHeaders);

    if (upstream === null) {
      return new Response("Video not found", { status: 404 });
    }

    if (isHtmlResponse(upstream)) {
      return new Response("Failed to fetch video", { status: 502 });
    }

    const responseHeaders = buildResponseHeaders(upstream, rangeHeader);

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response("Failed to fetch video", { status: 502 });
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
    },
  });
}
