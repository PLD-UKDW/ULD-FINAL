import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const tests = await prisma.test.findMany({
      include: { questions: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      tests.map((test: any) => ({
        ...test,
        questions: test.questions?.map((question: any) => ({
          ...question,
          questionType: question.questionType === "MCQ" ? "MULTIPLE_CHOICE" : question.questionType,
        })),
      })),
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("listTests:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => null);
    const { title, description, typeName } = body ?? {};

    if (!title || !typeName) {
      return Response.json({ message: "Judul dan tipe test wajib diisi" }, { status: 400 });
    }

    const type = await prisma.testType.upsert({
      where: { name: String(typeName).trim() },
      update: {},
      create: { name: String(typeName).trim() },
    });

    const test = await prisma.test.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        type: { connect: { id: type.id } },
      },
    });

    return Response.json({ message: "Test created successfully", test }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("createTest:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
