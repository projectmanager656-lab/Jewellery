import jwt from "jsonwebtoken";
import { HttpError } from "./errors.js";

export function createRequireAdmin({ AdminUser, jwtSecret, cookieName }) {
  return async function requireAdmin(req, _res, next) {
    let claims;
    try {
      const token = req.cookies?.[cookieName];
      if (!token) throw new HttpError(401, "Admin sign-in required.");
      claims = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      if (typeof claims !== "object" || typeof claims.sub !== "string") {
        throw new HttpError(401, "Invalid admin session.");
      }
    } catch (error) {
      if (error instanceof HttpError) return next(error);
      return next(new HttpError(401, "Admin session is invalid or expired."));
    }
    try {
      const admin = await AdminUser.findOne({ _id: claims.sub, isActive: true, role: "admin" });
      if (!admin) throw new HttpError(401, "Admin session is no longer valid.");
      req.admin = admin;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function enforceBrowserOrigin(clientOrigin) {
  return function checkOrigin(req, _res, next) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (req.get("origin") !== clientOrigin) {
      return next(new HttpError(403, "Request origin is not allowed."));
    }
    next();
  };
}
