import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  getAllMahasiswa: (req: unknown, res: unknown, next?: unknown) => unknown;
  createMahasiswa: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return callExpressHandler(mahasiswaController.getAllMahasiswa, { request });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    return callExpressHandler(mahasiswaController.createMahasiswa, { request, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}
