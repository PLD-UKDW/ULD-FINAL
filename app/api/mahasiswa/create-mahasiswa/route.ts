import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  createMahasiswa: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    return callExpressHandler(mahasiswaController.createMahasiswa, { request });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}