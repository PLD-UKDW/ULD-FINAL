import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  publishBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    publishBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return callExpressHandler(beritaController.publishBerita, { request, params: await params, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}