import { requireAdmin } from "@/lib/requireAdmin";

const prisma = require("@/lib/utils/prisma") as any;

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const data = await prisma.kategoriDisabilitas.findMany({
      orderBy: { kategori: "asc" },
      select: { id: true, kategori: true },
    });
    return Response.json(data.map((k: { kategori: string }) => k.kategori));
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    let body: any = undefined;
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch {
      // body parse error will be handled by controller
    }
    const { kategori, jenis_id } = body ?? {};

    if (!kategori || !jenis_id) {
      return Response.json({ message: "kategori dan jenis_id wajib diisi" }, { status: 400 });
    }

    const jenis = await prisma.jenisDisabilitas.findUnique({ where: { id: Number(jenis_id) } });
    if (!jenis) {
      return Response.json({ message: "Jenis disabilitas tidak ditemukan" }, { status: 404 });
    }

    const existing = await prisma.kategoriDisabilitas.findFirst({ where: { kategori } });
    if (existing) {
      return Response.json({ message: "Kategori sudah ada" }, { status: 409 });
    }

    const created = await prisma.kategoriDisabilitas.create({
      data: { kategori, jenis_disabilitas_id: Number(jenis_id) },
      select: { id: true, kategori: true },
    });

    return Response.json({ message: "Kategori disabilitas ditambahkan", kategori: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ message }, { status: 500 });
  }
}