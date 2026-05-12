import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  listAttempts: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.listAttempts, { request });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("listAttempts:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
