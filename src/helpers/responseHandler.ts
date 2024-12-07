import { Response } from "express";

export function sendSuccess(
  res: Response,
  result: any,
  message = "Request successful",
  status = 200
) {
  const safeResult = JSON.parse(JSON.stringify(result));
  return res.status(status).json({
    isError: false,
    result: safeResult,
    message: message,
    status: status,
  });
}
