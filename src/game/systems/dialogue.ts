import { setOverlayDialogue } from "../ui-overlay-store";

export class DialogueController {
  private lines: string[] = [];
  private title = "";
  private index = 0;
  private visible = false;

  constructor() {}

  show(title: string, lines: string[]) {
    this.lines = lines;
    this.title = title;
    this.index = 0;
    this.visible = true;
    setOverlayDialogue({
      visible: true,
      title,
      body: lines[0] ?? "",
      hint: "e / enter",
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
      hint: "e / enter",
    });
    return true;
  }

  hide() {
    this.visible = false;
    setOverlayDialogue({
      visible: false,
      title: "",
      body: "",
    });
  }

  isVisible() {
    return this.visible;
  }
}
