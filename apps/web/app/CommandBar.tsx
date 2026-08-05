"use client";
import { useState } from "react";

export function CommandBar() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  async function runCommand() {
    const res = await fetch("/api/v1/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: input }),
    });
    const data = await res.json();
    setResult(data);
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runCommand();
        }}
        placeholder="Şövalyeye bir şey söyle..."
      />
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
