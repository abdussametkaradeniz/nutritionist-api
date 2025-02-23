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
exports.DietitianService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
class DietitianService {
    // Profil işlemleri
    static createProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Kullanıcının zaten profili var mı kontrol et
            const existingProfile = yield client_1.default.dietitianProfile.findUnique({
                where: { userId },
            });
            if (existingProfile) {
                throw new appError_1.AppError("Profile already exists", 400);
            }
            return yield client_1.default.dietitianProfile.create({
                data: Object.assign(Object.assign({}, data), { user: { connect: { id: userId } } }),
            });
        });
    }
    static getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield client_1.default.dietitianProfile.findUnique({
                where: { userId },
                include: {
                    workingHours: true,
                    pricingPackages: true,
                },
            });
            if (!profile) {
                throw new appError_1.AppError("Profile not found", 404);
            }
            return profile;
        });
    }
    static updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield client_1.default.dietitianProfile.findUnique({
                where: { userId },
            });
            if (!profile) {
                throw new appError_1.AppError("Profile not found", 404);
            }
            return yield client_1.default.dietitianProfile.update({
                where: { userId },
                data,
            });
        });
    }
    // Uzmanlık alanları işlemleri
    static addSpecialty(userId, specialtyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            const existingSpecialty = profile.specializations.some((specialty) => specialty === specialtyId);
            if (existingSpecialty) {
                throw new appError_1.AppError("This specialization already exists", 400);
            }
            return yield client_1.default.dietitianProfile.update({
                where: { id: profile.id },
                data: {
                    specializations: {
                        push: specialtyId,
                    },
                },
            });
        });
    }
    static removeSpecialty(userId, specialtyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            return yield client_1.default.dietitianProfile.update({
                where: { id: profile.id },
                data: {
                    specializations: {
                        set: profile.specializations.filter((s) => s !== specialtyId),
                    },
                },
            });
        });
    }
    // Çalışma saatleri işlemleri
    static addWorkingHours(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            // Çakışma kontrolü
            if (yield this.hasTimeConflict(profile.id, data)) {
                throw new appError_1.AppError("Bu zaman diliminde başka bir çalışma saati mevcut", 400);
            }
            return yield client_1.default.workingHours.create({
                data: Object.assign(Object.assign({}, data), { dietitian: { connect: { id: profile.id } } }),
            });
        });
    }
    static updateWorkingHours(userId, workingHours) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            // Önce mevcut çalışma saatlerini sil
            yield client_1.default.workingHours.deleteMany({
                where: { dietitianId: profile.id },
            });
            // Yeni çalışma saatlerini ekle
            return yield client_1.default.workingHours.createMany({
                data: workingHours.map((hour) => (Object.assign(Object.assign({}, hour), { dietitianId: profile.id }))),
            });
        });
    }
    static deleteWorkingHours(userId, hourId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            return yield client_1.default.workingHours.delete({
                where: { id: String(hourId), dietitianId: profile.id },
            });
        });
    }
    // Fiyatlandırma işlemleri
    static addPricingPackage(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            return yield client_1.default.pricingPackage.create({
                data: Object.assign(Object.assign({}, data), { dietitian: { connect: { id: profile.id } } }),
            });
        });
    }
    static createPricingPackage(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            return yield client_1.default.pricingPackage.create({
                data: Object.assign(Object.assign({}, data), { dietitian: { connect: { id: profile.id } } }),
            });
        });
    }
    static updatePricingPackage(userId, packageId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            const pricingPackage = yield client_1.default.pricingPackage.findFirst({
                where: {
                    id: packageId,
                    dietitianId: profile.id,
                },
            });
            if (!pricingPackage) {
                throw new appError_1.AppError("Pricing package not found", 404);
            }
            return yield client_1.default.pricingPackage.update({
                where: { id: packageId },
                data,
            });
        });
    }
    static deletePricingPackage(userId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            const pricingPackage = yield client_1.default.pricingPackage.findFirst({
                where: {
                    id: packageId,
                    dietitianId: profile.id,
                },
            });
            if (!pricingPackage) {
                throw new appError_1.AppError("Pricing package not found", 404);
            }
            return yield client_1.default.pricingPackage.delete({
                where: { id: packageId },
            });
        });
    }
    static getPricingPackages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.getProfile(userId);
            return yield client_1.default.pricingPackage.findMany({
                where: { dietitianId: profile.id },
            });
        });
    }
    // Yardımcı metodlar
    static hasTimeConflict(profileId, newSchedule) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHours = yield client_1.default.workingHours.findMany({
                where: { dietitianId: profileId },
            });
            return existingHours.some((schedule) => schedule.day === newSchedule.day &&
                ((schedule.startTime <= newSchedule.startTime &&
                    schedule.endTime > newSchedule.startTime) ||
                    (schedule.startTime < newSchedule.endTime &&
                        schedule.endTime >= newSchedule.endTime)));
        });
    }
    static searchDietitians(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { specialization, minPrice, maxPrice, availableDay, availableTime, page = 1, limit = 10, } = params;
            const where = {
                AND: [
                    specialization
                        ? {
                            specializations: {
                                has: specialization,
                            },
                        }
                        : {},
                    minPrice || maxPrice
                        ? {
                            pricingPackages: {
                                some: {
                                    AND: [
                                        minPrice ? { price: { gte: minPrice } } : {},
                                        maxPrice ? { price: { lte: maxPrice } } : {},
                                    ],
                                },
                            },
                        }
                        : {},
                    availableDay
                        ? {
                            workingHours: {
                                some: {
                                    AND: [{ day: availableDay }, { isAvailable: true }],
                                },
                            },
                        }
                        : {},
                ],
            };
            const [dietitians, total] = yield Promise.all([
                client_1.default.dietitianProfile.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                        workingHours: true,
                        pricingPackages: {
                            where: { isActive: true },
                        },
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        rating: "desc",
                    },
                }),
                client_1.default.dietitianProfile.count({ where }),
            ]);
            return {
                data: dietitians,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    static getDietitiansBySpecialization(specialization) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.dietitianProfile.findMany({
                where: {
                    specializations: {
                        has: specialization,
                    },
                },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
        });
    }
    static getWorkingHours(dietitianId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.workingHours.findMany({
                where: {
                    dietitianId,
                },
                orderBy: {
                    day: "asc",
                },
            });
        });
    }
}
exports.DietitianService = DietitianService;
