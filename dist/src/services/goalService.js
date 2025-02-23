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
exports.GoalService = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
class GoalService {
    // Hedef oluştur
    static createGoal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_2.default.goal.create({
                data: Object.assign(Object.assign({}, data), { status: client_1.GoalStatus.ACTIVE }),
            });
        });
    }
    // Hedefleri listele
    static getGoals(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, status, page = 1, limit = 10 } = params;
            const where = Object.assign({ userId }, (status && { status }));
            const [goals, total] = yield Promise.all([
                client_2.default.goal.findMany({
                    where,
                    orderBy: {
                        startDate: "desc",
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                client_2.default.goal.count({ where }),
            ]);
            return {
                data: goals,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    // Hedef durumunu güncelle
    static updateGoalStatus(goalId, userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const goal = yield client_2.default.goal.findFirst({
                where: { id: goalId, userId },
            });
            if (!goal) {
                throw new appError_1.AppError("Hedef bulunamadı", 404);
            }
            return yield client_2.default.goal.update({
                where: { id: goalId },
                data: { status },
            });
        });
    }
    // Hedef ilerleme durumunu hesapla
    static calculateProgress(goalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const goal = yield client_2.default.goal.findUnique({
                where: { id: goalId },
            });
            if (!goal) {
                throw new appError_1.AppError("Hedef bulunamadı", 404);
            }
            const latestProgress = yield client_2.default.progress.findFirst({
                where: { userId: goal.userId },
                orderBy: { date: "desc" },
            });
            if (!latestProgress || !goal.targetWeight) {
                return null;
            }
            const totalWeightGoal = goal.targetWeight - goal.startWeight;
            const currentProgress = latestProgress.weight - goal.startWeight;
            const progressPercentage = (currentProgress / totalWeightGoal) * 100;
            return {
                currentWeight: latestProgress.weight,
                targetWeight: goal.targetWeight,
                progressPercentage: Math.min(Math.max(progressPercentage, 0), 100),
                remainingDays: Math.ceil((goal.targetDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)),
            };
        });
    }
}
exports.GoalService = GoalService;
