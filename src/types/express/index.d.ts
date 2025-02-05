import { Session } from "../session";
import { UserRole } from "@prisma/client";
import { Multer } from "multer";
import { JwtPayload } from "jsonwebtoken";
import { Role, Permission } from "../../models/role.model";

declare global {
  namespace Express {
    export interface Request {
      session?: Session;
      user?: JwtPayload & {
        userId: number;
        email: string;
        role: Role;
        permissions: Permission[];
      };
      file?: Multer.File;
      io?: any;
    }

    interface User {
      id: number;
      email: string;
      username: string;
      dietitianId?: number;
      role: Role;
      permissions: Permission[];
    }
  }
}

export {};
