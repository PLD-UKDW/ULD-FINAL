import { parseBeritaFormData } from "@/lib/beritaUpload";
import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaController = require("@/lib/services/beritaController") as {
  updateBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { body, files } = await parseBeritaFormData(request);
    return callExpressHandler(beritaController.updateBerita, { request, params: await params, body, files });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}