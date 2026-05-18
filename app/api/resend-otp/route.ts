import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { resendOtp } from "@/lib/services/login";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: any = undefined;
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch {
      // body parse error will be handled by controller
    }
    return callExpressHandler(resendOtp as any, { request, body });
  } catch (error) {
    console.error(error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
