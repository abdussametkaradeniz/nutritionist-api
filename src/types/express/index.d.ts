import { Session } from "../session";
import { UserRole } from "@prisma/client";
import { Multer } from "multer";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      session?: Session;
      user?: JwtPayload & {
        userId: number;
        email: string;
        role: string;
        permissions: string[];
      };
      file?: Multer.File;
      io?: any;
    }

    interface User {
      id: number;
      email: string;
      username: string;
      dietitianId?: number;
      role: string;
      permissions: string[];
    }
  }
}

export {};
