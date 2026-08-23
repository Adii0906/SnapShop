"use client";

import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { chatWithAssistant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssistantAction } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  text: string;
  pending?: AssistantAction | null;
  resolved?: boolean;
}

const STARTERS = [
  "give all shirts 20% discount",
  "set stock of sports shoes to 5",
  "hide wallet",
];

export default function AssistantPage() {
  const { business, loading, error, refresh } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: 'Ask me to change a price, apply a discount, update stock, or hide/show a product - e.g. "change the blue shirt price to 699".',
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  if (loading || error || !business) return <DashboardState loading={loading} error={error} />;

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await chatWithAssistant(business!.slug, { message: text });
      setMessages((prev) => [...prev, { role: "assistant", text: res.reply, pending: res.pending }]);
      if (!res.pending && res.products.length > 0) await refresh();
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong reaching the API." }]);
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm(index: number, action: AssistantAction) {
    setSending(true);
    try {
      const res = await chatWithAssistant(business!.slug, { confirm: action });
      setMessages((prev) => [
        ...prev.map((m, i) => (i === index ? { ...m, resolved: true } : m)),
        { role: "assistant", text: res.reply },
      ]);
      await refresh();
    } finally {
      setSending(false);
    }
  }

  function handleCancel(index: number) {
    setMessages((prev) => [
      ...prev.map((m, i) => (i === index ? { ...m, resolved: true } : m)),
      { role: "assistant", text: "Cancelled - nothing changed." },
    ]);
  }

  return (
    <div className="p-8 max-w-2xl flex flex-col h-screen">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">AI Assistant</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Bot className="h-5 w-5" /> Store assistant
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Demo-mode pattern matching, not a live LLM - see the README for the real LangGraph plan.
        </p>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" && "justify-end")}>
            {m.role === "assistant" && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                <Bot className="h-3.5 w-3.5" />
              </span>
            )}
            <div
              className={cn(
                "max-w-sm rounded-lg px-3.5 py-2.5 text-sm",
                m.role === "user" ? "bg-ink text-paper" : "bg-paper-dim/60 border border-line"
              )}
            >
              <p>{m.text}</p>
              {m.pending && !m.resolved && (
                <div className="mt-2.5 flex gap-2">
                  <Button size="sm" variant="accent" onClick={() => handleConfirm(i, m.pending!)} disabled={sending}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancel(i)} disabled={sending}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            {m.role === "user" && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-dim">
                <User className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line px-3 py-1.5 text-xs hover:bg-paper-dim focus-ring"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          className="h-11 flex-1 rounded-md border border-line bg-paper px-3 text-sm focus-ring"
          disabled={sending}
        />
        <Button type="submit" size="md" variant="accent" disabled={sending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
