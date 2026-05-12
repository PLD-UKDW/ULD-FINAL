import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  addQuestion: (req: unknown, res: unknown) => unknown;
  deleteAllQuestions: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
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
    return callExpressHandler(adminController.addQuestion, { request, params: await params, body });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("addQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.deleteAllQuestions, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteAllQuestions:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
