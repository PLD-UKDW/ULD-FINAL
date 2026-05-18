import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const data = await prisma.kategoriDisabilitas.findMany({
      orderBy: { kategori: "asc" },
      select: {
        id: true,
        kategori: true,
        jenis_disabilitas_id: true,
        jenisDisabilitas: { select: { id: true, jenis: true } },
      },
    });
    return Response.json(data);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}