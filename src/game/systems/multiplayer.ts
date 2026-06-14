import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { CharacterId, Direction, PlayerUpdate, WorldPoint } from "../types/game";
import { REGALO_REALTIME_CHANNEL } from "../realtime";

type RemoteUpdateCallback = (update: PlayerUpdate) => void;

export class MultiplayerClient {
  private channel: RealtimeChannel | null = null;
  private characterId: CharacterId;
  private currentScene = "plaza";
  private onRemoteUpdate: RemoteUpdateCallback | null = null;
  private lastSentAt = 0;
  private static readonly SEND_INTERVAL_MS = 50;

  constructor(supabaseUrl: string, supabaseAnonKey: string, characterId: CharacterId) {
    this.characterId = characterId;

    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.channel = supabase.channel(REGALO_REALTIME_CHANNEL);

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

  sendPosition(
    x: number,
    y: number,
    direction: Direction,
    moving: boolean,
    options: {
      floorMode?: boolean;
      plazaPosition?: WorldPoint;
    } = {},
  ) {
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
      ...(options.floorMode && { floorMode: true }),
      ...(options.plazaPosition && { plazaPosition: options.plazaPosition }),
    };

    if (!this.channel) return;
    void this.channel.send({
      type: "broadcast",
      event: "position",
      payload: update,
    });
  }

  destroy() {
    void this.channel?.unsubscribe();
  }
}
