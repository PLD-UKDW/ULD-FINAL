import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";
const adminController = require("@/lib/services/adminController") as {
  getTestDetail: (req: unknown, res: unknown) => unknown;
  deleteTest: (req: unknown, res: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.getTestDetail, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("getTestDetail:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);
    return callExpressHandler(adminController.deleteTest, { request, params: await params });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteTest:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
