import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    await requireAdmin(request);

    const { questionId } = await params;
    const questionIdNumber = Number(questionId);
    if (!Number.isFinite(questionIdNumber)) {
      return Response.json({ message: "Invalid questionId" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const { text, options, answer, questionType, autoScore } = body ?? {};

    const existing = await prisma.question.findUnique({ where: { id: questionIdNumber } });
    if (!existing) {
      return Response.json({ message: "Question not found" }, { status: 404 });
    }

    const normalizedType = questionType === "MCQ" ? "MULTIPLE_CHOICE" : questionType ?? existing.questionType;
    const normalizedText = String(text ?? existing.text ?? "").trim();
    const normalizedOptions = normalizedType === "MULTIPLE_CHOICE" ? (Array.isArray(options) ? options : []) : [];
    const normalizedAnswer = normalizedType === "MULTIPLE_CHOICE" ? (typeof answer === "string" ? answer.trim() || null : existing.answer) : null;
    const normalizedScore = normalizedType === "MULTIPLE_CHOICE" ? Number(autoScore ?? existing.autoScore ?? 0) : 0;

    const updated = await prisma.question.update({
      where: { id: questionIdNumber },
      data: {
        text: normalizedText,
        options: normalizedOptions,
        answer: normalizedAnswer,
        questionType: normalizedType,
        autoScore: normalizedScore,
      },
    });

    return Response.json({ message: "Question updated successfully", updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("updateQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    await requireAdmin(request);

    const { questionId } = await params;
    const questionIdNumber = Number(questionId);
    if (!Number.isFinite(questionIdNumber)) {
      return Response.json({ message: "Invalid questionId" }, { status: 400 });
    }

    const existing = await prisma.question.findUnique({ where: { id: questionIdNumber } });
    if (!existing) {
      return Response.json({ message: "Question not found" }, { status: 404 });
    }

    await prisma.question.delete({ where: { id: questionIdNumber } });
    return Response.json({ message: "Question deleted" });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
