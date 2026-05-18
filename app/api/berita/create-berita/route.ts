import { parseBeritaFormData } from "@/lib/beritaUpload";
import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  createBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    createBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

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