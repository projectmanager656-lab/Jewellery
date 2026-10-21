import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

if (config.cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from([buffer]).pipe(upload);
  });
}

export const cloudinaryStorage = {
  configured: config.cloudinaryConfigured,
  async upload(file, productId) {
    if (!config.cloudinaryConfigured) throw new Error("Cloudinary image storage is not configured.");
    const result = await uploadBuffer(file.buffer, {
      folder: `shree-jewellers/products/${productId}`,
      resource_type: "image",
      type: "authenticated",
      overwrite: false,
      unique_filename: true,
    });
    return {
      url: cloudinary.url(result.public_id, {
        type: "authenticated",
        sign_url: true,
        secure: true,
        format: result.format,
      }),
      storageKey: result.public_id,
    };
  },
  async remove(storageKey) {
    if (!config.cloudinaryConfigured) throw new Error("Cloudinary image storage is not configured.");
    const result = await cloudinary.uploader.destroy(storageKey, { resource_type: "image", type: "authenticated" });
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Cloudinary could not remove the image.");
    }
  },
};
