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
exports.ActivityLogRepository = void 0;
const client_1 = require("@prisma/client");
class ActivityLogRepository {
    static create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.create({ data });
        });
    }
    static findById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.findFirst({
                where: { id, userId },
            });
        });
    }
    static findByUserId(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            return yield this.prisma.findMany({
                where: { userId },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            });
        });
    }
    static findWithFilters(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.findMany({
                where: {
                    userId,
                    action: filters.action,
                    createdAt: {
                        gte: filters.startDate,
                        lte: filters.endDate,
                    },
                },
                skip: ((filters.page || 1) - 1) * (filters.limit || 10),
                take: filters.limit || 10,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    }
}
exports.ActivityLogRepository = ActivityLogRepository;
ActivityLogRepository.prisma = new client_1.PrismaClient().activityLog;
