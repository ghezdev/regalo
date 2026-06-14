import PartySocket from "partysocket";
import type { CharacterId, Direction, PlayerUpdate } from "../types/game";

type RemoteUpdateCallback = (update: PlayerUpdate) => void;

export class MultiplayerClient {
  private socket: PartySocket;
  private characterId: CharacterId;
  private currentScene = "plaza";
  private onRemoteUpdate: RemoteUpdateCallback | null = null;
  private lastSentAt = 0;
  private static readonly SEND_INTERVAL_MS = 50;

  constructor(host: string, characterId: CharacterId) {
    this.characterId = characterId;
    this.socket = new PartySocket({ host, room: "regalo-game" });

    this.socket.addEventListener("message", (event) => {
      try {
        const update = JSON.parse(event.data as string) as PlayerUpdate;
        this.onRemoteUpdate?.(update);
      } catch {
        // ignore malformed messages
      }
    });
  }

  setScene(scene: string) {
    this.currentScene = scene;
  }

  onUpdate(callback: RemoteUpdateCallback) {
    this.onRemoteUpdate = callback;
  }

  sendPosition(x: number, y: number, direction: Direction, moving: boolean) {
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
    };
    this.socket.send(JSON.stringify(update));
  }

  destroy() {
    this.socket.close();
  }
}
