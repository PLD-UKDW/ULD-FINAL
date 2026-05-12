import { callExpressHandler } from "@/lib/nextExpressAdapter";

export const runtime = "nodejs";

const loginService = require("@/lib/services/login") as {
  login: (req: unknown, res: unknown) => unknown;
};

export async function POST(request: Request) {
  try {
    let body: any = undefined;
    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    } catch {
      // body parse error will be handled by controller
    }
    return callExpressHandler(loginService.login, { request, body });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Server error";
    return Response.json({ message }, { status: 500 });
  }
}
