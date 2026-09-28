import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const apkPath = path.join(process.cwd(), "public", "VendLex-Kenya.apk");
    if (fs.existsSync(apkPath)) {
      const fileBuffer = fs.readFileSync(apkPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/vnd.android.package-archive",
          "Content-Disposition": 'attachment; filename="VendLex-Kenya.apk"',
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (err) {
    console.error("[APK Download Error]:", err);
  }

  // Fallback redirect to download page
  return NextResponse.redirect(new URL("/download?source=direct", req.url));
}
