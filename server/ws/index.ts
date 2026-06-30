// server/ws/index.ts
import type { WSMessage } from "#shared/types/websocket";

type Client = {
  id: string;
  ws: WebSocket;
  worldId?: string;
};

type MessageHandler = (
  client: Client,
  message: WSMessage,
) => void | Promise<void>;

export class SocketServer {
  private clients = new Map<string, Client>();
  private rooms = new Map<string, Set<string>>();
  private handlers = new Map<string, MessageHandler>();

  register(type: string, handler: MessageHandler) {
    this.handlers.set(type, handler);
  }

  handle(clientId: string, ws: WebSocket, message: string) {
    console.log(`📩 Raw message received from ${clientId}:`, message);
    const client = this.clients.get(clientId);
    if (!client) return;

    let parsed: WSMessage;
    try {
      parsed = JSON.parse(message) as WSMessage;
    } catch {
      return;
    }

    const handler = this.handlers.get(parsed.type);
    if (handler) {
      handler(client, parsed).catch((error) => {
        console.error("Handler error:", error);
      });
    }
  }

  onOpen(clientId: string, ws: any) {
    this.clients.set(clientId, { id: clientId, ws });
    console.log(`🟢 Client connected: ${clientId}`);
  }

  onClose(clientId: string) {
    const client = this.clients.get(clientId);
    if (client?.worldId) {
      this.leave(client, client.worldId);
    }
    this.clients.delete(clientId);
    console.log(`🔴 Client disconnected: ${clientId}`);
  }

  join(client: Client, worldId: string) {
    if (client.worldId) {
      this.leave(client, client.worldId);
    }
    client.worldId = worldId;

    if (!this.rooms.has(worldId)) {
      this.rooms.set(worldId, new Set());
    }
    this.rooms.get(worldId)!.add(client.id);
    console.log(`🔌 Client ${client.id} joined world: ${worldId}`);
  }

  leave(client: Client, worldId: string) {
    this.rooms.get(worldId)?.delete(client.id);
    if (client.worldId === worldId) {
      client.worldId = undefined;
    }
  }

  toWorld(worldId: string, message: WSMessage) {
    const room = this.rooms.get(worldId);
    if (!room) return;

    const data = JSON.stringify(message);
    for (const clientId of room) {
      const client = this.clients.get(clientId);
      if (client) {
        // В Nitro peer отправляет данные через .send()
        // Проверяем readyState только если это браузерный сокет,
        // для Nitro peer просто вызываем send
        try {
          client.ws.send(data);
        } catch (e) {
          console.error("Failed to send to client", clientId, e);
        }
      }
    }
  }

  broadcast(message: WSMessage) {
    const data = JSON.stringify(message);
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  send(clientId: string, message: WSMessage) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }
}

export const socketServer = new SocketServer();

export function defineSocketHandlers() {
  socketServer.register("join-world", (client, message) => {
    const payload = message.payload as { worldId: string };
    console.log(`📨 Received join-world request for: ${payload.worldId}`);
    socketServer.join(client, payload.worldId);
  });

  socketServer.register("player-whisper", async (client, message) => {
    const payload = message.payload as { message: string };
    if (client.worldId) {
      socketServer.toWorld(client.worldId, {
        ...message,
        type: "player-whisper",
        payload,
      });
    }
  });
}
