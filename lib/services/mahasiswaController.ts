import type { NextFunction, Request, Response } from "express";

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma") as any;

async function getJenisFromKategori(kategoriArray: number[]) {
    if (kategoriArray.length === 1) {
        const kategoriDB = await prisma.kategoriDisabilitas.findUnique({
            where: { id: kategoriArray[0] },
            include: { jenisDisabilitas: true }
        });
        return kategoriDB.jenis_disabilitas_id;
    }

    const jenisGanda = await prisma.jenisDisabilitas.findFirst({
        where: { jenis: "Ganda" }
    });

    return jenisGanda.id;
}

// async function resolveJenisDisabilitas(kategoriDB) {
//     if (kategoriDB.length === 1) {
//         return kategoriDB[0].jenisDisabilitas.id;
//     }

//     const jenisGanda = await prisma.jenisDisabilitas.findFirst({
//         where: { jenis: "Ganda" }
//     });

//     return jenisGanda.id;
// }

const getAllMahasiswa = async (req: Request, res: Response) => {
    try {
        const { status, angkatan, fakultasId, prodiId, search } = req.query as Record<string, string | undefined>;

            const where: Record<string, any> = {};
        if (status) {
            where.status = String(status);
        }
        if (angkatan && !Number.isNaN(Number(angkatan))) {
            where.angkatan = Number(angkatan);
        }
        if (fakultasId && !Number.isNaN(Number(fakultasId))) {
            where.fakultas_id = Number(fakultasId);
        }
        if (prodiId && !Number.isNaN(Number(prodiId))) {
            where.prodi_id = Number(prodiId);
        }
        if (search && String(search).trim().length > 0) {
            const q = String(search).trim();
            where.OR = [
                { nama: { contains: q } },
                { nim: { contains: q } },
            ];
        }

        const mahasiswa = await prisma.mahasiswa.findMany({
            where,
            include: {
                fakultas: {
                    select: {
                        nama: true
                    }
                },
                prodi: {
                    select: {
                        nama: true
                    }
                },
                jenisDisabilitas: {
                    include: {
                        jenis: {
                            select: {
                                jenis: true
                            }
                        }
                    }
                },
                kategoriDisabilitas: {
                    include: {
                        kategori: {
                            select: {
                                kategori: true
                            }
                        }
                    }
                },
            }
        });
        const formatted = mahasiswa.map((m: {
            id: number;
            nama: string;
            nim: string;
            provinsi: string | null;
            angkatan: number | null;
            jalur_masuk: string | null;
            status: string | null;
            jenjang: string | null;
            gender: string | null;
            asal_sekolah: string | null;
            ipk: number | null;
            fakultas?: { nama?: string | null } | null;
            prodi?: { nama?: string | null } | null;
            jenisDisabilitas: Array<{ jenis: { jenis: string } }>;
            kategoriDisabilitas: Array<{ kategori: { kategori: string } }>;
        }) => ({
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
            jenisDisabilitas:
                m.jenisDisabilitas.length > 0
                    ? m.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: m.kategoriDisabilitas.map((k: { kategori: { kategori: string } }) => k.kategori.kategori)
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error('getAllMahasiswa error:', error);
        const detail = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Failed to fetch mahasiswa', detail });
    }
};

const getMahasiswaById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) },
            include: {
                fakultas: { select: { nama: true } },
                prodi: { select: { nama: true } },
                kategoriDisabilitas: {
                    include: {
                        kategori: { select: { kategori: true } }
                    }
                },
                jenisDisabilitas: {
                    include: {
                        jenis: { select: { jenis: true } }
                    }
                }
            }
        });

        if (!mahasiswa) {
            return res.status(404).json({ error: "Mahasiswa not found" });
        }

        const formatted = {
            id: mahasiswa.id,
            nama: mahasiswa.nama,
            nim: mahasiswa.nim,
            provinsi: mahasiswa.provinsi,
            angkatan: mahasiswa.angkatan,
            jalur_masuk: mahasiswa.jalur_masuk,
            status: mahasiswa.status,
            jenjang: mahasiswa.jenjang,
            gender: mahasiswa.gender,
            asal_sekolah: mahasiswa.asal_sekolah,
            ipk: mahasiswa.ipk,
            fakultas_id: mahasiswa.fakultas_id,
            prodi_id: mahasiswa.prodi_id,
            fakultas: mahasiswa.fakultas?.nama || null,
            prodi: mahasiswa.prodi?.nama || null,
            jenisDisabilitas:
                mahasiswa.jenisDisabilitas.length > 0
                    ? mahasiswa.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: mahasiswa.kategoriDisabilitas.map((k: { kategori: { kategori: string } }) => k.kategori.kategori)
        };
        return res.status(200).json(formatted);
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to fetch mahasiswa', detail });
    }
};

const createMahasiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nama, nim, provinsi, angkatan, jalur_masuk, status, jenjang, gender, asal_sekolah, ipk, fakultas_id, prodi_id, kategori } = req.body;
        if (!Array.isArray(kategori) || kategori.length === 0) {
            return res.status(400).json({ message: "Kategori disabilitas wajib diisi array" });
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
            }
        });
        const kategoriDB = await prisma.kategoriDisabilitas.findMany({
            where: {
                kategori: { in: kategori }
            },
            include: { jenisDisabilitas: true }
        });

        if (kategoriDB.length !== kategori.length) {
            return res.status(400).json({ message: "Ada kategori yang tidak ditemukan" });
        }

        for (const k of kategoriDB) {
            await prisma.mahasiswaKategoriDisabilitas.create({
                data: {
                    mahasiswa_id: mahasiswa.id,
                    kategori_id: k.id
                }
            });
        }

        let jenisToInsert;

        if (kategoriDB.length === 1) {
            jenisToInsert = kategoriDB[0].jenisDisabilitas.id;
        } else {
            const jenisGanda = await prisma.jenisDisabilitas.findFirst({
                where: { jenis: "Ganda" }
            });
            jenisToInsert = jenisGanda.id;
        }

        await prisma.mahasiswaJenisDisabilitas.create({
            data: {
                mahasiswa_id: mahasiswa.id,
                jenis_id: jenisToInsert
            }
        });

        res.status(201).json({
            message: "Mahasiswa berhasil dibuat",
            mahasiswa: mahasiswa
        });
    } catch (error) {
        next(error);
    }
};

const updateMahasiswa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const {
            nama,
            nim,
            provinsi,
            angkatan,
            jalur_masuk,
            status,
            jenjang,
            gender,
            asal_sekolah,
            ipk,
            fakultas_id,
            prodi_id,
            kategori
        } = req.body;

        const existingMahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) }
        });

        if (!existingMahasiswa) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        if (nim && nim !== existingMahasiswa.nim) {
            const nimConflict = await prisma.mahasiswa.findFirst({
                where: {
                    nim,
                    NOT: { id },
                }
            });

            if (nimConflict) {
                return res.status(400).json({
                    message: "NIM sudah digunakan oleh mahasiswa lain"
                });
            }
        }

        const nextFakultasId = fakultas_id !== undefined && fakultas_id !== null && String(fakultas_id).trim() !== ""
            ? Number(fakultas_id)
            : existingMahasiswa.fakultas_id;
        const nextProdiId = prodi_id !== undefined && prodi_id !== null && String(prodi_id).trim() !== ""
            ? Number(prodi_id)
            : existingMahasiswa.prodi_id;
        const nextAngkatan = angkatan !== undefined && angkatan !== null && String(angkatan).trim() !== ""
            ? Number(angkatan)
            : existingMahasiswa.angkatan;
        const nextIpk = ipk !== undefined && ipk !== null && String(ipk).trim() !== ""
            ? Number(ipk)
            : existingMahasiswa.ipk;

        const kategoriList = Array.isArray(kategori) ? kategori : null;
        let kategoriDB: Array<{ id: number; jenisDisabilitas?: { id: number | null } | null }> | null = null;

        if (kategoriList) {
            const foundKategori = await prisma.kategoriDisabilitas.findMany({
                where: { kategori: { in: kategoriList } },
                include: { jenisDisabilitas: true },
            });

            if (foundKategori.length !== kategoriList.length) {
                return res.status(400).json({ message: "Ada kategori tidak valid" });
            }

            kategoriDB = foundKategori;
        }

        const result = await prisma.$transaction(async (tx: any) => {
            const updated = await tx.mahasiswa.update({
                where: { id },
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
                await tx.mahasiswaKategoriDisabilitas.deleteMany({
                    where: { mahasiswa_id: id },
                });

                for (const k of kategoriDB) {
                    await tx.mahasiswaKategoriDisabilitas.create({
                        data: {
                            mahasiswa_id: updated.id,
                            kategori_id: k.id,
                        },
                    });
                }

                let jenisToInsert: number | undefined;

                if (kategoriDB.length === 1) {
                    jenisToInsert = kategoriDB[0].jenisDisabilitas?.id ?? undefined;
                } else {
                    const jenisGanda = await tx.jenisDisabilitas.findFirst({
                        where: { jenis: "Ganda" },
                        select: { id: true },
                    });
                    jenisToInsert = jenisGanda?.id;
                }

                await tx.mahasiswaJenisDisabilitas.deleteMany({
                    where: { mahasiswa_id: updated.id },
                });

                if (jenisToInsert) {
                    await tx.mahasiswaJenisDisabilitas.create({
                        data: {
                            mahasiswa_id: updated.id,
                            jenis_id: jenisToInsert,
                        },
                    });
                }
            }

            return tx.mahasiswa.findUnique({
                where: { id: updated.id },
                include: {
                    fakultas: { select: { nama: true } },
                    prodi: { select: { nama: true } },
                    kategoriDisabilitas: {
                        include: { kategori: { select: { kategori: true } } },
                    },
                    jenisDisabilitas: {
                        include: { jenis: { select: { jenis: true } } },
                    },
                },
            });
        });

        if (!result) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        const formatted = {
            id: result.id,
            nama: result.nama,
            nim: result.nim,
            provinsi: result.provinsi,
            angkatan: result.angkatan,
            jalur_masuk: result.jalur_masuk,
            status: result.status,
            jenjang: result.jenjang,
            gender: result.gender,
            asal_sekolah: result.asal_sekolah,
            ipk: result.ipk,
            fakultas: result.fakultas?.nama || null,
            prodi: result.prodi?.nama || null,
            jenisDisabilitas:
                result.jenisDisabilitas.length > 0
                    ? result.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: result.kategoriDisabilitas.map(
                (k: { kategori: { kategori: string } }) => k.kategori.kategori
            )
        };
        res.json({
            message: "Mahasiswa berhasil diperbarui",
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};

const deleteMahasiswa = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) },
        });
        if (!mahasiswa) {
            return res.status(404).json({ error: "Mahasiswa not found" });
        }
        await prisma.mahasiswaKategoriDisabilitas.deleteMany({
            where: { mahasiswa_id: Number(id) }
        });
        await prisma.mahasiswaJenisDisabilitas.deleteMany({
            where: { mahasiswa_id: Number(id) }
        });
        await prisma.mahasiswa.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Mahasiswa deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete mahasiswa" });
    }
};

const getAllFakultas = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.fakultas.findMany({
            orderBy: { nama: "asc" }
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat fakultas" });
    }
};

const getProdiByFakultas = async (req: Request, res: Response) => {
    try {
        const fakultasId = Number(req.query.fakultasId);

        if (!fakultasId) {
            return res.status(400).json({ message: "fakultasId diperlukan" });
        }

        const data = await prisma.prodi.findMany({
            where: { fakultas_id: fakultasId },
            orderBy: { nama: "asc" }
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat prodi" });
    }
};

const getAllKategoriDisabilitas = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.kategoriDisabilitas.findMany({
            orderBy: { kategori: "asc" },
            select: { id: true, kategori: true }
        });
        res.json(data.map((k: { kategori: string }) => k.kategori));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat kategori disabilitas" });
    }
};

const getAllKategoriDisabilitasAdmin = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.kategoriDisabilitas.findMany({
            orderBy: { kategori: "asc" },
            select: {
                id: true,
                kategori: true,
                jenis_disabilitas_id: true,
                jenisDisabilitas: { select: { id: true, jenis: true } },
            },
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat kategori disabilitas" });
    }
};

const getAllJenisDisabilitas = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.jenisDisabilitas.findMany({
            orderBy: { jenis: "asc" },
            select: { id: true, jenis: true }
        });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat jenis disabilitas" });
    }
};

const createKategoriDisabilitas = async (req: Request, res: Response) => {
    try {
        const { kategori, jenis_id } = req.body;

        if (!kategori || !jenis_id) {
            return res.status(400).json({ message: "kategori dan jenis_id wajib diisi" });
        }

        const jenis = await prisma.jenisDisabilitas.findUnique({ where: { id: Number(jenis_id) } });
        if (!jenis) {
            return res.status(404).json({ message: "Jenis disabilitas tidak ditemukan" });
        }

        const existing = await prisma.kategoriDisabilitas.findFirst({ where: { kategori } });
        if (existing) {
            return res.status(409).json({ message: "Kategori sudah ada" });
        }

        const created = await prisma.kategoriDisabilitas.create({
            data: {
                kategori,
                jenis_disabilitas_id: Number(jenis_id)
            },
            select: { id: true, kategori: true }
        });

        res.status(201).json({ message: "Kategori disabilitas ditambahkan", kategori: created });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan kategori disabilitas" });
    }
};

const recalculateMahasiswaJenis = async (mahasiswaId: number | string) => {
    const remaining = await prisma.mahasiswaKategoriDisabilitas.findMany({
        where: { mahasiswa_id: Number(mahasiswaId) },
        include: {
            kategori: {
                select: {
                    id: true,
                    jenis_disabilitas_id: true,
                },
            },
        },
    });

    await prisma.mahasiswaJenisDisabilitas.deleteMany({
        where: { mahasiswa_id: Number(mahasiswaId) },
    });

    if (remaining.length === 0) {
        return;
    }

    let jenisToInsert;
    if (remaining.length === 1) {
        jenisToInsert = remaining[0].kategori.jenis_disabilitas_id;
    } else {
        const jenisGanda = await prisma.jenisDisabilitas.findFirst({
            where: { jenis: "Ganda" },
            select: { id: true },
        });
        jenisToInsert = jenisGanda?.id;
    }

    if (jenisToInsert) {
        await prisma.mahasiswaJenisDisabilitas.create({
            data: {
                mahasiswa_id: Number(mahasiswaId),
                jenis_id: Number(jenisToInsert),
            },
        });
    }
};

const updateKategoriDisabilitas = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { kategori, jenis_id } = req.body;

        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }
        if (!kategori || !String(kategori).trim()) {
            return res.status(400).json({ message: "Nama kategori wajib diisi" });
        }
        if (!jenis_id || Number.isNaN(Number(jenis_id))) {
            return res.status(400).json({ message: "jenis_id wajib diisi" });
        }

        const existing = await prisma.kategoriDisabilitas.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const jenis = await prisma.jenisDisabilitas.findUnique({ where: { id: Number(jenis_id) } });
        if (!jenis) {
            return res.status(404).json({ message: "Jenis disabilitas tidak ditemukan" });
        }

        const duplicate = await prisma.kategoriDisabilitas.findFirst({
            where: {
                kategori: String(kategori).trim(),
                NOT: { id },
            },
        });
        if (duplicate) {
            return res.status(409).json({ message: "Nama kategori sudah digunakan" });
        }

        const updated = await prisma.kategoriDisabilitas.update({
            where: { id },
            data: {
                kategori: String(kategori).trim(),
                jenis_disabilitas_id: Number(jenis_id),
            },
            select: {
                id: true,
                kategori: true,
                jenis_disabilitas_id: true,
            },
        });

        const impactedMahasiswa = await prisma.mahasiswaKategoriDisabilitas.findMany({
            where: { kategori_id: id },
            select: { mahasiswa_id: true },
            distinct: ["mahasiswa_id"],
        });

        for (const row of impactedMahasiswa) {
            await recalculateMahasiswaJenis(row.mahasiswa_id);
        }

        res.json({ message: "Kategori disabilitas berhasil diperbarui", kategori: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memperbarui kategori disabilitas" });
    }
};

const deleteKategoriDisabilitas = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }

        const existing = await prisma.kategoriDisabilitas.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const usedCount = await prisma.mahasiswaKategoriDisabilitas.count({
            where: { kategori_id: id },
        });
        if (usedCount > 0) {
            return res.status(409).json({
                message: "Kategori disabilitas sedang digunakan dan tidak bisa dihapus",
                usedCount,
            });
        }

        await prisma.kategoriDisabilitas.delete({ where: { id } });

        res.json({ message: "Kategori disabilitas berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus kategori disabilitas" });
    }
};

const getAllAngkatan = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.mahasiswa.findMany({
            select: { angkatan: true },
            distinct: ['angkatan'],
            orderBy: { angkatan: 'desc' }
        });
        const years = data.map((m: { angkatan: number | null }) => m.angkatan);
        res.json(years);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat daftar angkatan" });
    }
};

// const addFakultas = async (req, res) => {
//     try {
//         const { nama } = req.body;
//         if (!nama) {
//         return res.status(400).json({ message: "Nama fakultas diperlukan" });
//         }

//         const fakultas = await prisma.fakultas.create({
//         data: { nama },
//         });

//         res.status(201).json({ message: "Fakultas berhasil ditambahkan", fakultas });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Gagal menambahkan fakultas" });
//     }
// };

// const addProdi = async (req, res) => {
//     try {
//         const { nama, fakultas_id } = req.body;

//         if (!nama || !fakultas_id) {
//         return res.status(400).json({ message: "Nama prodi dan fakultas_id diperlukan" });
//         }

//         const fakultas = await prisma.fakultas.findUnique({
//         where: { id: Number(fakultas_id) },
//         });

//         if (!fakultas) {
//         return res.status(404).json({ message: "Fakultas tidak ditemukan" });
//         }

//         const prodi = await prisma.prodi.create({
//         data: {
//             nama,
//             fakultas_id: Number(fakultas_id),
//         },
//         });

//         res.status(201).json({ message: "Prodi berhasil ditambahkan", prodi });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Gagal menambahkan prodi" });
//     }
// };

const addFakultasProdi = async (req: Request, res: Response) => {
    try {
        const fakultasList = req.body as Array<{ nama: string; prodi: string[] }>;

        if (!Array.isArray(fakultasList)) {
        return res.status(400).json({ message: "Body harus berupa array fakultas" });
        }

        for (const fakultas of fakultasList) {
        const createdFakultas = await prisma.fakultas.create({
            data: {
            nama: fakultas.nama,
            prodi: {
                create: fakultas.prodi.map((p: string) => ({ nama: p })),
            },
            },
        });
        }

        res.status(201).json({ message: "Fakultas dan prodi berhasil ditambahkan" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan fakultas dan prodi" });
    }
};

module.exports = {
    getAllMahasiswa,
    getMahasiswaById,
    createMahasiswa,
    updateMahasiswa,
    deleteMahasiswa,
    getAllFakultas,
    getProdiByFakultas,
    getAllKategoriDisabilitas,
    getAllKategoriDisabilitasAdmin,
    getAllJenisDisabilitas,
    createKategoriDisabilitas,
    updateKategoriDisabilitas,
    deleteKategoriDisabilitas,
    getAllAngkatan,
    // addFakultas,
    // addProdi
    addFakultasProdi
};