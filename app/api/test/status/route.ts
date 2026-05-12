import { auth } from "@/lib/middleware/auth";
import { callExpressHandler } from "@/lib/nextExpressAdapter";

const testController = require("@/lib/services/testController") as {
  getStatus: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await auth(request);

    if (!user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    return callExpressHandler(testController.getStatus, { request, user });
  } catch (error) {
    console.error("getStatus:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
