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
const searchValidation_1 = require("src/validations/searchValidation");
const router = express_1.default.Router();
// Diyetisyen arama
router.get("/search", (0, requestValidator_1.requestValidator)(searchValidation_1.searchParamsSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
