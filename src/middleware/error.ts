import { Request, Response, NextFunction } from "express";
import logger from "../helpers/logger";

const errorMiddleware = (
  err: { message: any; stack: any; status: any },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    isError: true,
    result: [],
    message: err.message || "Internal Server Error",
    status: err.status || 500,
    method: req.method,
    url: req.url,
    stack: err.stack,
  });
};

export default errorMiddleware;
