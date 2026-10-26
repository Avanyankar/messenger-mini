import React, { useEffect, useState } from "react";
import type { Message } from "../types";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { getMessages, sendMessage } from "../api/messageApi";
import { connectSocket, type SocketClient, type SocketStatus } from "../api/socketClient";
import { handleError, isUnauthorized } from "../helpers/handleError";

type Props = {
  token: string;
  onUnauthorized: () => void;
};

type SendMode = "socket" | "http";

function mergeMessages(current: Message[], incoming: Message[]) {
  const known = new Set(current.map((m) => m.id));
  const fresh = incoming.filter((m) => !known.has(m.id));
  return fresh.length ? [...current, ...fresh] : current;
}

const STATUS_COLORS: Record<SocketStatus, string> = {
  connecting: "orange",
  connected: "green",
  disconnected: "red"
};

export function ChatPage({ token, onUnauthorized }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("disconnected");
  const [socketClient, setSocketClient] = useState<SocketClient | null>(null);
  const [reconnectKey, setReconnectKey] = useState<number>(0);
  const [sendMode, setSendMode] = useState<SendMode>("socket");

  useEffect(() => {
    setLoading(true);
    setError("");
    getMessages(token)
      .then((history) => setMessages((current) => mergeMessages(history, current)))
      .catch((err) => {
        if (isUnauthorized(err)) {
          onUnauthorized();
          return;
        }
        setError(handleError(err));
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const client = connectSocket(token, {
      onMessage: (message) => setMessages((current) => mergeMessages(current, [message])),
      onStatus: setSocketStatus,
      onError: setError
    });
    setSocketClient(client);

    return () => {
      client.disconnect();
      setSocketClient(null);
      setSocketStatus("disconnected");
    };
  }, [token, reconnectKey]);

  const connected = socketStatus === "connected";

  const handleSend = async (text: string): Promise<boolean> => {
    setError("");

    if (sendMode === "socket") {
      if (socketClient?.sendMessage(text)) return true;
      setError("Сокет не подключён, сообщение не отправлено");
      return false;
    }

    try {
      const created = await sendMessage(token, text);
      setMessages((current) => mergeMessages(current, [created]));
      return true;
    } catch (err) {
      if (isUnauthorized(err)) {
        onUnauthorized();
        return false;
      }
      setError(handleError(err));
      return false;
    }
  };

  return (
    <div>
      <h2>Чат</h2>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span>
          Статус сокета: <strong style={{ color: STATUS_COLORS[socketStatus] }}>{socketStatus}</strong>
        </span>
        {socketStatus === "disconnected" ? (
          <button onClick={() => setReconnectKey((key) => key + 1)}>Переподключиться</button>
        ) : null}
        <label style={{ marginLeft: "auto" }}>
          Отправка:{" "}
          <select value={sendMode} onChange={(e) => setSendMode(e.target.value as SendMode)}>
            <option value="socket">WebSocket (message:send)</option>
            <option value="http">HTTP (POST /messages)</option>
          </select>
        </label>
      </div>
      {loading ? <p>Загрузка сообщений...</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      {!loading ? <MessageList messages={messages} /> : null}
      <MessageInput onSend={handleSend} disabled={!connected} />
    </div>
  );
}

export default ChatPage;
