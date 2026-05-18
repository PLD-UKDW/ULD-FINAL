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

    const existingMcScores = attempt.mcScores || {};
    const existingEssayScores = attempt.essayScores || {};
    const updatedMcScores = { ...existingMcScores, [questionId]: Number(score) };
    const totalEssay = Object.values(existingEssayScores).reduce((sum: number, value) => sum + Number(value), 0);
    const totalMc = Object.values(updatedMcScores).reduce((sum: number, value) => sum + Number(value), 0);
    const totalManual = totalEssay + totalMc;
    const finalScore = Number(attempt.autoScore || 0) + totalManual;

    const updated = await prisma.attempt.update({
      where: { id: Number(attemptId) },
      data: {
        mcScores: updatedMcScores,
        manualScore: totalManual,
        finalScore,
        passStatus: finalScore >= 70 ? "PASS" : "FAIL",
        gradedAt: new Date(),
      },
    });

    return Response.json({ message: "MC score saved", updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("scoreMCQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
