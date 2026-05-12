import { callExpressHandler } from "@/lib/nextExpressAdapter";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  getAllAngkatan: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(mahasiswaController.getAllAngkatan, { request });
}