import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
import {
    createBeritaCategory,
    getBeritaCategories,
} from "@/lib/services/beritaController";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(getBeritaCategories as any, { request });
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
    return callExpressHandler(createBeritaCategory as any, { request, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}