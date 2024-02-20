import joi from "joi";

export const loginSchema = joi.object({
  userName: joi.string().optional(),
  email: joi.string().optional(),
  phoneNumber: joi.string().optional(),
  password: joi.string().required(),
});
