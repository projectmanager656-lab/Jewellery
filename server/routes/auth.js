import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { createRequireAdmin } from "../auth.js";
import { HttpError } from "../errors.js";
import { loginSchema } from "../validation.js";

export function createAuthRouter({ AdminUser, jwtSecret, cookieName, cookieSecure, cookieMaxAgeMs }) {
  const router = Router();
  const requireAdmin = createRequireAdmin({ AdminUser, jwtSecret, cookieName });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Try again later." },
  });
  const cookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/api",
  };

  router.post("/login", loginLimiter, async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) throw new HttpError(400, "Enter a valid email and password.");
      const email = parsed.data.email.toLowerCase();
      const admin = await AdminUser.findOne({ email, isActive: true }).select("+passwordHash");
      if (!admin || !(await admin.verifyPassword(parsed.data.password))) {
        throw new HttpError(401, "Email or password is incorrect.");
      }
      const token = jwt.sign({ role: "admin" }, jwtSecret, {
        subject: admin.id,
        expiresIn: "8h",
        algorithm: "HS256",
      });
      admin.lastLoginAt = new Date();
      await admin.save();
      res.cookie(cookieName, token, { ...cookieOptions, maxAge: cookieMaxAgeMs });
      res.json({ admin: admin.toSafeJSON() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/session", requireAdmin, (req, res) => {
    res.json({ admin: req.admin.toSafeJSON() });
  });

  router.post("/logout", (req, res) => {
    res.clearCookie(cookieName, cookieOptions);
    res.status(204).end();
  });

  return router;
}
