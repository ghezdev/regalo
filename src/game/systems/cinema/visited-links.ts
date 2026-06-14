export const CINEMA_OPENED_LINKS_STORAGE_KEY =
  "regalo.cine.naomi.opened-links";

export function getOpenedCinemaLinks(): string[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(CINEMA_OPENED_LINKS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function markCinemaLinkOpened(url: string) {
  if (typeof localStorage === "undefined") {
    return;
  }

  const openedLinks = getOpenedCinemaLinks();

  if (openedLinks.includes(url)) {
    return;
  }

  localStorage.setItem(
    CINEMA_OPENED_LINKS_STORAGE_KEY,
    JSON.stringify([...openedLinks, url]),
  );
}
