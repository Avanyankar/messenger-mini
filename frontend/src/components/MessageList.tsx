import React, { useEffect, useRef } from "react";
import type { Message } from "../types";

type Props = {
  messages: Message[];
};

function formatTime(createdAt: string) {
  return new Date(createdAt).toLocaleString("ru-RU");
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!messages.length) {
    return <p>Нет сообщений</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxHeight: "60vh",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "8px",
        marginBottom: "8px"
      }}
    >
      {messages.map((message) => (
        <div key={message.id} style={{ background: "#f4f4f4", borderRadius: "6px", padding: "6px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", color: "#666" }}>
            <strong>{message.author}</strong>
            <span>{formatTime(message.createdAt)}</span>
          </div>
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.text}</div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
