import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaController = require("@/lib/services/beritaController") as {
  unpublishBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
};

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
    return callExpressHandler(beritaController.unpublishBerita, { request, params: await params, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}