import OpenAI from "openai";

export type PracticeScenario =
  | "performance"
  | "conduct"
  | "sickness_absence"
  | "grievance"
  | "conflict"
  | "flexible_working";

export type PracticeCharacter = "Defensive" | "Anxious" | "Angry";
export type PracticeRole = "user" | "assistant";

export interface PracticeMessage {
  role: PracticeRole;
  content: string;
}

const SCENARIO_LABELS: Record<PracticeScenario, string> = {
  performance: "Performance",
  conduct: "Conduct",
  sickness_absence: "Sickness Absence",
  grievance: "Grievance",
  conflict: "Conflict",
  flexible_working: "Flexible Working"
};

function isPracticeScenario(value: unknown): value is PracticeScenario {
  return (
    value === "performance" ||
    value === "conduct" ||
    value === "sickness_absence" ||
    value === "grievance" ||
    value === "conflict" ||
    value === "flexible_working"
  );
}

function isPracticeCharacter(value: unknown): value is PracticeCharacter {
  return value === "Defensive" || value === "Anxious" || value === "Angry";
}

function isPracticeRole(value: unknown): value is PracticeRole {
  return value === "user" || value === "assistant";
}

export function normalizePracticeInput(input: {
  scenario?: unknown;
  character?: unknown;
  difficulty?: unknown;
  messages?: unknown;
}): {
  scenario: PracticeScenario;
  character: PracticeCharacter;
  difficulty: number;
  messages: PracticeMessage[];
} {
  const scenario = isPracticeScenario(input.scenario) ? input.scenario : "performance";
  const character = isPracticeCharacter(input.character) ? input.character : "Defensive";
  const difficulty =
    typeof input.difficulty === "number" && Number.isFinite(input.difficulty)
      ? Math.max(1, Math.min(5, Math.round(input.difficulty)))
      : 3;

  const messages = Array.isArray(input.messages)
    ? input.messages
        .map((item): PracticeMessage | null => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const role = (item as { role?: unknown }).role;
          const content = (item as { content?: unknown }).content;
          if (!isPracticeRole(role) || typeof content !== "string") {
            return null;
          }

          const trimmed = content.trim();
          if (!trimmed) {
            return null;
          }

          return {
            role,
            content: trimmed.slice(0, 1800)
          };
        })
        .filter((entry): entry is PracticeMessage => entry !== null)
        .slice(-12)
    : [];

  return { scenario, character, difficulty, messages };
}

function personaLine(character: PracticeCharacter): string {
  if (character === "Angry") {
    return "Your tone is frustrated, direct, and challenging.";
  }

  if (character === "Anxious") {
    return "Your tone is worried, cautious, and reassurance-seeking.";
  }

  return "Your tone is guarded and skeptical, asking for clear facts.";
}

function difficultyLine(difficulty: number): string {
  if (difficulty >= 5) {
    return "Very difficult: challenge assumptions, demand precise evidence, and test procedural fairness.";
  }

  if (difficulty >= 4) {
    return "Hard: ask pointed follow-up questions and push for specific process details.";
  }

  if (difficulty <= 2) {
    return "Easier: still realistic, but cooperative and concise.";
  }

  return "Moderate: balanced challenge and openness.";
}

function fallbackPracticeReply(input: {
  scenario: PracticeScenario;
  character: PracticeCharacter;
  difficulty: number;
}): string {
  const base =
    input.character === "Angry"
      ? "I feel this process has been unfair so far."
      : input.character === "Anxious"
        ? "I am worried about where this is heading for me."
        : "I need clear, factual reasons for these concerns.";

  const challenge =
    input.difficulty >= 4
      ? "Please give specific examples, dates, and what support has actually been offered."
      : "Can you explain the examples and expectations clearly?";

  const processCheck =
    input.scenario === "performance"
      ? "From a UK performance process perspective, I need to understand the evidence, support plan, and review points."
      : `From a UK employment process perspective, I need clarity on how this ${SCENARIO_LABELS[input.scenario].toLowerCase()} discussion will be handled fairly.`;

  return `${base} ${challenge} ${processCheck}`;
}

async function openAiPracticeReply(input: {
  scenario: PracticeScenario;
  character: PracticeCharacter;
  difficulty: number;
  messages: PracticeMessage[];
}): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const scenarioLabel = SCENARIO_LABELS[input.scenario];
    const modeNote =
      input.scenario === "performance"
        ? "Performance mode is active. Prioritize capability-process realism."
        : `Scenario mode is ${scenarioLabel}. Keep responses aligned to this scenario.`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content: [
            "You are the employee role-play partner in ResolvePath Practice Mode.",
            "You are highly experienced in UK employment-law context and people-process standards (including ACAS-style fairness principles), but you are not giving legal advice.",
            "Stay in character as the employee and respond only as the employee in 2-5 sentences.",
            "Challenge the manager where needed on fairness, evidence, support, documentation, and clear next steps.",
            "Do not break role or provide meta commentary."
          ].join(" ")
        },
        {
          role: "system",
          content: [
            `Scenario: ${scenarioLabel}.`,
            modeNote,
            `Character: ${input.character}. ${personaLine(input.character)}`,
            `Difficulty: ${input.difficulty}/5. ${difficultyLine(input.difficulty)}`,
            "If high-stakes action is implied, ask for HR/policy review without giving legal advice."
          ].join(" ")
        },
        ...input.messages
      ]
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    return reply && reply.length > 0 ? reply : null;
  } catch {
    return null;
  }
}

export async function generatePracticeReply(input: {
  scenario: PracticeScenario;
  character: PracticeCharacter;
  difficulty: number;
  messages: PracticeMessage[];
}): Promise<{ reply: string; source: "openai" | "fallback" }> {
  const aiReply = await openAiPracticeReply(input);
  if (aiReply) {
    return { reply: aiReply, source: "openai" };
  }

  return {
    reply: fallbackPracticeReply(input),
    source: "fallback"
  };
}
