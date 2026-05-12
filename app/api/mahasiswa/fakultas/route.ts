import { callExpressHandler } from "@/lib/nextExpressAdapter";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  getAllFakultas: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(mahasiswaController.getAllFakultas, { request });
}