export const NAOMI_INTRO_STORAGE_KEY = "regalo.naomiIntroSeen";

export function hasSeenNaomiIntro() {
  if (typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(NAOMI_INTRO_STORAGE_KEY) === "seen";
}

export function markNaomiIntroAsSeen() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(NAOMI_INTRO_STORAGE_KEY, "seen");
}
