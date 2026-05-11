"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/gate/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/diagnostic";
    } else {
      setLoading(false);
      setError("Incorrect access code.");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setPassword("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px] space-y-8">
        {/* Wordmark */}
        <p className="text-xs font-semibold text-muted tracking-widest uppercase text-center">
          Case Prep
        </p>

        {/* Heading + description */}
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-primary leading-snug">
            A personal tool for tracking MBB interview preparation
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            I built this with Claude Code to track and analyze my case interview
            practice across multiple coaches and partners. Enter the access code I
            shared to view it.
          </p>
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className={shaking ? "animate-shake" : ""}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-md border border-divider bg-surface
                text-primary placeholder:text-muted text-sm
                focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded bg-accent text-white text-sm font-semibold
              hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>

        {/* About link */}
        <p className="text-center">
          <Link href="/about" className="text-xs text-muted hover:text-primary transition-colors">
            About this project →
          </Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-6 inset-x-0 text-center">
        <p className="text-xs text-muted">
          Built by{" "}
          <a
            href="https://linkedin.com/in/parismongkolkul"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Paris Mongkolkul
          </a>
        </p>
      </footer>
    </div>
  );
}
