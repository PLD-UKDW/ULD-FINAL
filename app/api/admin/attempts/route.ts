import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const attempts = await prisma.attempt.findMany({
      include: { user: true, test: true },
      orderBy: { completedAt: "desc" },
    });
    return Response.json(attempts);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("listAttempts:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
