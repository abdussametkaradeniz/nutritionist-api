import { MultilanguageDbManager } from "../../database/multilanguageDbManager";
import { BusinessException, NotFound } from "../../domain/exception";
import { MultilanguageDefinitionType } from "../../types/multilanguage/multilanguageDefinitionType";
export class MultilanguageManager {
  request: MultilanguageDefinitionType;
  multilanguageDbManager: MultilanguageDbManager;
  constructor(request: MultilanguageDefinitionType) {
    this.request = request;
    this.multilanguageDbManager = new MultilanguageDbManager();
  }

  addMultilanguageDefinition = async () => {
    try {
      const definition = await this.multilanguageDbManager.addMultilanguage(
        this.request
      );
      return definition;
    } catch (error) {
      throw new BusinessException("unexpected error ${error}",400)
    }
  };

  getMultilanguageValue = async () => {
    try {
        const response = await this.multilanguageDbManager.getMultilanguageValue(this.request)
        return response;
    } catch (error) {
        
    }
  }

}
