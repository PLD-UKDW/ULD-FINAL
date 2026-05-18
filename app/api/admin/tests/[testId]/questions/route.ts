import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);

    const { testId } = await params;
    const body = await request.json().catch(() => null);
    const { text, options, answer, questionType, autoScore } = body ?? {};

    const test = await prisma.test.findUnique({ where: { id: Number(testId) } });
    if (!test) return Response.json({ message: "Test not found" }, { status: 404 });

    const normalizedType = questionType === "MCQ" ? "MULTIPLE_CHOICE" : questionType ?? "MULTIPLE_CHOICE";
    const q = await prisma.question.create({
      data: {
        text: String(text ?? "").trim(),
        options: normalizedType === "MULTIPLE_CHOICE" ? (Array.isArray(options) ? options : []) : [],
        answer: normalizedType === "MULTIPLE_CHOICE" && typeof answer === "string" ? answer.trim() || null : null,
        questionType: normalizedType,
        autoScore: normalizedType === "MULTIPLE_CHOICE" ? Number(autoScore || 0) : 0,
        testId: Number(testId),
      },
    });

    return Response.json(q, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("addQuestion:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);

    const { testId } = await params;
    const id = Number(testId);
    const test = await prisma.test.findUnique({ where: { id } });
    if (!test) return Response.json({ message: "Test not found" }, { status: 404 });

    await prisma.question.deleteMany({ where: { testId: id } });
    return Response.json({ message: "All questions deleted for this test" });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteAllQuestions:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
