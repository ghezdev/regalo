import { describe, expect, it } from "vitest";
import {
  completeStep,
  getAllowedDestinations,
  isNaomiLocked,
  markEndingChoice,
} from "../progression";
import { createInitialNaomiStoryState } from "../state";

describe("naomi progression", () => {
  it("moves from castle intro to castle exit", () => {
    const next = completeStep(createInitialNaomiStoryState(), "castle-intro");
    expect(next.stepId).toBe("castle-exit");
  });

  it("only allows the cinema after the plaza intro step", () => {
    const state = { ...createInitialNaomiStoryState(), stepId: "plaza-castle-front" as const };
    expect(getAllowedDestinations(state)).toEqual(["cine"]);
  });

  it("keeps Naomi from using the discoteca before the cinema step is completed", () => {
    const state = { ...createInitialNaomiStoryState(), stepId: "plaza-castle-front" as const };
    expect(getAllowedDestinations(state)).not.toContain("discoteca");
  });

  it("locks Naomi after the final choice", () => {
    const choiceState = { ...createInitialNaomiStoryState(), stepId: "camp-choice" as const };
    const ended = markEndingChoice(choiceState, "stay");
    expect(ended.endingLocked).toBe(true);
    expect(ended.endingChoice).toBe("stay");
    expect(isNaomiLocked(ended)).toBe(true);
  });

  it("advances from home exit to camp approach", () => {
    const state = { ...createInitialNaomiStoryState(), stepId: "home-exit" as const };
    expect(completeStep(state, "home-exit").stepId).toBe("camp-approach");
  });

  it("does not advance if step does not match expected", () => {
    const state = createInitialNaomiStoryState();
    const unchanged = completeStep(state, "castle-exit");
    expect(unchanged.stepId).toBe("castle-intro");
  });
});
