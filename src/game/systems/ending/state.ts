export const NAOMI_BAD_ENDING_STORAGE_KEY = "regalo.naomi.bad-ending";

export function hasNaomiBadEndingSeen() {
  if (typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(NAOMI_BAD_ENDING_STORAGE_KEY) === "seen";
}

export function markNaomiBadEndingSeen() {
  localStorage.setItem(NAOMI_BAD_ENDING_STORAGE_KEY, "seen");
}

export function clearNaomiBadEndingSeen() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(NAOMI_BAD_ENDING_STORAGE_KEY);
}
