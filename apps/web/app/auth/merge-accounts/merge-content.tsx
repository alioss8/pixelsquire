"use client";

import { useSearchParams } from "next/navigation";

export function MergeContent() {
  const searchParams = useSearchParams();
  const googleUserId = searchParams.get("googleUserId") || " ";
  const anonUserId = searchParams.get("anonUserId") || " ";
  const deviceToken = searchParams.get("deviceToken");

  const handleMerge = async (keepUserId: string) => {
    const res = await fetch("http://localhost:3000/api/v1/auth/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keepUserId,
        deleteUserId: keepUserId === googleUserId ? anonUserId : googleUserId,
        deviceToken,
      }),
    });

    if (res.ok) {
      window.location.href = `/auth-success?deviceToken=${deviceToken}`;
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Accounts found</h1>
      <p>Choose which account to keep:</p>
      <button onClick={() => handleMerge(googleUserId)}>
        Keep Google Account
      </button>
      <button onClick={() => handleMerge(anonUserId)}>
        Keep Anonymous Account
      </button>
    </div>
  );
}
