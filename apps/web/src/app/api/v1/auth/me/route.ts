import { NextResponse } from "next/server";
import { getRequestContext, AuthError } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ctx = await getRequestContext();

    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        clerkUserId: true,
        tenantId: true,
        email: true,
        name: true,
        lastname: true,
        role: true,
        isActive: true,
        tenant: {
          select: { id: true, name: true, code: true, plan: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
