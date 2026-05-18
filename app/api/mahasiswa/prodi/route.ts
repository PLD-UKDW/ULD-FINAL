import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const fakultasId = Number(new URL(request.url).searchParams.get("fakultasId"));

    if (!fakultasId) {
      return Response.json({ message: "fakultasId diperlukan" }, { status: 400 });
    }

    const data = await prisma.prodi.findMany({
      where: { fakultas_id: fakultasId },
      orderBy: { nama: "asc" },
    });

    return Response.json(data);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}
