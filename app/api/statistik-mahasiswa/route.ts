import { callExpressHandler } from "@/lib/nextExpressAdapter";

const statsController = require("@/lib/services/statsFiltering") as {
  filterMahasiswa: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(statsController.filterMahasiswa, { request });
}
