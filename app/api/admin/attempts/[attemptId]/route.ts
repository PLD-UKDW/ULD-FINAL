import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  getAttemptDetail: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.getAttemptDetail, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("getAttemptDetail:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
