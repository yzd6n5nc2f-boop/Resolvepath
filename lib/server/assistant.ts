import OpenAI from "openai";
import { db } from "@/lib/server/db";
import { parseRiskFlags } from "@/lib/server/json";

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export interface MonitoringSnapshot {
  totalCases: number;
  statusCounts: Record<string, number>;
  highRiskVersionCount: number;
  recentCases: Array<{
    id: string;
    title: string;
    scenario: string;
    status: string;
    updatedAt: string;
  }>;
  disclaimerAccepted: boolean;
  hasOrgPolicy: boolean;
  unavailable?: boolean;
}

export interface AssistantReply {
  reply: string;
  source: "openai" | "fallback";
  monitoring: MonitoringSnapshot;
}

function isAssistantRole(value: unknown): value is AssistantRole {
  return value === "user" || value === "assistant";
}

export function normalizeAssistantMessages(input: unknown): AssistantMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalized = input
    .map((item): AssistantMessage | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;

      if (!isAssistantRole(role) || typeof content !== "string") {
        return null;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        return null;
      }

      return {
        role,
        content: trimmed.slice(0, 2000)
      };
    })
    .filter((entry): entry is AssistantMessage => entry !== null);

  return normalized.slice(-12);
}

export async function getAssistantMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  try {
    const [recentCases, allStatuses, recentVersions, settings] = await Promise.all([
      db.case.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          scenario: true,
          status: true,
          updatedAt: true
        }
      }),
      db.case.findMany({
        select: { status: true }
      }),
      db.outputVersion.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        select: { riskFlagsJson: true }
      }),
      db.setting.findUnique({
        where: { id: 1 },
        select: {
          disclaimerAccepted: true,
          orgPolicyText: true
        }
      })
    ]);

    const statusCounts = allStatuses.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const highRiskVersionCount = recentVersions.reduce((count, version) => {
      const hasHigh = parseRiskFlags(version.riskFlagsJson).some((flag) => flag.severity === "high");
      return hasHigh ? count + 1 : count;
    }, 0);

    return {
      totalCases: allStatuses.length,
      statusCounts,
      highRiskVersionCount,
      recentCases: recentCases.map((item) => ({
        id: item.id,
        title: item.title,
        scenario: item.scenario,
        status: item.status,
        updatedAt: item.updatedAt.toISOString()
      })),
      disclaimerAccepted: Boolean(settings?.disclaimerAccepted),
      hasOrgPolicy: Boolean(settings?.orgPolicyText && settings.orgPolicyText.trim().length > 0)
    };
  } catch {
    return {
      totalCases: 0,
      statusCounts: {},
      highRiskVersionCount: 0,
      recentCases: [],
      disclaimerAccepted: false,
      hasOrgPolicy: false,
      unavailable: true
    };
  }
}

function snapshotSummary(snapshot: MonitoringSnapshot): string {
  if (snapshot.unavailable) {
    return "Monitoring snapshot unavailable. Check database setup and retry.";
  }

  const statusSummary =
    Object.entries(snapshot.statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(", ") || "No stored cases yet";

  return [
    `Stored cases: ${snapshot.totalCases}`,
    `By status: ${statusSummary}`,
    `High-risk versions (last 25): ${snapshot.highRiskVersionCount}`,
    `Disclaimer accepted: ${snapshot.disclaimerAccepted ? "Yes" : "No"}`,
    `Org policy saved: ${snapshot.hasOrgPolicy ? "Yes" : "No"}`
  ].join("\n");
}

function fallbackReply(lastUserMessage: string, snapshot: MonitoringSnapshot): string {
  const prompt = lastUserMessage.toLowerCase();
  const monitoring = snapshotSummary(snapshot);

  if (prompt.includes("monitor") || prompt.includes("health") || prompt.includes("status")) {
    return `ResolvePath monitoring snapshot:\n${monitoring}\n\nNext step: generate outputs for draft cases and review high-risk versions first.`;
  }

  if (prompt.includes("risk") || prompt.includes("safety")) {
    return [
      "For ResolvePath risk handling:",
      "1. Ensure timeline events are added with dates and factual notes.",
      "2. Run generation to trigger keyword-based risk flags.",
      "3. If high-risk is flagged, keep safety mode and escalate for HR/legal review.",
      "",
      "This is process support, not legal advice."
    ].join("\n");
  }

  if (prompt.includes("new case") || prompt.includes("wizard") || prompt.includes("intake")) {
    return [
      "Recommended flow in ResolvePath:",
      "1. Select scenario.",
      "2. Complete intake facts (objective and dated).",
      "3. Refine summary.",
      "4. Build timeline.",
      "5. Review risk flags and safety gate.",
      "6. Generate outputs and save versions."
    ].join("\n");
  }

  if (prompt.includes("template")) {
    return "Use Templates Library to start from scenario packs, then adapt tone/length in the Outputs Hub before sharing.";
  }

  if (prompt.includes("practice")) {
    return "Use Practice Mode with scenario + character + difficulty, then improve clarity/empathy/boundaries based on the scorecard feedback.";
  }

  if (prompt.includes("settings") || prompt.includes("policy")) {
    return "In Settings, confirm disclaimer acceptance and save org policy text so generated drafts include policy-aligned reminders.";
  }

  return [
    "I can help with ResolvePath workflows: case setup, risk/safety checks, output generation, templates, practice mode, settings, and monitoring.",
    "Ask a specific question like:",
    '- "How do I reduce high-risk flags before generating outputs?"',
    '- "Give me a monitoring summary."',
    '- "What should I include in intake for a grievance case?"'
  ].join("\n");
}

async function openAiReply(
  messages: AssistantMessage[],
  snapshot: MonitoringSnapshot,
  page: string | null
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const history = messages.slice(-10).map((message) => ({
      role: message.role,
      content: message.content
    }));

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content: [
            "You are ResolvePath AI Support.",
            "Scope is strictly this app: case workflow, intake quality, timeline, risk flags, safety gate, outputs, versions, templates, practice mode, settings, and monitoring.",
            "Be concise and actionable with numbered steps where useful.",
            "If asked unrelated topics, say you can only assist with ResolvePath.",
            "Do not provide legal advice. For high-risk topics, recommend qualified HR/legal review.",
            "Keep suggestions process-focused and policy-aware."
          ].join(" ")
        },
        {
          role: "system",
          content: `Current route: ${page || "unknown"}\nMonitoring snapshot:\n${snapshotSummary(snapshot)}`
        },
        ...history
      ]
    });

    const content = completion.choices[0]?.message?.content?.trim();
    return content || null;
  } catch {
    return null;
  }
}

export async function generateAssistantReply(input: {
  messages: AssistantMessage[];
  page?: string | null;
}): Promise<AssistantReply> {
  const monitoring = await getAssistantMonitoringSnapshot();
  const lastUserMessage =
    [...input.messages].reverse().find((message) => message.role === "user")?.content || "";

  const ai = await openAiReply(input.messages, monitoring, input.page || null);
  if (ai) {
    return { reply: ai, source: "openai", monitoring };
  }

  return {
    reply: fallbackReply(lastUserMessage, monitoring),
    source: "fallback",
    monitoring
  };
}
