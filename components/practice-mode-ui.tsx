"use client";

import { FormEvent, useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { scenarioList, scenarioMeta, type ScenarioKey } from "@/lib/mock-data";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function simulatedReply(character: string, difficulty: number, scenario: ScenarioKey): string {
  const intensity = difficulty >= 4 ? "I need very specific answers." : "Please explain what happens next.";

  const persona =
    character === "Angry"
      ? "I am frustrated with how this is being handled."
      : character === "Anxious"
        ? "I feel nervous and need reassurance about the process."
        : "I feel defensive and want clear facts.";

  return `${persona} ${intensity} (${scenarioMeta[scenario].label} simulation)`;
}

export function PracticeModeUI(): JSX.Element {
  const [scenario, setScenario] = useState<ScenarioKey>("performance");
  const [character, setCharacter] = useState("Defensive");
  const [difficulty, setDifficulty] = useState(3);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Practice partner ready. Start with your opening line and meeting objective."
    }
  ]);

  const scorecard = useMemo(() => {
    const combined = messages
      .filter((entry) => entry.role === "user")
      .map((entry) => entry.text.toLowerCase())
      .join(" ");

    const score = (pattern: RegExp, base: number): number => {
      const hits = (combined.match(pattern) || []).length;
      return Math.min(5, base + hits);
    };

    return {
      clarity: score(/\b(expect|timeline|specific|next steps|review)\b/g, 2),
      empathy: score(/\b(thank|understand|support|appreciate|concern)\b/g, 1),
      boundaries: score(/\b(standard|document|must|follow-up|process)\b/g, 1)
    };
  }, [messages]);

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const userMessage: ChatMessage = { id: String(Date.now()), role: "user", text: input.trim() };
    const assistantMessage: ChatMessage = {
      id: String(Date.now() + 1),
      role: "assistant",
      text: simulatedReply(character, difficulty, scenario)
    };

    setMessages((items) => [...items, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Practice Mode</h2>
          <p className="mt-1 text-sm text-muted">Mock simulation to rehearse clarity, empathy, and boundaries.</p>
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-[var(--color-text)]">Scenario</span>
          <select
            value={scenario}
            onChange={(event) => setScenario(event.target.value as ScenarioKey)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
          >
            {scenarioList.map((entry) => (
              <option key={entry} value={entry}>
                {scenarioMeta[entry].label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-[var(--color-text)]">Character</span>
          <select
            value={character}
            onChange={(event) => setCharacter(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
          >
            <option>Defensive</option>
            <option>Anxious</option>
            <option>Angry</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-[var(--color-text)]">Difficulty ({difficulty})</span>
          <input
            type="range"
            min={1}
            max={5}
            value={difficulty}
            onChange={(event) => setDifficulty(Number(event.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
        </label>

        <div className="rounded-2xl bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-text)]">
          <p className="font-semibold text-[var(--color-text)]">Scorecard (live)</p>
          <p className="mt-1">Clarity: {scorecard.clarity}/5</p>
          <p>Empathy: {scorecard.empathy}/5</p>
          <p>Boundaries: {scorecard.boundaries}/5</p>
        </div>
      </Card>

      <Card className="flex min-h-[620px] flex-col" padded={false}>
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Conversation Simulator</p>
              <p className="text-xs text-muted">Role-play transcript</p>
            </div>
            <Chip variant="success">Mock mode</Chip>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text)]"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="border-t border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your response"
              className="h-11 flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3"
            />
            <Button type="submit" variant="primary">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            <Sparkles className="mr-1 inline h-3 w-3" />
            UI-only simulation with deterministic mock responses.
          </p>
        </form>
      </Card>
    </div>
  );
}
