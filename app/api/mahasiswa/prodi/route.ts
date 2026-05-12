import { callExpressHandler } from "@/lib/nextExpressAdapter";

const mahasiswaController = require("@/lib/services/mahasiswaController") as {
  getProdiByFakultas: (req: unknown, res: unknown, next?: unknown) => unknown;
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return callExpressHandler(mahasiswaController.getProdiByFakultas, { request });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}
