"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, MessageSquareText, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

interface AssistantApiResponse {
  reply: string;
  source: "openai" | "fallback";
  monitoring?: {
    totalCases: number;
    highRiskVersionCount: number;
  };
}

const quickPrompts = [
  "Show monitoring snapshot",
  "How should I handle high-risk flags?",
  "What should a strong case summary include?"
];

export function AiSupportWidget(): JSX.Element {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<"openai" | "fallback">("fallback");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-0",
      role: "assistant",
      text:
        "ResolvePath AI Support is ready. Ask about case workflow, risk checks, outputs, templates, settings, or monitoring."
    }
  ]);

  const payloadMessages = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.text })),
    [messages]
  );

  const sendPrompt = async (prompt: string): Promise<void> => {
    const trimmed = prompt.trim();
    if (!trimmed || busy) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed
      }
    ];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...payloadMessages, { role: "user", content: trimmed }],
          page: pathname
        })
      });

      const data = (await response.json().catch(() => ({}))) as Partial<AssistantApiResponse> & {
        error?: string;
      };

      if (!response.ok || typeof data.reply !== "string" || data.reply.trim().length === 0) {
        throw new Error(data.error || "AI support request failed");
      }
      const replyText = data.reply.trim();

      setSource(data.source === "openai" ? "openai" : "fallback");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: replyText
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text:
            "I could not complete that request right now. Try again, or ask a simpler ResolvePath question like 'Show monitoring snapshot'."
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    void sendPrompt(input);
  };

  return (
    <>
      {open ? (
        <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-card">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-[var(--color-primary-soft)] p-1.5 text-[var(--color-primary)]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">AI Support</p>
                <p className="text-xs text-muted">{source === "openai" ? "OpenAI connected" : "Deterministic fallback"}</p>
              </div>
            </div>
            <button
              className="rounded-full p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
              onClick={() => setOpen(false)}
              aria-label="Close AI Support"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-[var(--color-surface-2)] px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-[var(--radius-lg)] px-3 py-2 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-auto max-w-[90%] bg-[var(--color-primary)] text-white"
                    : "max-w-[94%] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                }`}
              >
                {message.text}
              </div>
            ))}
            {busy ? (
              <div className="inline-flex items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-muted">
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-[var(--color-border)] px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendPrompt(prompt)}
                  disabled={busy}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask ResolvePath AI..."
                className="h-10 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
              />
              <Button type="submit" size="sm" disabled={busy || !input.trim()}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
        aria-label="Open AI Support"
      >
        <MessageSquareText className="h-4 w-4" />
        AI Support
      </button>
    </>
  );
}
