import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

async function recalculateMahasiswaJenis(mahasiswaId: number | string) {
  const remaining = await prisma.mahasiswaKategoriDisabilitas.findMany({
    where: { mahasiswa_id: Number(mahasiswaId) },
    include: { kategori: { select: { id: true, jenis_disabilitas_id: true } } },
  });

  await prisma.mahasiswaJenisDisabilitas.deleteMany({ where: { mahasiswa_id: Number(mahasiswaId) } });

  if (remaining.length === 0) return;

  let jenisToInsert: number | undefined;
  if (remaining.length === 1) {
    jenisToInsert = remaining[0].kategori.jenis_disabilitas_id ?? undefined;
  } else {
    const jenisGanda = await prisma.jenisDisabilitas.findFirst({ where: { jenis: "Ganda" }, select: { id: true } });
    jenisToInsert = jenisGanda?.id;
  }

  if (jenisToInsert) {
    await prisma.mahasiswaJenisDisabilitas.create({ data: { mahasiswa_id: Number(mahasiswaId), jenis_id: Number(jenisToInsert) } });
  }
}

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const { kategori, jenis_id } = body ?? {};

    if (!id || Number.isNaN(Number(id))) {
      return Response.json({ message: "ID kategori tidak valid" }, { status: 400 });
    }
    if (!kategori || !String(kategori).trim()) {
      return Response.json({ message: "Nama kategori wajib diisi" }, { status: 400 });
    }
    if (!jenis_id || Number.isNaN(Number(jenis_id))) {
      return Response.json({ message: "jenis_id wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.kategoriDisabilitas.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return Response.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const jenis = await prisma.jenisDisabilitas.findUnique({ where: { id: Number(jenis_id) } });
    if (!jenis) {
      return Response.json({ message: "Jenis disabilitas tidak ditemukan" }, { status: 404 });
    }

    const duplicate = await prisma.kategoriDisabilitas.findFirst({ where: { kategori: String(kategori).trim(), NOT: { id: Number(id) } } });
    if (duplicate) {
      return Response.json({ message: "Nama kategori sudah digunakan" }, { status: 409 });
    }

    const updated = await prisma.kategoriDisabilitas.update({
      where: { id: Number(id) },
      data: { kategori: String(kategori).trim(), jenis_disabilitas_id: Number(jenis_id) },
      select: { id: true, kategori: true, jenis_disabilitas_id: true },
    });

    const impactedMahasiswa = await prisma.mahasiswaKategoriDisabilitas.findMany({
      where: { kategori_id: Number(id) },
      select: { mahasiswa_id: true },
      distinct: ["mahasiswa_id"],
    });

    for (const row of impactedMahasiswa) {
      await recalculateMahasiswaJenis(row.mahasiswa_id);
    }

    return Response.json({ message: "Kategori disabilitas berhasil diperbarui", kategori: updated });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    if (!id || Number.isNaN(Number(id))) {
      return Response.json({ message: "ID kategori tidak valid" }, { status: 400 });
    }

    const existing = await prisma.kategoriDisabilitas.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return Response.json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const usedCount = await prisma.mahasiswaKategoriDisabilitas.count({ where: { kategori_id: Number(id) } });
    if (usedCount > 0) {
      return Response.json({ message: "Kategori disabilitas sedang digunakan dan tidak bisa dihapus", usedCount }, { status: 409 });
    }

    await prisma.kategoriDisabilitas.delete({ where: { id: Number(id) } });
    return Response.json({ message: "Kategori disabilitas berhasil dihapus" });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}