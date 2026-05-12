import { auth, type AuthUser } from "@/lib/middleware/auth";

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await auth(request);

  const role = (user?.role ?? "").toString().trim().toUpperCase();

  if (!user || role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
