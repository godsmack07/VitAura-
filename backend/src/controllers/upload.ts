import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "../generated/prisma/client";
import { UploadApiResponse } from "cloudinary";
import getIssueAnalysis from "../helpers/gemini_judge";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const prisma = new PrismaClient();


interface IGenAi{
  issue:  string,
  location : string,
  description : string,
  mobileNo : string,

}

router.post(
  "/",
  upload.array("images"),

  async (req: express.Request, res: express.Response): Promise<void> => {
    const images = req.files as Express.Multer.File[];

    const {
      issue ,
      location ,
      description ,
      mobileNo,
    } = req.body as IGenAi;
    

    if (!issue || !location || !mobileNo) {
      res.status(400).json({
        success: false,
        message: "missing required field",
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

      // all the images that are back from cloudinary
      const imageUrls = results.map((result) => result.secure_url)
      const imageUrl = imageUrls[0]
      const analysis = await getIssueAnalysis(imageUrls[0],issue,description)

      const dbresponse = await prisma.issue.create({
      data: {
        image: imageUrl,
        issue : issue,
        location : location,
        description : description,
        mobileNo : mobileNo,

        severity : analysis.severity,
        priority : analysis.priority,
        corporation : analysis.corporation,
        updatedAt: new Date(),
      } ,
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
