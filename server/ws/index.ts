import type { WSMessage } from '#shared/types/websocket';

type Client = {
  id: string;
  ws: WebSocket;
  worldId?: string;
};

type MessageHandler = (client: Client, message: WSMessage) => void | Promise<void>;

export class SocketServer {
  private clients = new Map<string, Client>();
  private rooms = new Map<string, Set<string>>();
  private handlers = new Map<string, MessageHandler>();

  register(type: string, handler: MessageHandler) {
    this.handlers.set(type, handler);
  }

  handle(clientId: string, ws: WebSocket, message: string) {
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
        console.error('Handler error:', error);
      });
    }
  }

  onOpen(clientId: string, ws: WebSocket) {
    this.clients.set(clientId, { id: clientId, ws });
  }

  onClose(clientId: string) {
    const client = this.clients.get(clientId);
    if (client?.worldId) {
      this.leave(client, client.worldId);
    }
    this.clients.delete(clientId);
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
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
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
  socketServer.register('join-world', (client, message) => {
    const payload = message.payload as { worldId: string };
    socketServer.join(client, payload.worldId);
  });

  socketServer.register('player-whisper', async (client, message) => {
    const payload = message.payload as { message: string };
    // delegate to game logic or leader system
    if (client.worldId) {
      socketServer.toWorld(client.worldId, {
        ...message,
        type: 'player-whisper',
        payload,
      });
    }
  });
}
