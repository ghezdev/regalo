import { describe, expect, it } from "vitest";
import { getNaomiGameAccess } from "../naomi-access";

describe("naomi game access", () => {
  it("allows Guillermo without reading the Naomi ending lock", () => {
    expect(
      getNaomiGameAccess({
        characterId: "guillermo",
        displayName: "Guillermo",
        username: "guillermo",
      }),
    ).toEqual({ allowed: true });
  });

  it("allows Naomi when state is not locked", () => {
    expect(
      getNaomiGameAccess(
        { characterId: "naomi", displayName: "Naomi", username: "naomi" },
        {
          stepId: "plaza-castle-front",
          visitedInteriors: [],
          triggeredDialogues: [],
          endingLocked: false,
        },
      ),
    ).toEqual({ allowed: true });
  });

  it("blocks Naomi when the local story state is locked", () => {
    expect(
      getNaomiGameAccess(
        { characterId: "naomi", displayName: "Naomi", username: "naomi" },
        {
          stepId: "ending",
          visitedInteriors: [],
          triggeredDialogues: [],
          endingLocked: true,
          endingChoice: "leave",
        },
      ),
    ).toEqual({
      allowed: false,
      reason: "ending-locked",
      message: "Te amo, perdon.",
    });
  });
});
