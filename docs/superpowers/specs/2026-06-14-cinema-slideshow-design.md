# Cinema Slideshow Design

## Summary

Replace the current cinema auto-open YouTube overlay with a Naomi-only slideshow overlay that presents:

1. link slides sourced from `links.txt`;
2. media slides sourced from the `fotos/` directory;
3. a final YouTube slide.

The slideshow is manual, not automatic. Naomi navigates with visible buttons and keyboard shortcuts. Link slides open the target in a new browser tab and persist their opened state in `localStorage` so the interface can show which ones were already visited.

Guillermo does not get this slideshow. Entering the cinema as Guillermo should keep the interior scene available without auto-opening the Naomi content.

## Goals

- Turn the cinema into a personal Naomi-only memory sequence.
- Keep content editable through local files instead of hardcoded arrays.
- Preserve the current Phaser plus React overlay split.
- Show a clear visited state for external links.
- Support mixed content slides: links, images, videos, and a final embedded YouTube video.

## Non-Goals

- No CMS or admin UI for managing slides.
- No database or remote persistence.
- No automatic slide progression.
- No Guillermo-specific cinema experience beyond not opening Naomi's slideshow.
- No attempt to embed Instagram content inline; links open externally.

## Current State

Today, entering the `cine` interior triggers `setCineVideoOpen(true)` from `InteriorScene`, and `GameOverlay` renders `CineVideoPlayer`, which embeds a single YouTube iframe.

The new design keeps the overlay pattern but changes the cinema overlay from a single-purpose player into a slideshow viewer.

## Content Sources

### Links

- Source file: repository-root `links.txt`
- Format: one URL per non-empty line
- Parsing rule: trim whitespace and ignore blank lines
- Order: preserve file order

### Photos And Videos

- Source directory: repository-root `fotos/`
- Inclusion rule: take supported files only
- Initial supported image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
- Initial supported video extensions: `.mp4`, `.webm`, `.mov`
- Order: alphabetical by filename
- Presentation rule: one file equals one slide

### Final YouTube Slide

- Source: existing cinema YouTube configuration
- Position: always the final slide

## Slide Model

The overlay client should receive a normalized slide list with explicit types:

```ts
type CinemaSlide =
  | { id: string; kind: "link"; url: string; label: string }
  | { id: string; kind: "image"; src: string; alt: string; fileName: string }
  | { id: string; kind: "video"; src: string; fileName: string }
  | { id: string; kind: "youtube"; youtubeId: string };
```

Rules:

- `id` must be stable across reloads.
- Link slide `label` can default to the URL hostname/path if no friendlier label exists.
- Media slide `src` should resolve to a browser-accessible URL, not a filesystem path.

## Data Loading Architecture

The browser should not read `links.txt` or inspect `fotos/` directly.

Instead, add a small server-side content loader that:

1. reads `links.txt` from the project root;
2. lists files inside `fotos/`;
3. filters supported media extensions;
4. sorts media files alphabetically;
5. maps both sources into the normalized slide model;
6. appends the YouTube slide last.

Recommended shape:

- a server utility module dedicated to cinema content loading;
- a lightweight API route or server-provided JSON endpoint that the client overlay can request;
- a small client data hook or effect inside the overlay to fetch and render the slides.

This keeps file I/O on the server and the overlay purely client-side.

## Static File Delivery

Media currently lives in `fotos/` at the repository root, which is not directly web-accessible in Next.js.

To keep the requested source-of-truth while remaining browser-compatible, the implementation should expose these files through a controlled server route for read-only playback. The route should:

- accept a validated filename or file identifier;
- serve only files from `fotos/`;
- reject path traversal attempts;
- set the correct content type for images and videos.

This preserves `fotos/` as the editable source while avoiding a manual duplicate copy into `public/`.

## Access Rules

- Only Naomi should auto-open the cinema slideshow on entering the `cine` interior.
- Guillermo should not auto-open the slideshow.
- The slideshow content itself does not need hard security; the goal is experience scoping, not protection.

The simplest implementation is to gate the auto-open behavior using the existing session/character identity already available to the game shell.

## Overlay Behavior

### Opening

- Naomi enters the cinema interior.
- The slideshow overlay opens automatically.
- Initial position is slide `0`.

### Closing

- `Escape` closes the overlay.
- Clicking the close button closes the overlay.
- Closing does not clear visited link state.

### Navigation

- Visible previous and next buttons.
- Keyboard shortcuts:
  - `ArrowLeft` and `A`: previous slide
  - `ArrowRight` and `D`: next slide
- Navigation clamps to the valid range.
- The overlay should show current position, for example `3 / 12`.

## Slide Rendering

### Link Slide

Each link slide should show:

- a title or label derived from the URL;
- the full URL in readable form;
- a strong action button such as `Abrir recuerdo`;
- a visited badge.

When the action button is used:

- open the URL in a new tab with `window.open(url, "_blank", "noopener,noreferrer")`;
- mark the URL as opened in `localStorage`;
- immediately refresh the badge state in the UI.

Badge states:

- `Pendiente`
- `Abierto`

### Image Slide

- Render a single image centered in the overlay.
- Use the filename as fallback alt text.
- Scale to fit while preserving aspect ratio.

### Video Slide

- Render a native HTML `<video controls>` player.
- Do not autoplay by default.
- Scale to fit inside the content frame.

### YouTube Slide

- Reuse the current embed approach.
- Keep autoplay enabled only for this final slide if it matches current behavior.
- Keep the same close and keyboard handling as the rest of the slideshow.

## Persistence

Visited link state should be stored in `localStorage` under a Naomi-specific key, for example:

```ts
"regalo.cine.naomi.opened-links"
```

Recommended stored shape:

```ts
string[]
```

Where each string is the exact URL that has been opened.

Rules:

- The store is updated only when Naomi opens a link.
- Missing or invalid stored data falls back to an empty set.
- Guillermo never writes to or reads this storage for overlay behavior.

## UI And Visual Direction

The slideshow should feel like part of the game overlay, not like a generic web modal.

Requirements:

- keep the current romantic RPG framing;
- use the existing cinema overlay styling as a base, then extend it;
- large central framed content area;
- clearly styled previous/next controls;
- visible visited badge for links;
- text readable on both desktop and mobile;
- retain keyboard support and obvious close affordance.

The UI should still feel intentional inside the game world:

- not a modern carousel library look;
- not a bare browser file viewer;
- not an Instagram-like feed.

## Error Handling

- If `links.txt` is missing or unreadable, treat links as an empty section.
- If `fotos/` is missing or unreadable, treat media as an empty section.
- If both are empty, still show the final YouTube slide.
- If a specific media file fails to load, render a simple failure message for that slide and allow navigation to continue.
- If the content fetch fails entirely, show a compact in-overlay error state and a close button.

## Testing Strategy

Follow TDD for implementation. Minimum coverage:

1. server loader test:
   - trims blank lines from `links.txt`;
   - preserves link order;
   - sorts media alphabetically;
   - classifies image vs video correctly;
   - appends YouTube last.
2. visited-links storage test:
   - loads empty state by default;
   - persists opened URLs;
   - ignores invalid JSON safely.
3. overlay component test or narrow behavior test:
   - renders a link slide state correctly;
   - advances and rewinds slide index;
   - marks a link as opened after activation.

If component-level tests are too expensive in the current setup, keep the UI logic small and cover the stateful helpers directly.

## Implementation Plan

1. Add failing tests for cinema content loading and visited-link persistence.
2. Create a server-side cinema content loader using `links.txt` and `fotos/`.
3. Add a read-only route for serving files from `fotos/`.
4. Replace `CineVideoPlayer` with a slideshow overlay component.
5. Add client helpers for Naomi link visited state.
6. Gate cinema auto-open so it triggers only for Naomi.
7. Re-run relevant tests, then lint/build as appropriate.

## Risks And Mitigations

- Root-level `fotos/` is not public by default.
  Mitigation: serve through a validated route.
- Existing overlay state only stores a boolean open flag.
  Mitigation: keep open/close state simple and let the overlay fetch its own slide data on mount.
- Link labels may be ugly if derived directly from raw URLs.
  Mitigation: start with parsed host/path display and improve later only if needed.
- Large media files could make the overlay feel heavy.
  Mitigation: keep rendering simple and avoid preloading every video aggressively.

## Success Criteria

- Naomi enters the cinema and sees a slideshow instead of the single YouTube embed.
- The first slides come from `links.txt`.
- Clicking a link opens a new tab and marks it as opened persistently.
- The next slides come from `fotos/` in alphabetical order, one item per slide.
- The final slide is the current YouTube video.
- Guillermo can still enter the cinema interior without auto-opening Naomi's slideshow.
