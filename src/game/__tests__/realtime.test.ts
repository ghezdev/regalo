import { describe, expect, it } from "vitest";
import { REGALO_REALTIME_CHANNEL } from "../realtime";

describe("realtime channel", () => {
  it("uses a shared channel name for game and mapa listeners", () => {
    expect(REGALO_REALTIME_CHANNEL).toBe("regalo-game");
  });
});
