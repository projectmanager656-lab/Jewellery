import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sortOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ sortOrder: 1, name: 1 });

export const Category = mongoose.model("Category", categorySchema);
