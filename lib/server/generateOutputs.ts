import OpenAI from "openai";
import type { GenerateInput, GenerationMode, OutputPayload } from "@/lib/server/domain";

const OUTPUT_KEYS: Array<keyof OutputPayload> = [
  "script",
  "invite_email",
  "meeting_notes",
  "followup_email",
  "improvement_plan",
  "checklist"
];

function parseOutputPayload(raw: string): OutputPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<OutputPayload>;
    for (const key of OUTPUT_KEYS) {
      if (typeof parsed[key] !== "string") {
        return null;
      }
    }
    return parsed as OutputPayload;
  } catch {
    return null;
  }
}

function policyLine(orgPolicyText?: string | null): string {
  return orgPolicyText && orgPolicyText.trim().length > 0
    ? `Policy reminder: ${orgPolicyText.trim()}`
    : "Policy reminder: follow your internal policy sequence and documentation standards.";
}

function lengthGuidance(length: GenerateInput["lengthPreference"]): string {
  if (length === "short") {
    return "Keep sections concise and action-oriented.";
  }

  if (length === "detailed") {
    return "Include context, examples, and alternatives for each action point.";
  }

  return "Use balanced detail with clear action points.";
}

function toneGuidance(tone: GenerateInput["tonePreference"]): string {
  if (tone === "supportive") {
    return "Use supportive language while preserving clear expectations.";
  }

  if (tone === "firm") {
    return "Use firm, boundary-focused wording with factual phrasing.";
  }

  return "Use neutral, factual wording.";
}

function fallbackOutputs(input: GenerateInput, mode: GenerationMode): OutputPayload {
  const timelineText = input.timelineEvents.length
    ? input.timelineEvents.map((event) => `- ${event.date}: ${event.note}`).join("\n")
    : "- Timeline details to be added.";

  const safetyNote =
    mode === "safety"
      ? "Safety mode: avoid decisive outcomes and request HR/legal review before formal action."
      : "";

  const policy = policyLine(input.orgPolicyText);

  return {
    script: `Opening\n- Set the purpose and process steps.\n\nFacts\n- Case: ${input.caseTitle}\n- Scenario: ${input.scenario}\n- Summary: ${input.summary}\n\nTimeline\n${timelineText}\n\nImpact\n- Describe impact using observable facts only.\n\nQuestions\n- Ask for context, barriers, and support needs.\n\nExpectations\n- Confirm expected standards and review checkpoints.\n- ${toneGuidance(input.tonePreference)}\n- ${lengthGuidance(input.lengthPreference)}\n\nClose\n- Confirm next steps and written follow-up.${mode === "safety" ? `\n- ${safetyNote}` : ""}\n\n${policy}`,

    invite_email: `Subject: Case review meeting - ${input.caseTitle}\n\nHi [Name],\n\nI would like to schedule a case review discussion to align on facts, understand context, and agree practical next steps.\n\nMeeting focus:\n- Review chronology and current concerns\n- Hear your perspective\n- Confirm actions and review dates\n\nKind regards,\n[Manager]\n\n${policy}${mode === "safety" ? `\n${safetyNote}` : ""}`,

    meeting_notes: `Meeting Notes Template\n- Date/time:\n- Participants:\n- Case summary:\n- Timeline references:\n${timelineText}\n- Employee perspective:\n- Agreed actions:\n- Review date:\n\n${policy}${mode === "safety" ? `\n${safetyNote}` : ""}`,

    followup_email: `Subject: Follow-up and next steps - ${input.caseTitle}\n\nHi [Name],\n\nThank you for the discussion. This message confirms the key points, agreed actions, and review timeline.\n\nIf anything is inaccurate, please reply so records can be corrected promptly.\n\nRegards,\n[Manager]\n\n${policy}${mode === "safety" ? `\n${safetyNote}` : ""}`,

    improvement_plan: `Improvement Plan\n- Objective: [Expected outcome]\n- Measurement: [How progress is measured]\n- Support: [Support provided]\n- Milestones: [Date checkpoints]\n- Review date: [Insert]\n\n${lengthGuidance(input.lengthPreference)}\n${policy}${mode === "safety" ? `\n${safetyNote}` : ""}`,

    checklist: `Checklist\n- [ ] Verify chronology and summary facts\n- [ ] Align communication with policy\n- [ ] Document meeting outcomes\n- [ ] Confirm follow-up timeline\n- [ ] Save versioned outputs\n${mode === "safety" ? "- [ ] Obtain HR/legal review before formal decisions\n" : ""}\n${policy}`
  };
}

async function openAiOutputs(input: GenerateInput, mode: GenerationMode): Promise<OutputPayload | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = {
      objective: "Generate practical workplace draft outputs in JSON only.",
      constraints: [
        "No legal advice language.",
        "Use factual, process-led communication.",
        "For safety mode, avoid decisive action statements and recommend HR/legal review.",
        "Return JSON with exact keys: script, invite_email, meeting_notes, followup_email, improvement_plan, checklist."
      ],
      mode,
      tonePreference: input.tonePreference,
      lengthPreference: input.lengthPreference,
      case: {
        title: input.caseTitle,
        scenario: input.scenario,
        summary: input.summary,
        timelineEvents: input.timelineEvents,
        riskFlags: input.riskFlags || []
      },
      policy: policyLine(input.orgPolicyText)
    };

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: mode === "safety" ? 0.2 : 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate HR communication drafts. Keep language practical, factual, and policy-aware. Never present legal advice."
        },
        {
          role: "user",
          content: JSON.stringify(prompt)
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    return parseOutputPayload(content);
  } catch {
    return null;
  }
}

export async function generateOutputs(input: GenerateInput, mode: GenerationMode): Promise<OutputPayload> {
  const ai = await openAiOutputs(input, mode);
  if (ai) {
    return ai;
  }

  return fallbackOutputs(input, mode);
}

export async function generateOutputsStandard(input: GenerateInput): Promise<OutputPayload> {
  return generateOutputs(input, "standard");
}

export async function generateOutputsSafety(input: GenerateInput): Promise<OutputPayload> {
  const normalizedInput: GenerateInput = {
    ...input,
    tonePreference: "neutral"
  };

  return generateOutputs(normalizedInput, "safety");
}
