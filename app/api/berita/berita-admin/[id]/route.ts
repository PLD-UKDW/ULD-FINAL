import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaController = require("@/lib/services/beritaController") as {
  getBeritaByIdAdmin: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(beritaController.getBeritaByIdAdmin, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}