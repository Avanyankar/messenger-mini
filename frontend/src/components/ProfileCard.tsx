import React from "react";
import type { User } from "../types";

type Props = {
  profile: User | null;
};

export function ProfileCard({ profile }: Props) {
  if (!profile) return null;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "12px" }}>
      <p style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "bold" }}>{profile.nickname}</p>
      <p style={{ margin: "0 0 8px", color: "#666" }}>{profile.phone}</p>
      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{profile.bio}</p>
    </div>
  );
}

export default ProfileCard;
