import joi from "joi";
import { RegisterType } from "../../types/user/Register";

export const registerSchema = joi.object<RegisterType>({
  userName: joi.string().optional(),
  email: joi.string().optional(),
  phoneNumber: joi.string().optional(),
  password: joi.string().required(),
  age: joi.number().optional().default(0),
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  secondName: joi.string().optional(),
  role: joi.string().optional(),
  weight: joi.number().optional(),
  height: joi.number().optional(),
  goals: joi.string().optional(),
  photoUrl: joi.string().optional().default(" ")
});
