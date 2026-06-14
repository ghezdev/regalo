import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { CharacterId, Direction, PlayerUpdate } from "../types/game";

type RemoteUpdateCallback = (update: PlayerUpdate) => void;

export class MultiplayerClient {
  private channel: RealtimeChannel;
  private characterId: CharacterId;
  private currentScene = "plaza";
  private onRemoteUpdate: RemoteUpdateCallback | null = null;
  private lastSentAt = 0;
  private static readonly SEND_INTERVAL_MS = 50;

  constructor(supabaseUrl: string, supabaseAnonKey: string, characterId: CharacterId) {
    this.characterId = characterId;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.channel = supabase.channel("regalo-game");

    this.channel
      .on("broadcast", { event: "position" }, ({ payload }) => {
        this.onRemoteUpdate?.(payload as PlayerUpdate);
      })
      .subscribe();
  }

  setScene(scene: string) {
    this.currentScene = scene;
  }

  onUpdate(callback: RemoteUpdateCallback) {
    this.onRemoteUpdate = callback;
  }

  sendPosition(x: number, y: number, direction: Direction, moving: boolean, floorMode = false) {
    const now = Date.now();
    if (now - this.lastSentAt < MultiplayerClient.SEND_INTERVAL_MS) return;
    this.lastSentAt = now;

    const update: PlayerUpdate = {
      characterId: this.characterId,
      x,
      y,
      direction,
      moving,
      scene: this.currentScene,
      ...(floorMode && { floorMode: true }),
    };

    void this.channel.send({
      type: "broadcast",
      event: "position",
      payload: update,
    });
  }

  destroy() {
    void this.channel.unsubscribe();
  }
}
