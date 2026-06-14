import { describe, expect, it, vi } from "vitest";
import { DialogueController } from "../../dialogue";

describe("dialogue controller completion", () => {
  it("calls onComplete after the final line advances", () => {
    const onComplete = vi.fn();
    const dialogue = new DialogueController();

    dialogue.show("Maia", ["uno", "dos"], { onComplete });
    dialogue.advance();
    dialogue.advance();

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete before the last line", () => {
    const onComplete = vi.fn();
    const dialogue = new DialogueController();

    dialogue.show("Maia", ["uno", "dos", "tres"], { onComplete });
    dialogue.advance();

    expect(onComplete).not.toHaveBeenCalled();
  });
});
