import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { createRequireAdmin, enforceBrowserOrigin } from "./auth.js";
import { config } from "./config.js";
import { errorHandler, notFound } from "./errors.js";
import { AdminUser } from "./models/AdminUser.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { createAdminRouter } from "./routes/admin.js";
import { createAuthRouter } from "./routes/auth.js";
import { createCatalogueRouter } from "./routes/catalogue.js";
import { cloudinaryStorage } from "./storage/cloudinary.js";

export function createApp({
  ProductModel = Product,
  CategoryModel = Category,
  AdminUserModel = AdminUser,
  storage = cloudinaryStorage,
  jwtSecret = config.JWT_SECRET,
  cookieName = config.cookieName,
  cookieSecure = config.cookieSecure,
  cookieMaxAgeMs = config.cookieMaxAgeMs,
  clientOrigin = config.CLIENT_ORIGIN,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use("/api", enforceBrowserOrigin(clientOrigin));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/auth", createAuthRouter({
    AdminUser: AdminUserModel,
    jwtSecret,
    cookieName,
    cookieSecure,
    cookieMaxAgeMs,
  }));
  app.use("/api", createCatalogueRouter({ Product: ProductModel, Category: CategoryModel }));
  const requireAdmin = createRequireAdmin({ AdminUser: AdminUserModel, jwtSecret, cookieName });
  app.use("/api/admin", createAdminRouter({
    Product: ProductModel,
    Category: CategoryModel,
    requireAdmin,
    storage,
  }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
