"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomCodes = void 0;
const generateRandomCodes = (count) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 15).toUpperCase();
        codes.push(code);
    }
    return codes;
};
exports.generateRandomCodes = generateRandomCodes;
