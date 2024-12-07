import { Request, Response, NextFunction } from "express";
import logger from "../helpers/logger";

const errorMiddleware = (
  err: { message: any; stack: any; statusCode: any },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("middleware çalıştı");
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    isError: true,
    message: err.message || "Internal Server Error",
    status: err.statusCode || 500,
  });
};

export default errorMiddleware;
