import type { Message } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

export type SocketStatus = "connecting" | "connected" | "disconnected";

type SocketCallbacks = {
  onMessage?: (message: Message) => void;
  onStatus?: (status: SocketStatus) => void;
  onError?: (error: string) => void;
};

export type SocketClient = {
  sendMessage: (text: string) => boolean;
  disconnect: () => void;
};

export function connectSocket(token: string, { onMessage, onStatus, onError }: SocketCallbacks): SocketClient {
  const socket = new WebSocket(WS_URL);
  onStatus?.("connecting");

  socket.onopen = () => onStatus?.("connected");
  socket.onclose = () => onStatus?.("disconnected");
  socket.onerror = () => onError?.("Ошибка WebSocket-соединения");

  socket.onmessage = (event) => {
    let data: any;
    try {
      data = JSON.parse(event.data);
    } catch {
      onError?.("Некорректное сообщение от сервера");
      return;
    }

    if (data.type === "message:new" && data.payload) {
      onMessage?.(data.payload as Message);
    } else if (data.type === "error") {
      onError?.(String(data.payload));
    }
  };

  return {
    sendMessage: (text: string) => {
      if (socket.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify({ type: "message:send", payload: { text, token } }));
      return true;
    },
    disconnect: () => {
      socket.onopen = socket.onclose = socket.onerror = socket.onmessage = null;
      socket.close();
    }
  };
}
