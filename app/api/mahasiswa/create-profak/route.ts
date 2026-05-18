import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const fakultasList = await request.json().catch(() => null);
    if (!Array.isArray(fakultasList)) {
      return Response.json({ message: "Body harus berupa array fakultas" }, { status: 400 });
    }

    for (const fakultas of fakultasList) {
      await prisma.fakultas.create({
        data: {
          nama: fakultas.nama,
          prodi: {
            create: Array.isArray(fakultas.prodi) ? fakultas.prodi.map((p: string) => ({ nama: p })) : [],
          },
        },
      });
    }

    return Response.json({ message: "Fakultas dan prodi berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}