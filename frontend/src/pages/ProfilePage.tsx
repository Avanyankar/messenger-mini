import React, { useEffect, useState } from "react";
import type { User } from "../types";
import { ProfileCard } from "../components/ProfileCard";
import { getProfile, updateProfile } from "../api/userApi";
import { handleError, isUnauthorized } from "../helpers/handleError";

type Props = {
  token: string;
  onUnauthorized: () => void;
};

export function ProfilePage({ token, onUnauthorized }: Props) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [nickname, setNickname] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    getProfile(token)
      .then((user) => {
        setProfile(user);
        setNickname(user.nickname);
        setBio(user.bio);
      })
      .catch((err) => {
        if (isUnauthorized(err)) {
          onUnauthorized();
          return;
        }
        setError(handleError(err));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Никнейм не может быть пустым");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile(token, { nickname: trimmedNickname, bio });
      setProfile(updated);
      setNickname(updated.nickname);
      setBio(updated.bio);
    } catch (err) {
      if (isUnauthorized(err)) {
        onUnauthorized();
        return;
      }
      setError(handleError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Профиль</h2>
      {loading ? <p>Загрузка...</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      <ProfileCard profile={profile} />
      {profile ? (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
            placeholder="Ник"
            disabled={saving}
          />
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setError("");
            }}
            placeholder="Описание"
            rows={3}
            disabled={saving}
          />
          <button onClick={handleSave} disabled={loading || saving}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProfilePage;
