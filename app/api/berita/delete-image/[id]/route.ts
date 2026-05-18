import { callExpressHandler } from '@/lib/nextExpressAdapter';
import { requireAdmin } from '@/lib/requireAdmin';

const beritaControllerModule = require('@/lib/services/beritaController') as any;
const deleteImageFromBerita =
  beritaControllerModule.deleteImageFromBerita ?? beritaControllerModule.default?.deleteImageFromBerita;

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const p = await params;
    const body = await request.json().catch(() => ({}));
    return callExpressHandler(deleteImageFromBerita, { request, params: p, body });
  } catch (error) {
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ message }, { status: 500 });
  }
}
