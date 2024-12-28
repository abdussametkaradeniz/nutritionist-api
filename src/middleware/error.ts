import { Request, Response, NextFunction } from "express";
import logger from "../helpers/logger";

const errorMiddleware = (
  err: { message: any; stack: any; status: any },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorType = err.constructor.name;

  logger.error(`Error: ${err.message}`, {
    errorType,
    method: req.method,
    url: req.url,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(err.status || 500).json({
    isError: true,
    errorType,
    message: err.message || "Internal Server Error",
    status: err.status || 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;
