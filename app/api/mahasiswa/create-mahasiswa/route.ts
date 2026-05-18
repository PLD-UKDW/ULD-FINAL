import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => null);
    const { nama, nim, provinsi, angkatan, jalur_masuk, status, jenjang, gender, asal_sekolah, ipk, fakultas_id, prodi_id, kategori } = body ?? {};

    if (!Array.isArray(kategori) || kategori.length === 0) {
      return Response.json({ message: "Kategori disabilitas wajib diisi array" }, { status: 400 });
    }

    const mahasiswa = await prisma.mahasiswa.create({
      data: {
        nama,
        nim,
        provinsi,
        angkatan: Number(angkatan),
        jalur_masuk,
        status,
        jenjang,
        gender,
        asal_sekolah,
        ipk: Number(ipk),
        fakultas_id: Number(fakultas_id),
        prodi_id: Number(prodi_id),
      },
    });

    const kategoriDB = await prisma.kategoriDisabilitas.findMany({
      where: { kategori: { in: kategori } },
      include: { jenisDisabilitas: true },
    });

    if (kategoriDB.length !== kategori.length) {
      return Response.json({ message: "Ada kategori yang tidak ditemukan" }, { status: 400 });
    }

    for (const k of kategoriDB) {
      await prisma.mahasiswaKategoriDisabilitas.create({
        data: { mahasiswa_id: mahasiswa.id, kategori_id: k.id },
      });
    }

    let jenisToInsert: number | undefined;
    if (kategoriDB.length === 1) {
      jenisToInsert = kategoriDB[0].jenisDisabilitas?.id ?? undefined;
    } else {
      const jenisGanda = await prisma.jenisDisabilitas.findFirst({ where: { jenis: "Ganda" } });
      jenisToInsert = jenisGanda?.id;
    }

    if (jenisToInsert) {
      await prisma.mahasiswaJenisDisabilitas.create({
        data: { mahasiswa_id: mahasiswa.id, jenis_id: jenisToInsert },
      });
    }

    return Response.json({ message: "Mahasiswa berhasil dibuat", mahasiswa }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}