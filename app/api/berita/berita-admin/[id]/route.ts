import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  getBeritaByIdAdmin: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    getBeritaByIdAdmin: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

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