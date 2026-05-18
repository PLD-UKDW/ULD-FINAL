import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const { nama, nim, provinsi, angkatan, jalur_masuk, status, jenjang, gender, asal_sekolah, ipk, fakultas_id, prodi_id, kategori } = body ?? {};

    const existingMahasiswa = await prisma.mahasiswa.findUnique({ where: { id: Number(id) } });
    if (!existingMahasiswa) {
      return Response.json({ message: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    if (nim && nim !== existingMahasiswa.nim) {
      const nimConflict = await prisma.mahasiswa.findFirst({ where: { nim, NOT: { id: Number(id) } } });
      if (nimConflict) {
        return Response.json({ message: "NIM sudah digunakan oleh mahasiswa lain" }, { status: 400 });
      }
    }

    const nextFakultasId = fakultas_id !== undefined && fakultas_id !== null && String(fakultas_id).trim() !== "" ? Number(fakultas_id) : existingMahasiswa.fakultas_id;
    const nextProdiId = prodi_id !== undefined && prodi_id !== null && String(prodi_id).trim() !== "" ? Number(prodi_id) : existingMahasiswa.prodi_id;
    const nextAngkatan = angkatan !== undefined && angkatan !== null && String(angkatan).trim() !== "" ? Number(angkatan) : existingMahasiswa.angkatan;
    const nextIpk = ipk !== undefined && ipk !== null && String(ipk).trim() !== "" ? Number(ipk) : existingMahasiswa.ipk;

    const kategoriList = Array.isArray(kategori) ? kategori : null;
    let kategoriDB: Array<{ id: number; jenisDisabilitas?: { id: number | null } | null }> | null = null;

    if (kategoriList) {
      const foundKategori = await prisma.kategoriDisabilitas.findMany({ where: { kategori: { in: kategoriList } }, include: { jenisDisabilitas: true } });
      if (foundKategori.length !== kategoriList.length) {
        return Response.json({ message: "Ada kategori tidak valid" }, { status: 400 });
      }
      kategoriDB = foundKategori;
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const row = await tx.mahasiswa.update({
        where: { id: Number(id) },
        data: {
          nama: nama ?? existingMahasiswa.nama,
          nim: nim ?? existingMahasiswa.nim,
          provinsi: provinsi ?? existingMahasiswa.provinsi,
          angkatan: Number.isNaN(nextAngkatan) ? existingMahasiswa.angkatan : nextAngkatan,
          jalur_masuk: jalur_masuk ?? existingMahasiswa.jalur_masuk,
          status: status ?? existingMahasiswa.status,
          jenjang: jenjang ?? existingMahasiswa.jenjang,
          gender: gender ?? existingMahasiswa.gender,
          asal_sekolah: asal_sekolah ?? existingMahasiswa.asal_sekolah,
          ipk: Number.isNaN(nextIpk) ? existingMahasiswa.ipk : nextIpk,
          fakultas_id: Number.isNaN(nextFakultasId) ? existingMahasiswa.fakultas_id : nextFakultasId,
          prodi_id: Number.isNaN(nextProdiId) ? existingMahasiswa.prodi_id : nextProdiId,
        },
      });

      if (kategoriList && kategoriDB) {
        await tx.mahasiswaKategoriDisabilitas.deleteMany({ where: { mahasiswa_id: row.id } });
        for (const k of kategoriDB) {
          await tx.mahasiswaKategoriDisabilitas.create({ data: { mahasiswa_id: row.id, kategori_id: k.id } });
        }

        let jenisToInsert: number | undefined;
        if (kategoriDB.length === 1) {
          jenisToInsert = kategoriDB[0].jenisDisabilitas?.id ?? undefined;
        } else {
          const jenisGanda = await tx.jenisDisabilitas.findFirst({ where: { jenis: "Ganda" }, select: { id: true } });
          jenisToInsert = jenisGanda?.id;
        }

        await tx.mahasiswaJenisDisabilitas.deleteMany({ where: { mahasiswa_id: row.id } });
        if (jenisToInsert) {
          await tx.mahasiswaJenisDisabilitas.create({ data: { mahasiswa_id: row.id, jenis_id: jenisToInsert } });
        }
      }

      return tx.mahasiswa.findUnique({
        where: { id: row.id },
        include: {
          fakultas: { select: { nama: true } },
          prodi: { select: { nama: true } },
          kategoriDisabilitas: { include: { kategori: { select: { kategori: true } } } },
          jenisDisabilitas: { include: { jenis: { select: { jenis: true } } } },
        },
      });
    });

    if (!updated) {
      return Response.json({ message: "Mahasiswa tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ message: "Mahasiswa berhasil diperbarui", data: updated });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}