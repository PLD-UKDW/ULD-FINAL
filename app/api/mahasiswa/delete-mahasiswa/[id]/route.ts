import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const mahasiswa = await prisma.mahasiswa.findUnique({ where: { id: Number(id) } });
    if (!mahasiswa) {
      return Response.json({ error: "Mahasiswa not found" }, { status: 404 });
    }

    await prisma.mahasiswaKategoriDisabilitas.deleteMany({ where: { mahasiswa_id: Number(id) } });
    await prisma.mahasiswaJenisDisabilitas.deleteMany({ where: { mahasiswa_id: Number(id) } });
    await prisma.mahasiswa.delete({ where: { id: Number(id) } });

    return Response.json({ message: "Mahasiswa deleted successfully" });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}