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
exports.ProgressService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const mediaService_1 = require("./mediaService");
class ProgressService {
    // İlerleme kaydı oluştur
    static createProgress(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // İlerleme kaydı oluştur
                const progress = yield tx.progress.create({
                    data: {
                        userId,
                        date: data.date,
                        weight: data.weight,
                        bodyFat: data.bodyFat,
                        muscle: data.muscle,
                        water: data.water,
                        chest: data.chest,
                        waist: data.waist,
                        hip: data.hip,
                        arm: data.arm,
                        thigh: data.thigh,
                        notes: data.notes,
                    },
                });
                // Fotoğrafları yükle
                if ((_a = data.photos) === null || _a === void 0 ? void 0 : _a.length) {
                    const photoPromises = data.photos.map((photo) => __awaiter(this, void 0, void 0, function* () {
                        const url = yield (0, mediaService_1.uploadFile)(photo.file, `progress/${userId}/${progress.id}`);
                        return tx.progressPhoto.create({
                            data: {
                                progressId: progress.id,
                                url,
                                type: photo.type,
                            },
                        });
                    }));
                    yield Promise.all(photoPromises);
                }
                return yield tx.progress.findUnique({
                    where: { id: progress.id },
                    include: {
                        photos: true,
                    },
                });
            }));
        });
    }
    // İlerleme kayıtlarını listele
    static getProgress(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, startDate, endDate, page = 1, limit = 10 } = params;
            const where = Object.assign(Object.assign({ userId }, (startDate && { date: { gte: startDate } })), (endDate && { date: { lte: endDate } }));
            const [progress, total] = yield Promise.all([
                client_1.default.progress.findMany({
                    where,
                    include: {
                        photos: true,
                    },
                    orderBy: {
                        date: "desc",
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                client_1.default.progress.count({ where }),
            ]);
            return {
                data: progress,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    // İstatistikleri hesapla
    static calculateStats(userId, period) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const progress = (yield client_1.default.progress.findMany({
                where: {
                    userId,
                    date: {
                        gte: period.startDate,
                        lte: period.endDate,
                    },
                },
                orderBy: {
                    date: "asc",
                },
            }));
            if (!progress.length) {
                return null;
            }
            return {
                weightChange: ((_a = progress[progress.length - 1]) === null || _a === void 0 ? void 0 : _a.weight) != null &&
                    ((_b = progress[0]) === null || _b === void 0 ? void 0 : _b.weight) != null
                    ? progress[progress.length - 1].weight - progress[0].weight
                    : null,
                measurements: {
                    chest: this.calculateChange(progress, "chest"),
                    waist: this.calculateChange(progress, "waist"),
                    hip: this.calculateChange(progress, "hip"),
                    arm: this.calculateChange(progress, "arm"),
                    thigh: this.calculateChange(progress, "thigh"),
                },
                composition: {
                    bodyFat: this.calculateChange(progress, "bodyFat"),
                    muscle: this.calculateChange(progress, "muscle"),
                    water: this.calculateChange(progress, "water"),
                },
            };
        });
    }
    static calculateChange(progress, field) {
        const first = progress[0][field];
        const last = progress[progress.length - 1][field];
        return first && last ? last - first : null;
    }
}
exports.ProgressService = ProgressService;
