import type { Session } from "./session";
import type { NaomiStoryState } from "../game/types/story";

export function getNaomiGameAccess(session: Session, state?: NaomiStoryState) {
  if (session.characterId !== "naomi") {
    return { allowed: true as const };
  }

  if (state?.endingLocked) {
    return {
      allowed: false as const,
      reason: "ending-locked" as const,
      message: "Te amo, perdon.",
    };
  }

  return { allowed: true as const };
}
