import { Session } from "../session";
import { UserRole } from "@prisma/client";
import { Multer } from "multer";
import { JwtPayload } from "jsonwebtoken";
import { Application } from "express";

declare global {
  namespace Express {
    export interface Request {
      session?: Session;
      user?: JwtPayload & {
        userId: number;
        email: string;
        role: string;
        roles: UserRole[];
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
      roles: UserRole[];
      permissions?: string[];
    }
  }
}

export {};
