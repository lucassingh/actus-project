import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, requireTenant, AuthError } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    requireTenant(ctx);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    // Operators see only their own events; supervisors/admins see all in tenant
    const creatorFilter = ctx.role === "OPERATOR" ? { creatorId: ctx.userId } : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...creatorFilter,
          ...(status && { status: status as never }),
          ...(priority && { priority: priority as never }),
        },
        select: {
          id: true,
          title: true,
          eventType: true,
          status: true,
          priority: true,
          contentType: true,
          machineName: true,
          location: true,
          createdAt: true,
          resolvedAt: true,
          creator: { select: { id: true, name: true, lastname: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({
        where: {
          tenantId: ctx.tenantId,
          ...creatorFilter,
        },
      }),
    ]);

    return NextResponse.json({ events, total, limit, offset });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[GET /api/v1/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    requireTenant(ctx);

    if (ctx.role !== "OPERATOR") {
      return NextResponse.json({ error: "Only operators can create events" }, { status: 403 });
    }

    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        tenantId: ctx.tenantId,
        creatorId: ctx.userId,
        title: body.title ?? "New incident",
        description: body.description,
        eventType: body.eventType ?? "INCIDENT",
        status: "DRAFT",
        priority: body.priority ?? "MEDIUM",
        conversationHistory: { messages: [] },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("[POST /api/v1/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
