import { auth } from "@/lib/middleware/auth";
import { submitTestResponse } from "@/lib/testApi";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const user = await auth(request);

    if (!Number.isFinite(Number(user?.id ?? user?.userId))) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const { testId } = await params;
    return submitTestResponse(user, Number(testId), body);
  } catch (error) {
    console.error("submitTest:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
