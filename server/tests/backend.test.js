import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import { Types } from "mongoose";
import { createApp } from "../app.js";
import { AdminUser } from "../models/AdminUser.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const jwtSecret = "local-test-secret-that-is-at-least-32-characters-long";
const cookieName = "sj_admin_session";
const origin = "http://localhost:5173";

function queryResult(value) {
  return {
    populate() { return this; },
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    select() { return this; },
    lean: async () => value,
  };
}

function fixtureProduct() {
  return {
    _id: new Types.ObjectId("68f7a8000000000000000001"),
    productCode: "SHJ-001",
    name: "Test Pendant",
    description: "A test description",
    categoryId: { _id: new Types.ObjectId("68f7a8000000000000000002"), slug: "Pendants", name: "Pendants" },
    price: 12500,
    currency: "INR",
    material: "22K yellow gold",
    purity: "22K",
    weight: "2 g",
    gemstone: "None",
    availability: true,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: false,
    images: [],
  };
}

test("Mongoose models retain the catalogue fields and validate required data", async () => {
  const category = new Category({ slug: "Pendants", name: "Pendants" });
  await category.validate();

  const product = new Product({
    categoryId: new Types.ObjectId(),
    productCode: "SHJ-001",
    name: "Test Pendant",
    price: 12500,
    currency: "INR",
    material: "22K yellow gold",
    purity: "22K",
    weight: "2 g",
    gemstone: "None",
    availability: true,
    isPublished: true,
    isFeatured: true,
    isNewArrival: false,
    isBestseller: false,
    images: [{ url: "https://images.example/item.jpg", storageKey: "products/item" }],
  });
  await product.validate();
  assert.equal(product.isFeatured, true);
  assert.equal(product.images.length, 1);
  assert.equal(product.categoryId instanceof Types.ObjectId, true);
});

test("admin passwords are hashed and verified without a database", async () => {
  const admin = new AdminUser({ email: "staff@example.com" });
  await admin.setPassword("a-long-test-password");
  assert.notEqual(admin.passwordHash, "a-long-test-password");
  assert.equal(await admin.verifyPassword("a-long-test-password"), true);
  assert.equal(await admin.verifyPassword("wrong-password"), false);
  assert.deepEqual(admin.toSafeJSON(), { id: admin.id, email: "staff@example.com", role: "admin" });
});

test("public product API applies published, search, category, price, and sort filters", async () => {
  let receivedFilter;
  const product = fixtureProduct();
  const app = createApp({
    ProductModel: {
      countDocuments: async (filter) => { receivedFilter = filter; return 1; },
      find: (filter) => { receivedFilter = filter; return queryResult([product]); },
    },
    CategoryModel: {
      findOne: () => ({ select: () => ({ lean: async () => ({ _id: product.categoryId._id }) }) }),
      find: () => queryResult([]),
    },
    AdminUserModel: { findOne: async () => null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });

  const response = await request(app)
    .get("/api/products?q=pendant&category=Pendants&minPrice=10000&maxPrice=15000&sort=featured")
    .expect(200);

  assert.equal(receivedFilter.isPublished, true);
  assert.equal(receivedFilter.categoryId.toString(), product.categoryId._id.toString());
  assert.equal(receivedFilter.price.$gte, 10000);
  assert.equal(receivedFilter.price.$lte, 15000);
  assert.ok(receivedFilter.$or.length >= 4);
  assert.equal(response.body.items[0].code, "SHJ-001");
  assert.equal(response.body.items[0].category, "Pendants");
});

test("public category API returns stable category slugs and display names", async () => {
  const app = createApp({
    ProductModel: {},
    CategoryModel: {
      find: () => queryResult([
        { _id: "68f7a8000000000000000002", slug: "earrings", name: "Earrings", sortOrder: 2 },
        { _id: "68f7a8000000000000000004", slug: "Pendants", name: "Pendants", sortOrder: 1 },
      ]),
    },
    AdminUserModel: { findOne: async () => null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });

  const response = await request(app).get("/api/categories").expect(200);
  assert.deepEqual(response.body.items.map(({ slug, name }) => ({ slug, name })), [
    { slug: "Earrings", name: "Earrings" },
    { slug: "Pendants", name: "Pendants" },
  ]);
});

test("legacy gold filter matches gold material across purity and colour descriptions", async () => {
  let receivedFilter;
  const product = fixtureProduct();
  const app = createApp({
    ProductModel: {
      countDocuments: async (filter) => { receivedFilter = filter; return 1; },
      find: (filter) => { receivedFilter = filter; return queryResult([product]); },
    },
    CategoryModel: {},
    AdminUserModel: { findOne: async () => null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });

  const response = await request(app).get("/api/products?category=gold").expect(200);
  assert.equal(receivedFilter.material.test("18K white gold"), true);
  assert.equal(receivedFilter.isPublished, true);
  assert.equal(response.body.items[0].category, "Pendants");
});

test("price sorting keeps products without prices after priced products", async () => {
  let pipeline;
  const app = createApp({
    ProductModel: {
      countDocuments: async () => 0,
      aggregate: async (stages) => { pipeline = stages; return []; },
    },
    CategoryModel: { collection: { name: "categories" } },
    AdminUserModel: { findOne: async () => null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });

  await request(app).get("/api/products?sort=price-asc").expect(200);
  assert.equal(pipeline[1].$addFields.__priceIsMissing.$cond[1], 1);
  assert.deepEqual(pipeline[2].$sort, { __priceIsMissing: 1, price: 1, createdAt: -1 });
});

test("admin routes reject anonymous and invalid-origin requests", async () => {
  const app = createApp({
    ProductModel: { find: () => queryResult([]) },
    CategoryModel: {},
    AdminUserModel: { findOne: async () => null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });

  await request(app).get("/api/admin/products").expect(401);
  await request(app)
    .post("/api/auth/login")
    .set("Origin", "https://untrusted.example")
    .send({ email: "staff@example.com", password: "test-password" })
    .expect(403);
});

test("a valid session is rechecked against an active admin before CRUD access", async () => {
  const admin = {
    id: "68f7a8000000000000000003",
    email: "staff@example.com",
    role: "admin",
    isActive: true,
    toSafeJSON() { return { id: this.id, email: this.email, role: this.role }; },
  };
  const app = createApp({
    ProductModel: { find: () => queryResult([]) },
    CategoryModel: {},
    AdminUserModel: { findOne: async (filter) => filter.isActive ? admin : null },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });
  const token = jwt.sign({ role: "admin" }, jwtSecret, { subject: admin.id, expiresIn: "1h", algorithm: "HS256" });

  const response = await request(app)
    .get("/api/admin/products")
    .set("Cookie", `${cookieName}=${token}`)
    .expect(200);
  assert.deepEqual(response.body.items, []);
});

test("admin image uploads require a valid session and return the saved image URL", async () => {
  const category = { _id: new Types.ObjectId("68f7a8000000000000000002"), slug: "Earrings", name: "Earrings" };
  const product = {
    _id: new Types.ObjectId("68f7a8000000000000000001"),
    id: "68f7a8000000000000000001",
    productCode: "SHJ-ER-003",
    name: "Sample Earrings",
    description: "",
    categoryId: category,
    material: "gold",
    purity: "22K",
    weight: "2 g",
    gemstone: "None",
    price: 12000,
    availability: true,
    isPublished: false,
    isFeatured: false,
    isNewArrival: false,
    isBestseller: false,
    images: [],
    async save() {},
    async populate() { return this; },
  };
  const admin = { id: "68f7a8000000000000000003", isActive: true, role: "admin" };
  const app = createApp({
    ProductModel: { findById: async () => product },
    CategoryModel: {},
    AdminUserModel: { findOne: async () => admin },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: {
      configured: true,
      upload: async () => ({ url: "https://images.example/signed-photo.jpg", storageKey: "products/signed-photo" }),
      remove: async () => {},
    },
  });
  const token = jwt.sign({ role: "admin" }, jwtSecret, { subject: admin.id, expiresIn: "1h", algorithm: "HS256" });

  const response = await request(app)
    .post(`/api/admin/products/${product.id}/images`)
    .set("Origin", origin)
    .set("Cookie", `${cookieName}=${token}`)
    .attach("images", Buffer.from("not-a-real-image"), { filename: "earrings.jpg", contentType: "image/jpeg" })
    .expect(201);

  assert.equal(response.body.product.image, "https://images.example/signed-photo.jpg");
  assert.equal(product.images.length, 1);
  assert.equal(product.images[0].storageKey, "products/signed-photo");
});

test("admin product API creates, edits, and deletes records", async () => {
  const category = { _id: new Types.ObjectId("68f7a8000000000000000002"), slug: "Pendants", name: "Pendants" };
  const admin = { id: "68f7a8000000000000000003", isActive: true, role: "admin" };
  let current;
  let deleted = false;
  class MockProduct {
    constructor(fields) {
      Object.assign(this, fields);
      this._id = new Types.ObjectId("68f7a8000000000000000001");
      this.id = String(this._id);
      this.images = [];
    }
    async save() { current = this; }
    async populate() { this.categoryId = category; return this; }
    async deleteOne() { deleted = true; }
    toObject() { return { ...this, categoryId: category }; }
  }
  MockProduct.findById = async () => current;
  const app = createApp({
    ProductModel: MockProduct,
    CategoryModel: { exists: async () => true },
    AdminUserModel: { findOne: async () => admin },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });
  const token = jwt.sign({ role: "admin" }, jwtSecret, { subject: admin.id, expiresIn: "1h", algorithm: "HS256" });
  const credentials = (test) => test.set("Origin", origin).set("Cookie", `${cookieName}=${token}`);
  const created = await credentials(request(app).post("/api/admin/products")).send({
    categoryId: String(category._id),
    code: "SHJ-PN-TEST",
    name: "Test pendant",
    description: "A validated draft",
    price: null,
    currency: "INR",
    material: "22K gold",
    purity: "22K",
    weight: "2 g",
    gemstone: "None",
    availability: true,
    isPublished: false,
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
  }).expect(201);
  assert.equal(created.body.product.name, "Test pendant");
  assert.equal(created.body.product.category, "Pendants");

  const updated = await credentials(request(app).patch(`/api/admin/products/${created.body.product.id}`))
    .send({ name: "Updated pendant", isFeatured: true })
    .expect(200);
  assert.equal(updated.body.product.name, "Updated pendant");
  assert.equal(updated.body.product.featured, true);

  await credentials(request(app).delete(`/api/admin/products/${created.body.product.id}`)).expect(204);
  assert.equal(deleted, true);
});

test("admin category API creates, edits, and deletes categories", async () => {
  const admin = { id: "68f7a8000000000000000003", isActive: true, role: "admin" };
  let category = null;
  const CategoryModel = {
    create: async (input) => { category = { ...input, _id: new Types.ObjectId("68f7a8000000000000000002") }; return category; },
    findByIdAndUpdate: async (_id, input) => { category = { ...category, ...input }; return category; },
    findByIdAndDelete: async () => { const removed = category; category = null; return removed; },
  };
  const app = createApp({
    ProductModel: { exists: async () => false },
    CategoryModel,
    AdminUserModel: { findOne: async () => admin },
    jwtSecret,
    cookieName,
    clientOrigin: origin,
    storage: { configured: false },
  });
  const token = jwt.sign({ role: "admin" }, jwtSecret, { subject: admin.id, expiresIn: "1h", algorithm: "HS256" });
  const credentials = (test) => test.set("Origin", origin).set("Cookie", `${cookieName}=${token}`);

  const created = await credentials(request(app).post("/api/admin/categories"))
    .send({ slug: "Earrings", name: "Earrings", sortOrder: 1 }).expect(201);
  assert.equal(created.body.category.slug, "Earrings");
  const updated = await credentials(request(app).patch(`/api/admin/categories/${category._id}`))
    .send({ name: "Fine earrings" }).expect(200);
  assert.equal(updated.body.category.name, "Fine earrings");
  await credentials(request(app).delete(`/api/admin/categories/${category._id}`)).expect(204);
  assert.equal(category, null);
});

test("admin login issues an HttpOnly cookie without returning password data", async () => {
  const admin = {
    id: "68f7a8000000000000000003",
    email: "staff@example.com",
    role: "admin",
    async verifyPassword(password) { return password === "a-long-test-password"; },
    async save() {},
    toSafeJSON() { return { id: this.id, email: this.email, role: this.role }; },
  };
  const app = createApp({
    ProductModel: {},
    CategoryModel: {},
    AdminUserModel: { findOne: () => ({ select: async () => admin }) },
    jwtSecret,
    cookieName,
    cookieMaxAgeMs: 60_000,
    clientOrigin: origin,
    storage: { configured: false },
  });

  const response = await request(app)
    .post("/api/auth/login")
    .set("Origin", origin)
    .send({ email: "staff@example.com", password: "a-long-test-password" })
    .expect(200);
  assert.deepEqual(response.body.admin, {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
  assert.equal(JSON.stringify(response.body).includes("password"), false);
  assert.match(response.headers["set-cookie"][0], /HttpOnly/i);
  assert.match(response.headers["set-cookie"][0], /SameSite=Lax/i);
});
