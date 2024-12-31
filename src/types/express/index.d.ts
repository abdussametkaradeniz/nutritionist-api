// src/types/express/index.d.ts
import { UserRole } from "../user/UserRole";

declare global {
  namespace Express {
    interface Request {
      user?: {
        roles: UserRole[];
        permissions: string[];
      };
    }
  }
}
