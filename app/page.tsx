"use client";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const res = await invoke<string>("my_custom_command", {
        invokeMessage: "Rust is the best",
      });
      console.log("Tauri responded:", res);
      setResponse(res);
      setError(null);
    } catch (err: any) {
      console.error("Tauri error:", err);
      setError(err.message ?? String(err));
      setResponse(null);
    }
  };

  return (
    <div>
      <h1 className="bg-amber-200 text-4xl">Hello from Tauri + Next.js</h1>

      <Button onClick={handleClick}>Call Rust Command</Button>

      {response && (
        <p style={{ color: "green" }}>Response from Rust: {response}</p>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
