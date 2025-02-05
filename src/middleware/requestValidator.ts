import { z } from "zod";
import { Request, Response, NextFunction } from "express";

import { InvalidParameter } from "../domain/exception";

export const requestValidator = (schema: z.ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

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
