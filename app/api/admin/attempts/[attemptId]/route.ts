import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);

    const { attemptId } = await params;
    const attempt = await prisma.attempt.findUnique({
      where: { id: Number(attemptId) },
      include: { user: true, test: true },
    });

    if (!attempt) return Response.json({ message: "Attempt not found" }, { status: 404 });
    return Response.json(attempt);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("getAttemptDetail:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
