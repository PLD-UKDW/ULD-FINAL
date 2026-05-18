import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    await requireAdmin(request);

    const { attemptId } = await params;
    const body = await request.json().catch(() => null);
    const { status } = body ?? {};

    const updated = await prisma.attempt.update({
      where: { id: Number(attemptId) },
      data: { passStatus: status },
    });

    return Response.json({ message: "Status updated", updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("setPassStatus:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
