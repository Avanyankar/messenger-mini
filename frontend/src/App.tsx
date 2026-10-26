import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ChatPage } from "./pages/ChatPage";
import { getToken, clearToken } from "./helpers/authStorage";

type Tab = {
  path: string;
  label: string;
  requiresAuth: boolean;
};

const TABS: Tab[] = [
  { path: "/login", label: "Вход", requiresAuth: false },
  { path: "/profile", label: "Профиль", requiresAuth: true },
  { path: "/chat", label: "Чат", requiresAuth: true }
];

function AppLayout() {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (newToken: string) => {
    setTokenState(newToken);
    navigate("/chat", { replace: true });
  };

  const handleLogout = () => {
    clearToken();
    setTokenState(null);
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "16px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "20px", margin: 0, marginRight: "auto" }}>Messenger Mini</h1>
        <nav style={{ display: "flex", gap: "8px" }}>
          {TABS.map((tab) => {
            const enabled = tab.requiresAuth ? Boolean(token) : !token;
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                disabled={!enabled}
                style={{ fontWeight: active ? "bold" : "normal" }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
        {token ? <button onClick={handleLogout}>Выйти</button> : null}
      </header>

      <main>
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/chat" replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/profile"
            element={token ? <ProfilePage token={token} onUnauthorized={handleLogout} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/chat"
            element={token ? <ChatPage token={token} onUnauthorized={handleLogout} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={token ? "/chat" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
