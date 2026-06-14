import { setOverlayDialogue } from "../ui-overlay-store";

interface DialogueOptions {
  hint?: string;
  onComplete?: () => void;
}

export class DialogueController {
  private lines: string[] = [];
  private title = "";
  private index = 0;
  private visible = false;
  private hint = "e / enter";
  private onComplete: (() => void) | undefined;

  constructor() {}

  show(title: string, lines: string[], options?: DialogueOptions) {
    this.lines = lines;
    this.title = title;
    this.index = 0;
    this.visible = true;
    this.hint = options?.hint ?? "e / enter";
    this.onComplete = options?.onComplete;
    setOverlayDialogue({
      visible: true,
      title,
      body: lines[0] ?? "",
      hint: this.hint,
    });
  }

  advance() {
    if (!this.visible) {
      return false;
    }

    this.index += 1;
    if (this.index >= this.lines.length) {
      this.hide();
      return false;
    }

    setOverlayDialogue({
      visible: true,
      title: this.title,
      body: this.lines[this.index] ?? "",
      hint: this.hint,
    });
    return true;
  }

  hide() {
    this.visible = false;
    const onComplete = this.onComplete;
    this.onComplete = undefined;
    setOverlayDialogue({
      visible: false,
      title: "",
      body: "",
      hint: "e / enter",
    });
    onComplete?.();
  }

  isVisible() {
    return this.visible;
  }
}
