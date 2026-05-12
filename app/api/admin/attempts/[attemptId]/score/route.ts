import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  giveScore: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.giveScore, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("giveScore:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
