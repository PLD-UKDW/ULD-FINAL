import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  scoreEssayQuestion: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);
    let body: any = undefined;
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch {
      // body parse error will be handled by controller
    }
    return callExpressHandler(adminController.scoreEssayQuestion, { request, params: await params, body });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("scoreEssayQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
