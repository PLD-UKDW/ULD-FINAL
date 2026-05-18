import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const data = await prisma.mahasiswa.findMany({
      select: { angkatan: true },
      distinct: ["angkatan"],
      orderBy: { angkatan: "desc" },
    });
    return Response.json(data.map((m: { angkatan: number | null }) => m.angkatan));
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}