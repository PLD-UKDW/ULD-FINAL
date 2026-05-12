import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  listTests: (req: unknown, res: unknown) => unknown;
  createTest: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.listTests, { request });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("listTests:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
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
    return callExpressHandler(adminController.createTest, { request, body });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("createTest:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
