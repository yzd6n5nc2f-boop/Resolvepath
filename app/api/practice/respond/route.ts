import { NextResponse } from "next/server";
import { generatePracticeReply, normalizePracticeInput } from "@/lib/server/practiceSimulator";

interface PracticeBody {
  scenario?: unknown;
  character?: unknown;
  difficulty?: unknown;
  messages?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as PracticeBody;
  const normalized = normalizePracticeInput({
    scenario: body.scenario,
    character: body.character,
    difficulty: body.difficulty,
    messages: body.messages
  });

  if (!normalized.messages.length || !normalized.messages.some((message) => message.role === "user")) {
    return NextResponse.json({ error: "messages must include at least one user message" }, { status: 400 });
  }

  const result = await generatePracticeReply(normalized);

  return NextResponse.json({
    reply: result.reply,
    source: result.source,
    scenario: normalized.scenario,
    character: normalized.character,
    difficulty: normalized.difficulty
  });
}
