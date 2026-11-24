"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "./icon";
import { useToast } from "./ui/toast";
import { getMcpStatus } from "../lib/mcp-api";
import { mcpAgentPrompt } from "../lib/mcp";

const STORAGE_KEY = "jobhunti:mcp-onboard-started";

type Phase = "idle" | "waiting" | "connected";

const labels: Record<Phase, string> = {
  idle: "Onboard Your Agent",
  waiting: "Waiting for Your Agent",
  connected: "Connect Another Agent",
};

export function McpOnboardPill() {
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const wasConnected = useRef(false);

  useEffect(() => {
    try {
      setStarted(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage can be unavailable (private mode); the pill just starts fresh.
    }
  }, []);

  const { data: status } = useQuery({
    queryKey: ["mcp-status"],
    queryFn: getMcpStatus,
    refetchInterval: 5000,
  });

  const connected = status?.connected ?? false;
  const phase: Phase = connected ? "connected" : started ? "waiting" : "idle";

  useEffect(() => {
    if (!connected || wasConnected.current) return;
    wasConnected.current = true;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    toast({
      title: "Agent connected",
      description: "Your AI agent can now read and update your saved jobs.",
    });
  }, [connected, toast]);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(mcpAgentPrompt);
    } catch {
      // Clipboard API can be unavailable; the prompt just won't be copied.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (!started) {
      setStarted(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Nothing persists if storage is unavailable; the session still works.
      }
    }
  }

  const ariaLabel =
    phase === "connected"
      ? "Copy a setup prompt to connect another AI agent"
      : phase === "waiting"
        ? "Copy the agent setup prompt again"
        : "Copy a setup prompt for your AI agent";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="group inline-flex items-center gap-3 rounded-full! border border-white/10 bg-black px-3 py-2 text-sm font-medium text-zinc-200 shadow-[0_8px_20px_rgba(0,0,0,.35)] transition hover:border-white/20"
    >
      {phase === "waiting" ? (
        <span className="relative grid size-7 shrink-0 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full! [background:conic-gradient(from_0deg,var(--gold)_0deg,transparent_250deg)]" />
          <span className="relative z-10 grid size-5 place-items-center rounded-full! bg-black text-zinc-300">
            <Icon name="bot" size={11} />
          </span>
        </span>
      ) : phase === "connected" ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full! border border-black bg-[#1f4d3a] text-[#9fe6bd]">
          <Icon name="check" size={12} />
        </span>
      ) : (
        <span className="flex shrink-0 -space-x-2">
          <span className="grid size-6 place-items-center rounded-full! border border-black bg-zinc-700 text-zinc-200">
            <Icon name="spark" size={12} />
          </span>
          <span className="grid size-6 place-items-center rounded-full! border border-black bg-zinc-800 text-zinc-200">
            <Icon name="cube" size={12} />
          </span>
          <span className="grid size-6 place-items-center rounded-full! border border-black bg-[var(--gold-surface)] text-[var(--gold-ink)]">
            <Icon name="bot" size={12} />
          </span>
        </span>
      )}
      <span className="whitespace-nowrap">{labels[phase]}</span>
      <span className="grid size-6 shrink-0 place-items-center rounded-md! border border-white/10 text-zinc-400 transition group-hover:text-zinc-200">
        <Icon name={copied ? "check" : "copy"} size={13} />
      </span>
    </button>
  );
}
