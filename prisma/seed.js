"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create roles
            const adminRole = yield prisma.role.upsert({
                where: { name: "ADMIN" },
                update: {},
                create: {
                    name: "ADMIN",
                },
            });
            const userRole = yield prisma.role.upsert({
                where: { name: "USER" },
                update: {},
                create: {
                    name: "USER",
                },
            });
            // Create permissions
            const adminPermission = yield prisma.permission.upsert({
                where: { name: "AdminAccess" },
                update: {},
                create: {
                    name: "AdminAccess",
                    description: "Access to admin features",
                    roles: {
                        connect: { id: adminRole.id },
                    },
                },
            });
            // Create users
            const user1 = yield prisma.user.upsert({
                where: { email: "user1@example.com" },
                update: {},
                create: {
                    username: "user1",
                    email: "user1@example.com",
                    passwordHash: "hashedpassword1",
                    roles: {
                        connect: { id: userRole.id },
                    },
                    profile: {
                        create: {
                            firstName: "John",
                            lastName: "Doe",
                            age: 30,
                            goals: "GAINMUSCLES",
                        },
                    },
                },
            });
            const user2 = yield prisma.user.upsert({
                where: { email: "user2@example.com" },
                update: {},
                create: {
                    username: "user2",
                    email: "user2@example.com",
                    passwordHash: "hashedpassword2",
                    roles: {
                        connect: { id: adminRole.id },
                    },
                    profile: {
                        create: {
                            firstName: "Jane",
                            lastName: "Smith",
                            age: 25,
                            goals: "WEIGHTLOSS",
                        },
                    },
                },
            });
            // Create a session
            yield prisma.session.create({
                data: {
                    userId: user1.id,
                    dietitianId: user2.id,
                    date: new Date(),
                    status: "PENDING",
                },
            });
            // Create a message
            yield prisma.message.create({
                data: {
                    content: "Hello, how are you?",
                    userId: user1.id,
                    recipientId: user2.id,
                },
            });
            console.log("Seeding completed.");
        }
        catch (error) {
            console.error("Error during seeding:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main()
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}))
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
