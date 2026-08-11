import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, requireTenant, AuthError, ForbiddenError } from "@/lib/clerk";
import { processAgentMessage } from "@/services/agent.service";
import type { AgentMessageRequest } from "@actus/types";

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    requireTenant(ctx);

    if (ctx.role !== "OPERATOR") {
      return NextResponse.json({ error: "Only operators can send messages" }, { status: 403 });
    }

    const body = (await request.json()) as AgentMessageRequest;

    if (!body.messageType || !["text", "audio", "image"].includes(body.messageType)) {
      return NextResponse.json({ error: "Invalid messageType" }, { status: 400 });
    }

    if (body.messageType === "text" && !body.content?.trim()) {
      return NextResponse.json({ error: "Content required for text messages" }, { status: 400 });
    }

    const result = await processAgentMessage(body, {
      userId: ctx.userId,
      tenantId: ctx.tenantId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error("[POST /api/v1/agent/message]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
