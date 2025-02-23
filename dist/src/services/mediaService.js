"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.MediaService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = __importDefault(require("crypto"));
const appError_1 = require("../utils/appError");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "eu-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
class MediaService {
    static generateUploadUrl(fileType, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            // Dosya türü kontrolü
            const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
            const allowedFileTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
            let allowedTypes = [];
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
                throw new appError_1.AppError("Desteklenmeyen dosya türü", 400);
            }
            // Benzersiz dosya adı oluştur
            const fileExtension = fileType.split("/")[1];
            const fileName = `${folder}/${crypto_1.default.randomBytes(16).toString("hex")}.${fileExtension}`;
            // Yükleme URL'i oluştur
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileName,
                ContentType: fileType,
            });
            const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
                expiresIn: 3600,
            });
            return {
                uploadUrl,
                fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
            };
        });
    }
}
exports.MediaService = MediaService;
const uploadFile = (file, path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET || "",
            Key: `${path}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        yield s3Client.send(command);
        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}/${file.originalname}`;
    }
    catch (error) {
        throw new appError_1.AppError("Dosya yüklenirken hata oluştu", 500);
    }
});
exports.uploadFile = uploadFile;
