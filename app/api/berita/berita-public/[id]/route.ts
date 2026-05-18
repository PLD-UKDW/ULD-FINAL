import { callExpressHandler } from "@/lib/nextExpressAdapter";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  getBeritaByIdPublic: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    getBeritaByIdPublic: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return callExpressHandler(beritaController.getBeritaByIdPublic, { request, params: await params });
}