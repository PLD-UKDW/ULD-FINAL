import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);

    const { attemptId } = await params;
    const body = await request.json().catch(() => null);
    const { manualScore } = body ?? {};

    const attempt = await prisma.attempt.findUnique({ where: { id: Number(attemptId) }, include: { test: true } });
    if (!attempt) return Response.json({ message: "Attempt not found" }, { status: 404 });
    if (attempt.test.type?.name !== "COLLEGE_READINESS") {
      return Response.json({ message: "Manual scoring only for COLLEGE_READINESS" }, { status: 400 });
    }

    const finalScore = Number(attempt.autoScore || 0) + Number(manualScore || 0);
    const updated = await prisma.attempt.update({
      where: { id: Number(attemptId) },
      data: {
        manualScore: Number(manualScore),
        finalScore,
        passStatus: finalScore >= 70 ? "PASS" : "FAIL",
        gradedAt: new Date(),
      },
    });

    return Response.json({ message: "Score updated successfully", updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("giveScore:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
