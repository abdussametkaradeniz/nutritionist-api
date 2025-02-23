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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = uploadToS3;
exports.deleteFromS3 = deleteFromS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const exception_1 = require("../domain/exception");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "eu-central-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET || "nutritionist-app";
function uploadToS3(file, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read",
            });
            yield s3Client.send(command);
            return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        }
        catch (error) {
            console.error("S3 upload error:", error);
            throw new exception_1.BusinessException("Dosya yükleme hatası", 500);
        }
    });
}
function deleteFromS3(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = url.split(".com/")[1];
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            yield s3Client.send(command);
        }
        catch (error) {
            console.error("S3 delete error:", error);
            throw new exception_1.BusinessException("Dosya silme hatası", 500);
        }
    });
}
