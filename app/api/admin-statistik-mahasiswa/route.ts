import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const statsController = require("@/lib/services/statsFiltering") as {
  adminfilterMahasiswa: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return callExpressHandler(statsController.adminfilterMahasiswa, { request });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}