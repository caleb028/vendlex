import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator } from "@/lib/ai/orchestrator";
import { AIUserContext } from "@/lib/ai/types";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const body = await req.json();
    const { message, conversationId = "conv-default", context = {} } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message string is required." },
        { status: 400 }
      );
    }

    // Derive identity and role strictly from the authenticated server session (never trust client-supplied role/userId)
    const sessionRole =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
        ? "ADMIN"
        : user?.role === "SELLER" || user?.role === "BUSINESS_OWNER" || user?.role === "SERVICE_PROVIDER"
        ? "SELLER"
        : "CUSTOMER";

    const userContext: AIUserContext = {
      userId: user?.id,
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      role: sessionRole,
      businessId: user?.businessId,
      businessName: user?.businessName,
      businessSlug: user?.businessSlug,
      currentPage: typeof context.currentPage === "string" ? sanitizeInput(context.currentPage, 100) : "/",
      county: typeof context.county === "string" ? sanitizeInput(context.county, 60) : "Nairobi",
    };

    // Execute through the real server-side AI orchestrator
    const response = await AIOrchestrator.processMessage(
      message.trim(),
      conversationId,
      userContext
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[VendLex AI API Error]:", error);
    return NextResponse.json(
      {
        type: "error",
        message: "VendLex AI encountered an internal processing error. Please try again.",
        sources: ["VendLex System Gateway"],
        toolsExecuted: [],
        confidence: "UNKNOWN",
      },
      { status: 500 }
    );
  }
}
