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
const express_1 = __importDefault(require("express"));
const dietitianService_1 = require("../../services/dietitianService");
const requestValidator_1 = require("../../middleware/requestValidator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Arama parametreleri validasyon şeması
const searchParamsSchema = zod_1.z
    .object({
    specialization: zod_1.z.nativeEnum(client_1.Specialization).optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    availableDay: zod_1.z
        .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ])
        .optional(),
    availableTime: zod_1.z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(50).optional(),
})
    .refine((data) => {
    if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice;
    }
    return true;
}, {
    message: "Maksimum fiyat, minimum fiyattan küçük olamaz",
});
// Diyetisyen arama
router.get("/search", (0, requestValidator_1.requestValidator)(searchParamsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield dietitianService_1.DietitianService.searchDietitians(req.query);
        res.json(Object.assign({ success: true }, result));
    }
    catch (error) {
        next(error);
    }
}));
// Uzmanlık alanına göre diyetisyen listesi
router.get("/by-specialization/:specialization", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specialization = req.params.specialization;
        const dietitians = yield dietitianService_1.DietitianService.getDietitiansBySpecialization(specialization);
        res.json({
            success: true,
            data: dietitians,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
