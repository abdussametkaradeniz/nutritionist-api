import prisma from "../../prisma/client";
import bcrypt from "bcrypt";
import { BusinessException } from "../domain/exception";
import { UserRole } from "../constants/userRoles";
import { RegisterType } from "../types/user/Register";
import jwt from "jsonwebtoken";
import { Role } from "../models/role.model";
import { generateTokens } from "../../src/helpers/jwt";

export class AuthService {
  async register(registerData: RegisterType) {
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: registerData.email },
    });
    if (existingEmail) {
      throw new BusinessException("Email already exists", 400);
    }

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: registerData.username },
    });
    if (existingUsername) {
      throw new BusinessException("Username already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    // Create user with required and optional fields
    const user = await prisma.user.create({
      data: {
        // Required fields
        email: registerData.email,
        username: registerData.username,
        passwordHash: hashedPassword,

        // Optional fields with defaults
        phoneNumber: registerData.phoneNumber ?? null,
        fullName: registerData.fullName ?? null,
        birthDate: registerData.birthDate
          ? new Date(registerData.birthDate)
          : null,
        gender: registerData.gender ?? null,
        height: registerData.height ?? null,
        weight: registerData.weight ?? null,
        address: registerData.address ?? null,
        avatarUrl: registerData.avatarUrl ?? null,
        emailVerified: false,
        role: {
          connect: { name: "USER" },
        },
        twoFactorEnabled: false,
        backupCodes: [],

        // Optional relations
        preferences: {
          create: {
            language: "tr",
            timezone: "Europe/Istanbul",
            theme: "SYSTEM",
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
          },
        },
        profile: {
          create: {
            firstName: registerData.profile?.firstName ?? null,
            lastName: registerData.profile?.lastName ?? null,
            secondName: registerData.profile?.secondName ?? null,
            age: registerData.profile?.age ?? null,
            weight: registerData.profile?.weight ?? null,
            isProfileCompleted: false,
            photoUrl: registerData.profile?.photoUrl ?? null,
          },
        },
      },
    });

    return user;
  }

  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new BusinessException("Invalid credentials", 401);
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role.name as UserRole,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
