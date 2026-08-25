import multer, { StorageEngine, FileFilterCallback } from "multer";
import { existsSync, mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { Request } from "express";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileTypeFromFile } from "file-type";
import { BadRequestException } from "../response/error.response";

export const fileValidation = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
};

export const uploadDir = "./upload";

export const localFileUpload = ({
  validation = fileValidation.image,
  maxSizeMB = 5,
  folder = "general",
}: {
  validation?: string[];
  maxSizeMB?: number;
  folder?: string;
} = {}) => {
  const storage: StorageEngine = multer.diskStorage({
    destination(req: Request, file, callback) {
      const distPth = resolve(uploadDir, folder);

      if (!existsSync(distPth)) {
        mkdirSync(distPth, { recursive: true });
      }

      callback(null, distPth);
    },

    filename(req, file, callback) {
      const ext = file.originalname.split(".").pop();

      callback(null, `${Date.now()}_${randomUUID()}.${ext}`);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (
      !validation.includes(file.mimetype) &&
      file.mimetype !== "application/octet-stream"
    ) {
      return cb(
        new BadRequestException(`Invalid File Format ${file.mimetype}`),
      );
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};

export const magicNumberValidation = async ({
  filePath,
  validation,
}: {
  filePath: string;
  validation: string[];
}) => {
  const fileType = await fileTypeFromFile(filePath);

  if (!fileType) {
    await unlink(filePath);

    throw new BadRequestException("Unable to determine file type");
  }

  if (!validation.includes(fileType.mime)) {
    await unlink(filePath);

    throw new BadRequestException(`Invalid File Format ${fileType.mime}`);
  }

  return fileType;
};
