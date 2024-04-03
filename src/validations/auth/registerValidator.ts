import joi from "joi";

export const registerSchema = joi.object({
  userName: joi.string().optional(),
  email: joi.string().optional(),
  phoneNumber: joi.number().optional(),
  password: joi.string().required(),
  age: joi.number().optional().default(0),
  name: joi.string().required(),
  surname: joi.string().required(),
  secondaryName: joi.string().optional(),
  role: joi.array().required(),
  roleId: joi.number().required(),
  recordStatus: joi.string().default("A"),
  permissions: joi.array().required(),
});
