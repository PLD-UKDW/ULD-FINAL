import { auth } from "@/lib/middleware/auth";
import { getTestResponse } from "@/lib/testApi";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const user = await auth(request);

    const userId = Number(user?.id ?? user?.userId);

    if (!Number.isFinite(userId)) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;
    return getTestResponse(Number(testId));
  } catch (error) {
    console.error("getTest:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
