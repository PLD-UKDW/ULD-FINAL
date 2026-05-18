import { callExpressHandler } from "@/lib/nextExpressAdapter";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  getBeritaPublic: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    getBeritaPublic: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(beritaController.getBeritaPublic, { request });
}