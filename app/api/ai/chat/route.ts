import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator } from "@/lib/ai/orchestrator";
import { AIUserContext } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId = "conv-default", context = {} } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "A message string is required." },
        { status: 400 }
      );
    }

    // Extract user context from body and optional headers
    const userContext: AIUserContext = {
      userId: context.userId,
      name: context.name,
      phone: context.phone,
      email: context.email,
      role: context.role || "CUSTOMER",
      businessId: context.businessId,
      businessName: context.businessName,
      businessSlug: context.businessSlug,
      currentPage: context.currentPage || "/",
      county: context.county || "Nairobi",
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
