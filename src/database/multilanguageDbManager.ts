import prisma from "../../prisma/client";
import { BusinessException } from "../domain/exception";
import { MultilanguageDefinitionType } from "../types/multilanguage/multilanguageDefinitionType";
import { MultilanguageGetType } from "../types/multilanguage/multilanguageGetType";
export class MultilanguageDbManager {
  addMultilanguage = async (
    mlDef: MultilanguageDefinitionType
  ): Promise<any> => {
    try {
        const isUnique = await prisma.multilanguage.findUnique({
            where: {
              MlCode: mlDef.MlCode,
            },
          });
          if (!isUnique) {
              throw new BusinessException("ml must be unique",400);
          }
          const definition = await prisma.multilanguage.create({
            data: {
              ApplicationCode: mlDef.ApplicationCode,
              CountryCode: mlDef.CountryCode,
              MlCode: mlDef.MlCode,
              MlValue: mlDef.MlValue,
              createdAt: new Date(),
              updatedAt: mlDef.UpdatedDate,
              isDeleted: false,
            },
          });
          return definition;
    } catch (error) {
        return error;
    }
  };

  getMultilanguageValue = async (req: MultilanguageGetType) : Promise<any> => {
    try {
        const result = await prisma.multilanguage.findUnique({
            where: {
                MlCode: req.MlCode,
                ApplicationCode: req.ApplicationCode,
                CountryCode: req.CountryCode
            }
        });
        if (!result) {
            return {isError: true, message: "multilanguage code can not found", status: 404}
        }
        return result;
    } catch (error) {
        
    }
  }

}
