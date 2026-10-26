import React, { useState } from "react";
import { login } from "../api/authApi";
import { setToken } from "../helpers/authStorage";
import { handleError } from "../helpers/handleError";

type Props = {
  onLogin: (token: string) => void;
};

export function LoginPage({ onLogin }: Props) {
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || !password) {
      setError("Введите телефон и пароль");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { token } = await login({ phone: trimmedPhone, password });
      setToken(token);
      onLogin(token);
    } catch (err) {
      setError(handleError(err));
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Телефон"
          autoComplete="tel"
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoComplete="current-password"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </div>
  );
}

export default LoginPage;
