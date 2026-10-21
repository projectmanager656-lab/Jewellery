import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
    altText: { type: String, default: "", maxlength: 240 },
    displayOrder: { type: Number, default: 0, min: 0 },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    productCode: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, default: "", maxlength: 5000 },
    price: { type: Number, default: null, min: 0 },
    currency: { type: String, default: "INR", trim: true, uppercase: true, maxlength: 3 },
    material: { type: String, default: "", trim: true, maxlength: 180 },
    purity: { type: String, default: "", trim: true, maxlength: 100 },
    weight: { type: String, default: "", trim: true, maxlength: 100 },
    gemstone: { type: String, default: "", trim: true, maxlength: 180 },
    availability: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    images: { type: [productImageSchema], default: [] },
  },
  { timestamps: true },
);

productSchema.index({ isPublished: 1, createdAt: -1 });
productSchema.index({ categoryId: 1, isPublished: 1 });
productSchema.index({ name: "text", productCode: "text", material: "text", gemstone: "text" });

export const Product = mongoose.model("Product", productSchema);
