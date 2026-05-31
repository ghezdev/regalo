import * as Phaser from "phaser";

export class DialogueController {
  private readonly root: Phaser.GameObjects.Container;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly hintText: Phaser.GameObjects.Text;
  private lines: string[] = [];
  private index = 0;
  private visible = false;

  constructor(private readonly scene: Phaser.Scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    this.panel = scene.add
      .rectangle(width / 2, height - 48, width - 24, 72, 0x111427, 0.9)
      .setStrokeStyle(2, 0xe9d7a1)
      .setScrollFactor(0);

    this.nameText = scene.add
      .text(20, height - 76, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f7c9d9",
      })
      .setScrollFactor(0);

    this.bodyText = scene.add
      .text(20, height - 62, "", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#f6f3ff",
        wordWrap: { width: width - 54 },
      })
      .setScrollFactor(0);

    this.hintText = scene.add
      .text(width - 54, height - 20, "E / Enter", {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#e9d7a1",
      })
      .setScrollFactor(0);

    this.root = scene.add.container(0, 0, [
      this.panel,
      this.nameText,
      this.bodyText,
      this.hintText,
    ]);
    this.root.setDepth(50);
    this.root.setVisible(false);
  }

  show(title: string, lines: string[]) {
    this.lines = lines;
    this.index = 0;
    this.visible = true;
    this.nameText.setText(title);
    this.bodyText.setText(lines[0] ?? "");
    this.root.setVisible(true);
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

    this.bodyText.setText(this.lines[this.index]);
    return true;
  }

  hide() {
    this.visible = false;
    this.root.setVisible(false);
  }

  isVisible() {
    return this.visible;
  }
}
