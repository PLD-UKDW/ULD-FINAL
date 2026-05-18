import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);

    const { attemptId } = await params;
    const body = await request.json().catch(() => null);
    const { questionId, score } = body ?? {};

    const attempt = await prisma.attempt.findUnique({ where: { id: Number(attemptId) } });
    if (!attempt) return Response.json({ message: "Attempt not found" }, { status: 404 });

    const existingScores = attempt.essayScores || {};
    const updatedScores = { ...existingScores, [questionId]: Number(score) };
    const totalManual = Object.values(updatedScores).reduce((sum: number, value) => sum + Number(value), 0);
    const finalScore = Number(attempt.autoScore || 0) + totalManual;

    const updated = await prisma.attempt.update({
      where: { id: Number(attemptId) },
      data: {
        essayScores: updatedScores,
        manualScore: totalManual,
        finalScore,
        passStatus: finalScore >= 70 ? "PASS" : "FAIL",
        gradedAt: new Date(),
      },
    });

    return Response.json({ message: "Essay score saved", updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("scoreEssayQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
