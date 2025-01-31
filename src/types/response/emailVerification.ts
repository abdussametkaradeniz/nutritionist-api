export interface EmailVerificationResponse {
  message: string;
  status: "success" | "error";
}

export interface EmailVerificationStatusResponse {
  verified: boolean;
  message?: string;
}
