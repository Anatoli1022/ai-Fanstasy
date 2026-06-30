// server/routes/_ws.ts
import { defineWebSocketHandler } from "h3";
import { socketServer, defineSocketHandlers } from "../ws";

// Регистрируем обработчики (join-world и т.д.) один раз при старте
defineSocketHandlers();

export default defineWebSocketHandler({
  open(peer) {
    // peer.id - уникальный ID соединения
    // peer.send() - метод для отправки сообщений
    console.log(`🟢 WS Opened for peer: ${peer.id}`);

    // Мы передаем сам объект peer, чтобы наш класс мог вызывать peer.send()
    // Вместо WebSocket браузера мы используем peer Nitro
    socketServer.onOpen(peer.id, peer as any);
  },

  message(peer, message) {
    // message.text() возвращает строку сообщения
    socketServer.handle(peer.id, peer as any, message.text());
  },

  close(peer) {
    console.log(`🔴 WS Closed for peer: ${peer.id}`);
    socketServer.onClose(peer.id);
  },
});
