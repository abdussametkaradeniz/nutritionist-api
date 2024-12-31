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
exports.requestValidator = requestValidator;
const joi_1 = __importDefault(require("joi"));
const exception_1 = require("../domain/exception");
function requestValidator(schema, options = { abortEarly: false }) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const value = yield schema.validateAsync(req.method === "GET" ? req.query : req.body, options);
            // Replace request data with validated data
            if (req.method === "GET") {
                req.query = value;
            }
            else {
                req.body = value;
            }
            next();
        }
        catch (error) {
            if (error instanceof joi_1.default.ValidationError) {
                next(new exception_1.InvalidParameter(error.details.map((d) => d.message).join(", ")));
            }
            else {
                next(error);
            }
        }
    });
}
// export function requestValidator(
//   schema: Joi.ObjectSchema<any>,
//   options?: Joi.ValidationOptions
// ) {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const { error } = schema.validate(
//       req.method === "GET" ? req.query : req.body,
//       options
//     );
//     if (error) throw new InvalidParameter(error.details[0].message);
//     next();
//   };
// }
