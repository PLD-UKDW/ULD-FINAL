import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaController = require("@/lib/services/beritaController") as {
  getBeritaCategories: (req: unknown, res: unknown, next?: unknown) => unknown;
  createBeritaCategory: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(beritaController.getBeritaCategories, { request });
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
    return callExpressHandler(beritaController.createBeritaCategory, { request, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}