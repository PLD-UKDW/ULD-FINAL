import { auth } from "@/lib/middleware/auth";
import { getUserAttemptResponse } from "@/lib/testApi";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const user = await auth(request);

    const userId = Number(user?.id ?? user?.userId);

    if (!Number.isFinite(userId)) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;
    const attemptId = new URL(request.url).searchParams.get("attemptId");
    return getUserAttemptResponse(userId, Number(testId), attemptId ? Number(attemptId) : null);
  } catch (error) {
    console.error("getUserAttempt:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
