import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import type { AuthUser } from "../auth";

type RequestWithUser = ExpressRequest & { user?: AuthUser | Record<string, any> };

export function isAdmin(req: RequestWithUser, res: ExpressResponse, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if ((req.user as AuthUser).role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden, admin only" });
    }

    next();
}