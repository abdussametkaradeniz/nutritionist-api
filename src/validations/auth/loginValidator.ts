import joi from "joi";

export const loginSchema = joi.object({
  identifier: joi.string().required(),
  password: joi.string().required(),
});
