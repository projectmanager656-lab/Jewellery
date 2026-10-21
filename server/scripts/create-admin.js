import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { assertRuntimeConfig } from "../config.js";
import { connectDatabase } from "../db.js";
import { AdminUser } from "../models/AdminUser.js";

async function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password can be entered without echo.");
  }
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  let value = "";
  try {
    return await new Promise((resolve, reject) => {
      const onData = (chunk) => {
        const character = chunk.toString("utf8");
        if (character === "\u0003") {
          stdin.off("data", onData);
          reject(new Error("Cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
          return;
        }
        value += character;
      };
      stdin.on("data", onData);
    });
  } finally {
    stdin.setRawMode(false);
  }
}

let prompt;
try {
  assertRuntimeConfig();
  prompt = readline.createInterface({ input: stdin, output: stdout });
  const email = (await prompt.question("Admin email: ")).trim().toLowerCase();
  prompt.close();
  const password = await readHidden("Password (minimum 12 characters): ");
  const confirmation = await readHidden("Confirm password: ");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 12) throw new Error("Password must be at least 12 characters.");
  if (password !== confirmation) throw new Error("Passwords do not match.");

  await connectDatabase();
  if (await AdminUser.exists({ email })) throw new Error("An admin account with this email already exists; no changes were made.");
  const admin = new AdminUser({ email, role: "admin", isActive: true });
  await admin.setPassword(password);
  await admin.save();
  console.log("Admin account created. The password was not displayed or stored in a file.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Could not create admin account.");
  process.exitCode = 1;
} finally {
  prompt?.close();
  const mongoose = await import("mongoose");
  if (mongoose.default.connection.readyState) await mongoose.default.disconnect();
}
