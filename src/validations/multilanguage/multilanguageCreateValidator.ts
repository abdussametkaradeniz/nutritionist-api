import joi from "joi";
import { MultilanguageDefinitionType } from "../../types/multilanguage/multilanguageDefinitionType";
import { MultilanguageGetType } from "../../types/multilanguage/multilanguageGetType";

export const CreateSchema = joi.object<MultilanguageDefinitionType>({
  MlCode: joi.string().required(),
  CountryCode: joi.string().required(),
  MlValue: joi.string().required(),
  ApplicationCode: joi.string().required(),
  UpdatedDate: joi.date().optional(),
});

export const GetMlWordsSchema = joi.object<MultilanguageGetType>({
  MlCode: joi.string().required(),
  CountryCode: joi.string().required(),
  ApplicationCode: joi.string().required(),
});
