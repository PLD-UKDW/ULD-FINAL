import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  updateKategoriDisabilitas: (req: unknown, res: unknown, next?: unknown) => unknown;
  deleteKategoriDisabilitas: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(mahasiswaController.updateKategoriDisabilitas, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(mahasiswaController.deleteKategoriDisabilitas, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}