import Joi from "joi";
import { Request, Response, NextFunction } from "express";

import { InvalidParameter } from "../domain/exception";

export function requestValidator(
  schema: Joi.ObjectSchema<any>,
  options: Joi.ValidationOptions = { abortEarly: false }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = await schema.validateAsync(
        req.method === "GET" ? req.query : req.body,
        options
      );

      // Replace request data with validated data
      if (req.method === "GET") {
        req.query = value;
      } else {
        req.body = value;
      }

      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        next(
          new InvalidParameter(error.details.map((d) => d.message).join(", "))
        );
      } else {
        next(error);
      }
    }
  };
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
