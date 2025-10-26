import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Corporation, PrismaClient } from "../generated/prisma/client";
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

    const {
      issue,
      location,
      description,
      mobileNo,
      severity,
      priority,
      corporation,
    } = req.body;

    // Basic validation for required fields
    if (!issue || !location || !corporation || !mobileNo) {
      res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
      return;
    }


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
      const imageUrls = results.map((result) => result.secure_url);

      const [latStr, lonStr] = location.split(",");
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (isNaN(lat) || isNaN(lon)) {
          res.status(400).json({
              success: false,
              message: "Invalid location format. Expected 'latitude,longitude'.",
          });
          return;
      }

      const dbresponse = await prisma.issue.create({
        data: {
          issue,
          description,
          mobileNo,
          severity,
          priority,
          corporation: corporation as Corporation,
          images: imageUrls,
          metadata: {
            create: {
              lat,
              lon,
              location,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Issue noted successfully",
        data: dbresponse,
      });
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred.",
      });
    }
  }
);

export default router;