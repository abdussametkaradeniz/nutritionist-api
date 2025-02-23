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
exports.requestValidator = void 0;
const requestValidator = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.requestValidator = requestValidator;
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
