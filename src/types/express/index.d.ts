import { Session } from "../session";
import { UserRole } from "../user/UserRole";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
      user?: {
        userId: number;
        email: string;
        username: string;
        dietitianId?: number;
        roles: UserRole[];
        permissions?: string[];
      };
      file?: Multer.File;
    }
  }
}
