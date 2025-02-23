"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = void 0;
const zod_1 = require("zod");
exports.updatePreferencesSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
});
