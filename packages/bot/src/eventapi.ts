import WebSocket from "ws";

type OnSetUpdate = (emoteSetId: string) => void | Promise<void>;

const RECONNECT_DELAY_MS = 5_000;

export class SevenTvEventClient {
  private ws: WebSocket | null = null;
  private subscribedSets = new Set<string>();
  private onSetUpdate: OnSetUpdate;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shuttingDown = false;

  constructor(onSetUpdate: OnSetUpdate) {
    this.onSetUpdate = onSetUpdate;
  }

  connect() {
    if (this.shuttingDown) return;

    this.ws = new WebSocket("wss://events.7tv.io/v3");

    this.ws.on("open", () => {
      console.log("[7tv-events] connected");
      // Re-subscribe to everything after a reconnect
      for (const setId of this.subscribedSets) {
        this.sendSubscribe(setId);
      }
    });

    this.ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // op 0 = DISPATCH
        if (msg.op === 0 && msg.d?.type === "emote_set.update") {
          const setId: string | undefined = msg.d.body?.id;
          if (setId) {
            console.log(`[7tv-events] emote set ${setId} changed`);
            await this.onSetUpdate(setId);
          }
        }
      } catch (err) {
        console.error("[7tv-events] failed to handle message", err);
      }
    });

    this.ws.on("close", () => {
      console.log("[7tv-events] disconnected");
      this.scheduleReconnect();
    });

    this.ws.on("error", (err) => {
      console.error("[7tv-events] socket error:", err.message);
      // 'close' fires after 'error', so reconnect is handled there
    });
  }

  private scheduleReconnect() {
    if (this.shuttingDown || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log("[7tv-events] reconnecting...");
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  private sendSubscribe(emoteSetId: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        op: 35,
        d: {
          type: "emote_set.update",
          condition: { object_id: emoteSetId },
        },
      })
    );
    console.log(`[7tv-events] subscribed to set ${emoteSetId}`);
  }

  subscribe(emoteSetId: string) {
    if (this.subscribedSets.has(emoteSetId)) return;
    this.subscribedSets.add(emoteSetId);
    this.sendSubscribe(emoteSetId);
  }

  unsubscribe(emoteSetId: string) {
    this.subscribedSets.delete(emoteSetId);
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        op: 36,
        d: {
          type: "emote_set.update",
          condition: { object_id: emoteSetId },
        },
      })
    );
  }

  shutdown() {
    this.shuttingDown = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}