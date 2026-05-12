import { auth } from "@/lib/middleware/auth";
import { callExpressHandler } from "@/lib/nextExpressAdapter";

const testController = require("@/lib/services/testController") as {
  submitTest: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const user = await auth(request);

    if (!user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    let body: any = undefined;
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch {
      // body parse error will be handled by controller
    }
    return callExpressHandler(testController.submitTest, { request, params: await params, user, body });
  } catch (error) {
    console.error("submitTest:", error);

    if (error instanceof SyntaxError) {
      return Response.json({ message: "Invalid answers JSON" }, { status: 400 });
    }

    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
