import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { getBeritaPublic } from "@/lib/services/beritaController";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  return callExpressHandler(getBeritaPublic as any, { request });
}