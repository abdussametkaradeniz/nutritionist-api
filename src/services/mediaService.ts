import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { AppError } from "../utils/appError";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export class MediaService {
  static async generateUploadUrl(
    fileType: string,
    folder: "chat-images" | "chat-files" | "chat-audio"
  ) {
    // Dosya türü kontrolü
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];

    let allowedTypes: string[] = [];
    switch (folder) {
      case "chat-images":
        allowedTypes = allowedImageTypes;
        break;
      case "chat-files":
        allowedTypes = allowedFileTypes;
        break;
      case "chat-audio":
        allowedTypes = allowedAudioTypes;
        break;
    }

    if (!allowedTypes.includes(fileType)) {
      throw new AppError("Desteklenmeyen dosya türü", 400);
    }

    // Benzersiz dosya adı oluştur
    const fileExtension = fileType.split("/")[1];
    const fileName = `${folder}/${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;

    // Yükleme URL'i oluştur
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      uploadUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
    };
  }
}

export const uploadFile = async (
  file: Express.Multer.File,
  path: string
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: `${path}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}/${file.originalname}`;
  } catch (error) {
    throw new AppError("Dosya yüklenirken hata oluştu", 500);
  }
};
