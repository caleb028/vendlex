import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Redirect to official direct install page
  return NextResponse.redirect(new URL("/download?source=direct", req.url));
}
