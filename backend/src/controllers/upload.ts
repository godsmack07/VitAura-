import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "../generated/prisma";
import { UploadApiResponse } from "cloudinary";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const prisma = new PrismaClient();

router.post(
  "/",
  upload.array("images"),

  async (req: express.Request, res: express.Response): Promise<void> => {
    const images = req.files as Express.Multer.File[];

    try {
      const uploadedImages = images.map((image) => {
        return new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", allowed_formats: ["png", "jpg", "gif"] },
            (error, result) => {
              if (error || !result) {
                reject(error);
            } else {
                resolve(result);
              }
            }
          );
          stream.end(image.buffer);
        });
      });

      const results = await Promise.all(uploadedImages);

      type eachUpload = {
        id: number;
        createdAt: Date;
        url: string;
        publicId: string;
      };

      let dbResponse;
      const uploads: eachUpload[] = [];
      for (const result of results) {
        //@ts-ignore
        dbResponse = await prisma.image.create({
          data: {
            publicId: result.public_id,
            url: result.secure_url,
          },
        });
        uploads.push({
          id: dbResponse.id,
          createdAt: dbResponse.createdAt,
          publicId: dbResponse.publicId,
          url: dbResponse.url,
        });
      }

      res.status(200).json({
        success: true,
        message: "images uploaded succesffuly",
        uploads,
      });
    } catch (error) {
      console.error("Upload error", error);
      res.status(500).json({
        success: false,
        message: "Upload error, invliad upload type",
      });
    }
  }
);

export default router;