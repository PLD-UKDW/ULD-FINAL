import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { search, status, angkatan, fakultasId, prodiId } = Object.fromEntries(new URL(request.url).searchParams.entries());
    const where: Record<string, any> = {};

    if (status) where.status = String(status);
    if (angkatan && !Number.isNaN(Number(angkatan))) where.angkatan = Number(angkatan);
    if (fakultasId && !Number.isNaN(Number(fakultasId))) where.fakultas_id = Number(fakultasId);
    if (prodiId && !Number.isNaN(Number(prodiId))) where.prodi_id = Number(prodiId);
    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [{ nama: { contains: q } }, { nim: { contains: q } }];
    }

    const mahasiswa = await prisma.mahasiswa.findMany({
      where,
      include: {
        fakultas: { select: { nama: true } },
        prodi: { select: { nama: true } },
        jenisDisabilitas: { include: { jenis: { select: { jenis: true } } } },
        kategoriDisabilitas: { include: { kategori: { select: { kategori: true } } } },
      },
    });

    const formatted = mahasiswa.map((m: any) => ({
      id: m.id,
      nama: m.nama,
      nim: m.nim,
      provinsi: m.provinsi,
      angkatan: m.angkatan,
      jalur_masuk: m.jalur_masuk,
      status: m.status,
      jenjang: m.jenjang,
      gender: m.gender,
      asal_sekolah: m.asal_sekolah,
      ipk: m.ipk,
      fakultas: m.fakultas?.nama || null,
      prodi: m.prodi?.nama || null,
      jenisDisabilitas: m.jenisDisabilitas.length > 0 ? m.jenisDisabilitas[0].jenis.jenis : null,
      kategoriDisabilitas: m.kategoriDisabilitas.map((k: any) => k.kategori.kategori),
    }));

    return Response.json(formatted);
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}

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
        data: {
          mahasiswa_id: mahasiswa.id,
          kategori_id: k.id,
        },
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
        data: {
          mahasiswa_id: mahasiswa.id,
          jenis_id: jenisToInsert,
        },
      });
    }

    return Response.json({ message: "Mahasiswa berhasil dibuat", mahasiswa }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}
