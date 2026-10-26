import React, { useState } from "react";

type Props = {
  onSend: (text: string) => boolean | Promise<boolean>;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const sent = await onSend(trimmed);
      if (sent) setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
      <input
        type="text"
        placeholder="Введите сообщение"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1, padding: "8px" }}
        disabled={disabled || sending}
      />
      <button type="submit" disabled={disabled || sending || !text.trim()}>
        {sending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}

export default MessageInput;
