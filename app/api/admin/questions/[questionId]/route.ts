import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  updateQuestion: (req: unknown, res: unknown) => unknown;
  deleteQuestion: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
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
    return callExpressHandler(adminController.updateQuestion, { request, params: await params, body });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("updateQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.deleteQuestion, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
