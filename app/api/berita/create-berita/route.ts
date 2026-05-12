import { parseBeritaFormData } from "@/lib/beritaUpload";
import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaController = require("@/lib/services/beritaController") as {
  createBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { body, files } = await parseBeritaFormData(request);
    return callExpressHandler(beritaController.createBerita, { request, body, files });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}