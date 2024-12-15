import Joi, { date } from "joi";
import { RoleTypes } from "../../types/rolePermissions/roleEnums";

export const permissionCreateSchema = Joi.object({
  permission: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    recordStatus: Joi.string().default("A"),
    lastUpdatingUser: Joi.string().default("admin"),
  }),
  roles: Joi.array()
    .items(
      Joi.object({
        roleId: Joi.number().integer().positive().required(),
        roleName: Joi.string()
          .valid("ADMIN", "DIETITIAN", "USER", "PREMIUMUSER", "BASICUSER")
          .required(),
        recordStatus: Joi.string().default("A"),
        lastUpdatingUser: Joi.string().default("admin"),
      })
    )
    .min(1)
    .required(),
});

const roleNames = Object.values(RoleTypes);

export const permissionUpdateSchema = Joi.object({
  permission: Joi.object({
    permissionId: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
  roles: Joi.array()
    .items(
      Joi.object({
        roleId: Joi.number().required(),
        roleName: Joi.string().valid(...roleNames),
      })
    )
    .min(1),
});
