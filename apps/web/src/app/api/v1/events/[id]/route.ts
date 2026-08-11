import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, requireTenant, AuthError } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext();
    requireTenant(ctx);

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId: ctx.tenantId },
    });

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (ctx.role === "OPERATOR" && event.creatorId !== ctx.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /events/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getRequestContext();
    requireTenant(ctx);

    const { id } = await params;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId: ctx.tenantId },
    });

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (ctx.role === "OPERATOR" && event.creatorId !== ctx.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const allowedOperator = ["title", "description", "priority", "machineName", "location", "symptoms"];
    const allowedSupervisor = [...allowedOperator, "status", "solution", "resolvedAt"];

    const allowed = ctx.role === "OPERATOR" ? allowedOperator : allowedSupervisor;

    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    );

    // Auto-set resolvedAt when status changes to RESOLVED
    if (updateData.status === "RESOLVED" && !event.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[PATCH /events/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
