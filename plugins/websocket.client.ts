// plugins/websocket.client.ts
export default defineNuxtPlugin(() => {
  // Подключаемся к встроенному WS серверу Nitro
  const ws = new WebSocket("ws://localhost:3000/_ws");

  return {
    provide: {
      socket: ws,
    },
  };
});
