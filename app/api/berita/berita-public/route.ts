import { callExpressHandler } from "@/lib/nextExpressAdapter";

const beritaController = require("@/lib/services/beritaController") as {
  getBeritaPublic: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(beritaController.getBeritaPublic, { request });
}