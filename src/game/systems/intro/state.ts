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

const EXIT_DIALOGUE_KEY_PREFIX = "regalo.exitDialogueSeen.";

export function hasSeenExitDialogue(interiorId: string) {
  if (typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(EXIT_DIALOGUE_KEY_PREFIX + interiorId) === "seen";
}

export function markExitDialogueAsSeen(interiorId: string) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(EXIT_DIALOGUE_KEY_PREFIX + interiorId, "seen");
}
