import Joi from "joi";
import { Request, Response, NextFunction } from "express";

import { InvalidParameter } from "../domain/exception";

export function requestValidator(
  schema: Joi.ObjectSchema<any>,
  options?: Joi.ValidationOptions
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    debugger;
    const { error } = schema.validate(
      req.method === "GET" ? req.query : req.body,
      options
    );
    if (error) {
      return next(new InvalidParameter(error.details[0].message));
    }

    next();
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
