import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Create roles
    const adminRole = await prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: {
        name: "USER",
      },
    });

    // Create permissions
    const adminPermission = await prisma.permission.upsert({
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
    const user1 = await prisma.user.upsert({
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

    const user2 = await prisma.user.upsert({
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
    await prisma.session.create({
      data: {
        userId: user1.id,
        dietitianId: user2.id,
        date: new Date(),
        status: "PENDING",
      },
    });

    // Create a message
    await prisma.message.create({
      data: {
        content: "Hello, how are you?",
        userId: user1.id,
        recipientId: user2.id,
      },
    });

    console.log("Seeding completed.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .then(async () => {
    await prisma.$disconnect();
  });
