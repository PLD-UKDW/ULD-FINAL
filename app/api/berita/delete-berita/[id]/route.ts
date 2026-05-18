import { callExpressHandler } from "@/lib/nextExpressAdapter";
import { requireAdmin } from "@/lib/requireAdmin";

const beritaControllerModule = require("@/lib/services/beritaController") as {
  deleteBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  default?: {
    deleteBerita: (req: unknown, res: unknown, next?: unknown) => unknown;
  };
};
const beritaController = beritaControllerModule.default ?? beritaControllerModule;

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const result = await callExpressHandler(beritaController.deleteBerita, { request, params: await params });
    
    if (result instanceof Response) {
      return result;
    }
    
    return Response.json({ message: "Internal server error" }, { status: 500 });
  } catch (error) {
    console.error("[DELETE /api/berita/delete-berita] Error:", error);
    
    if (error instanceof Response) {
      return error;
    }
    
    // Safely extract error message
    let message = "Internal server error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      // Try to extract message from object
      const errorObj = error as Record<string, any>;
      message = errorObj.message || errorObj.msg || String(error);
    }
    
    return Response.json({ message }, { status: 500 });
  }
}