import express, { Request, Response } from "express";
import { MultilanguageManager } from "../../bussiness/multilanguage/multilanguageManager";
import { MultilanguageDefinitionType } from "../../types/multilanguage/multilanguageDefinitionType";
import { requestValidator } from "../../middleware/requestValidator";
import { CreateSchema, GetMlWordsSchema } from "../../validations/multilanguage/multilanguageCreateValidator";
import { MultilanguageGetType } from "../../types/multilanguage/multilanguageGetType";

const router: express.Router = express.Router();

router.post(
  "/createMultilanguageDef",
  requestValidator(CreateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const request = req.body as MultilanguageDefinitionType;
    const mlDef = await new MultilanguageManager(
      request
    ).addMultilanguageDefinition();
    res.send(mlDef);
  }
);

router.post(
  "/getMlWords",
  requestValidator(GetMlWordsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const request = req.body as MultilanguageDefinitionType;
    const response = await new MultilanguageManager(
      request
    ).getMultilanguageValue();
    res.send(response);
  }
);

export default router;
