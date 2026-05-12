import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "./utils/prisma";

export type AuthUser = {
  id?: string;
  userId?: string;
  role?: string;
  name?: string;
  registrationNumber?: string;
  username?: string;
  testId?: string;
};

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

// function decodeJwtPayload(token: string) {
//   const [, payload] = token.split(".");
//   if (!payload) return null;

//   try {
//     return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
//   } catch {
//     return null;
//   }
// }

// export async function auth(request: Request): Promise<AuthUser | null> {
//   const authHeader = request.headers.get("authorization");
//   const cookieToken = getCookieValue(request, "authToken");
//   const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;

//   if (!token) {
//     return null;
//   }

//   const payload = decodeJwtPayload(token) ?? {};
//   const role = (payload.role as string | undefined) ?? getCookieValue(request, "role") ?? undefined;

//   return {
//     id: (payload.userId as string | undefined) ?? (payload.id as string | undefined),
//     userId: (payload.userId as string | undefined) ?? (payload.id as string | undefined),
//     role,
//     name: payload.name as string | undefined,
//     registrationNumber: payload.registrationNumber as string | undefined,
//     username: payload.username as string | undefined,
//     testId: payload.testId as string | undefined,
//   };
// }

// export const auth = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId?: string };
//     const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     (req as any).user = user;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

export const auth = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId?: string };
    if (!decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const user = await prisma.user.findUnique({ where: { id: parseInt(decoded.userId, 10) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export function isLoggedIn() {
  if (typeof window === "undefined") return false;

  return Boolean(
    document.cookie
      .split(";")
      .map((part) => part.trim())
      .some((part) => part.startsWith("authToken=")),
  );
}
