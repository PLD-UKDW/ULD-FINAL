import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { filterMahasiswa } from "@/lib/services/statsFiltering";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return callExpressHandler(filterMahasiswa as any, { request });
}
