import { auth } from "@/lib/middleware/auth";
import { getTestListResponse } from "@/lib/testApi";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await auth(request);

    const userId = Number(user?.id ?? user?.userId);

    if (!Number.isFinite(userId)) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    return getTestListResponse(userId);
  } catch (error) {
    console.error("listTests:", error);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
