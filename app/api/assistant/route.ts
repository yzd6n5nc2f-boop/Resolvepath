import { NextResponse } from "next/server";
import {
  generateAssistantReply,
  getAssistantMonitoringSnapshot,
  normalizeAssistantMessages
} from "@/lib/server/assistant";

interface AssistantBody {
  messages?: unknown;
  page?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as AssistantBody;
  const messages = normalizeAssistantMessages(body.messages);

  if (!messages.length || !messages.some((message) => message.role === "user")) {
    return NextResponse.json(
      {
        error: "messages must include at least one user message"
      },
      { status: 400 }
    );
  }

  const reply = await generateAssistantReply({
    messages,
    page: typeof body.page === "string" ? body.page : null
  });

  return NextResponse.json({
    reply: reply.reply,
    source: reply.source,
    monitoring: reply.monitoring,
    timestamp: new Date().toISOString()
  });
}

export async function GET(): Promise<NextResponse> {
  const monitoring = await getAssistantMonitoringSnapshot();

  return NextResponse.json({
    available: true,
    provider: process.env.OPENAI_API_KEY ? "openai-or-fallback" : "fallback-only",
    monitoring
  });
}
