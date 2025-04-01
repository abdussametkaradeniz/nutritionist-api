import joi from "joi";
import { ProfileType, RegisterType } from "../../types/user/Register";

export const registerSchema = joi.object<RegisterType>({
  username: joi.string().required().min(3).max(50),
  email: joi.string().email().required(),
  phoneNumber: joi.string().allow(null, ""),
  password: joi.string().required().min(6),
  role: joi
    .string()
    .valid("USER", "DIETITIAN", "ADMIN", "BASICUSER", "VIPUSER")
    .optional()
    .default("USER"),
  weight: joi.number().allow(null),
  height: joi.number().allow(null),
  goals: joi
    .string()
    .optional()
    .valid("GAINMUSCLES", "GAINWEIGHT", "WEIGHTLOSS")
    .default("GAINWEIGHT"),
  profile: joi
    .object<ProfileType>({
      firstName: joi.string().required().min(2).max(50),
      lastName: joi.string().required().min(2).max(50),
      secondName: joi.string().allow(null, ""),
      age: joi.number().integer().min(0).max(150).allow(null),
      weight: joi.number().min(0).allow(null),
      photoUrl: joi.string().allow(null, ""),
    })
    .required(),
});
