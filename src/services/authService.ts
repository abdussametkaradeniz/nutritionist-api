import prisma from "../../prisma/client";
import bcrypt from "bcrypt";
import { BusinessException } from "../domain/exception";
import { UserRole } from "../constants/userRoles";
import { RegisterType } from "../types/user/Register";
import jwt from "jsonwebtoken";
import { Role } from "../models/role.model";

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
        permissions: [],
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
        profile: registerData.profile
          ? {
              create: {
                firstName: registerData.profile.firstName ?? null,
                lastName: registerData.profile.lastName ?? null,
                secondName: registerData.profile.secondName ?? null,
                age: registerData.profile.age ?? null,
                weight: registerData.profile.weight ?? null,
                isProfileCompleted: false,
                photoUrl: registerData.profile.photoUrl ?? null,
              },
            }
          : undefined,
      },
    });

    return user;
  }

  private static generateTokens(user: {
    userId: number;
    email: string;
    role: string;
  }) {
    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    const refreshToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

    return { accessToken, refreshToken };
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

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name,
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
