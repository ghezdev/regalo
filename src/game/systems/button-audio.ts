import * as Phaser from "phaser";
import type { AudioCalendarEntry } from "../types/content";

export class ButtonAudioSystem {
  private scene: Phaser.Scene;
  private audioMap: Map<string, AudioCalendarEntry>;
  private currentButtonId: string | null = null;
  private currentSound: Phaser.Sound.BaseSound | null = null;
  private loopTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, audioMap: Map<string, AudioCalendarEntry>) {
    this.scene = scene;
    this.audioMap = audioMap;
  }

  onButtonEnter(buttonId: string) {
    if (this.currentButtonId === buttonId) return;

    this.stopCurrentAudio();

    const entry = this.audioMap.get(buttonId);
    if (!entry) return;

    this.currentButtonId = buttonId;
    this.currentSound = this.scene.sound.add(entry.key);
    this.currentSound.on("complete", this.handleComplete);
    this.currentSound.play();
  }

  onButtonLeave(buttonId: string) {
    if (this.currentButtonId !== buttonId) return;
    this.stopCurrentAudio();
    this.currentButtonId = null;
  }

  private handleComplete = () => {
    if (this.currentButtonId && this.currentSound) {
      this.loopTimer = this.scene.time.delayedCall(3000, () => {
        if (this.currentButtonId && this.currentSound) {
          this.currentSound.play();
        }
      });
    }
  };

  private stopCurrentAudio() {
    if (this.loopTimer) {
      this.loopTimer.remove();
      this.loopTimer = null;
    }

    if (this.currentSound) {
      this.currentSound.off("complete", this.handleComplete);
      this.currentSound.stop();
      this.currentSound.destroy();
      this.currentSound = null;
    }
  }

  getProgress(): { elapsed: number; duration: number } {
    if (!this.currentSound) {
      return { elapsed: 0, duration: 0 };
    }

    const sound = this.currentSound as Phaser.Sound.WebAudioSound;
    const duration = sound.duration;
    if (duration === 0) {
      return { elapsed: 0, duration: 0 };
    }

    const seek = Math.min(sound.seek, duration);
    return { elapsed: seek, duration };
  }

  destroy() {
    this.stopCurrentAudio();
  }
}