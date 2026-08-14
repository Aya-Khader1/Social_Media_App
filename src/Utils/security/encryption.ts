import crypto from "node:crypto";
import { env } from "./../../config/config";

const ENCRYPTION_SECRET_KEY: Buffer = Buffer.from(
  env.ENCRYPTION_SECRET_KEY,
  "utf-8",
);
const IV_LENGTH = 16;
const iv: Buffer = crypto.randomBytes(IV_LENGTH);

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv,
  );

  let encryptedData: string = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};
