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
exports.HealthService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
class HealthService {
    // Sağlık uygulaması bağlantısı
    static connectHealthApp(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, provider, accessToken, refreshToken, expiresAt } = params;
            return yield client_1.default.healthAppConnection.create({
                data: {
                    userId,
                    provider,
                    accessToken,
                    refreshToken,
                    expiresAt,
                },
            });
        });
    }
    // Sağlık verisi senkronizasyonu
    static syncHealthData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, provider, data } = params;
            // Bağlantı kontrolü
            const connection = yield client_1.default.healthAppConnection.findUnique({
                where: {
                    userId_provider: {
                        userId,
                        provider,
                    },
                },
            });
            if (!connection) {
                throw new appError_1.AppError("Sağlık uygulaması bağlantısı bulunamadı", 404);
            }
            // Verileri kaydet
            const healthData = yield client_1.default.healthData.createMany({
                data: data.map((item) => (Object.assign({ userId,
                    provider }, item))),
            });
            // Son senkronizasyon zamanını güncelle
            yield client_1.default.healthAppConnection.update({
                where: {
                    id: connection.id,
                },
                data: {
                    lastSync: new Date(),
                },
            });
            return healthData;
        });
    }
    // Sağlık verilerini getir
    static getHealthData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, dataType, startDate, endDate } = params;
            return yield client_1.default.healthData.findMany({
                where: Object.assign(Object.assign({ userId }, (dataType && { dataType })), (startDate && {
                    timestamp: Object.assign({ gte: startDate }, (endDate && { lte: endDate })),
                })),
                orderBy: {
                    timestamp: "desc",
                },
            });
        });
    }
    // Bağlantıyı sil
    static disconnectHealthApp(userId, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.healthAppConnection.deleteMany({
                where: {
                    userId,
                    provider,
                },
            });
        });
    }
}
exports.HealthService = HealthService;
