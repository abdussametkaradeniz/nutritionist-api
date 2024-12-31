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
exports.UserProcessManager = void 0;
const userProcessDbManager_1 = require("../../database/userProcessDbManager");
const exception_1 = require("../../domain/exception");
class UserProcessManager {
    constructor() {
        this.userProcessDbManager = new userProcessDbManager_1.UserProcessDbManager();
    }
    linkUserToDietitian(userId, dietitianId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.userProcessDbManager.linkUserToDietitian(userId, dietitianId);
                return result;
            }
            catch (error) {
                // Add specific error handling as needed
                throw new exception_1.BusinessException("Failed to link user to dietitian", 500);
            }
        });
    }
    getClientsByDietitian(dietitianId) {
        return __awaiter(this, void 0, void 0, function* () {
            const clients = yield this.userProcessDbManager.getClientsByDietitian(dietitianId);
            if (clients.length === 0) {
                throw new exception_1.NotFound("No clients found for this dietitian");
            }
            return clients;
        });
    }
}
exports.UserProcessManager = UserProcessManager;
