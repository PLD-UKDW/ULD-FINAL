import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    await requireAdmin(request);

    const { testId } = await params;
    const id = Number(testId);
    const test = await prisma.test.findUnique({ where: { id }, include: { questions: true } });

    if (!test) return Response.json({ message: "Test not found" }, { status: 404 });

    return Response.json({
      ...test,
      questions: test.questions?.map((question: any) => ({
        ...question,
        questionType: question.questionType === "MCQ" ? "MULTIPLE_CHOICE" : question.questionType,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("getTestDetail:", error);
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

    await prisma.attempt.deleteMany({ where: { testId: id } });
    await prisma.question.deleteMany({ where: { testId: id } });
    await prisma.test.delete({ where: { id } });

    return Response.json({ message: "Test deleted successfully" });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("deleteTest:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
