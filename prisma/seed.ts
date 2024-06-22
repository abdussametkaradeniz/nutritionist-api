// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    // Rol tanımlamaları (varsa al, yoksa oluştur)
    let roleCio = await prisma.role.findUnique({
      where: { roleName: "Cio" },
    });
    if (!roleCio) {
      roleCio = await prisma.role.create({
        data: {
          roleName: "Cio",
        },
      });
    }

    let roleDeveloper = await prisma.role.findUnique({
      where: { roleName: "Developer" },
    });
    if (!roleDeveloper) {
      roleDeveloper = await prisma.role.create({
        data: {
          roleName: "Developer",
        },
      });
    }

    // İzin tanımlamaları (varsa al, yoksa oluştur)
    let permissionAdmin = await prisma.permission.findUnique({
      where: { permissionName: "Admin" },
    });
    if (!permissionAdmin) {
      permissionAdmin = await prisma.permission.create({
        data: {
          permissionName: "Admin",
          roles: {
            connect: {
              id: roleCio.id,
            },
          },
        },
      });
    }

    let permissionUser = await prisma.permission.findUnique({
      where: { permissionName: "User" },
    });
    if (!permissionUser) {
      permissionUser = await prisma.permission.create({
        data: {
          permissionName: "User",
          roles: {
            connect: {
              id: roleDeveloper.id,
            },
          },
        },
      });
    }

    // Kullanıcıları oluşturma
    const user1 = await prisma.user.create({
      data: {
        email: "user1@example.com",
        userName: "user1",
        passwordHash: "hashedpassword1",
        firstName: "User",
        lastName: "One",
        phoneNumber: "123456789",
        age: 30,
        roleId: roleCio.id,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "user2@example.com",
        userName: "user2",
        passwordHash: "hashedpassword2",
        firstName: "User",
        lastName: "Two",
        phoneNumber: "987654321",
        age: 25,
        roleId: roleDeveloper.id,
      },
    });

    // Takipçi ilişkilerini oluşturma
    await prisma.follower.create({
      data: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });

    await prisma.follower.create({
      data: {
        followerId: user2.id,
        followingId: user1.id,
      },
    });

    // Gönderileri oluşturma
    const post1 = await prisma.post.create({
      data: {
        userId: user1.id,
        content: "Bu bir gönderidir.",
        imageUrl: "https://example.com/image1.jpg",
      },
    });

    const post2 = await prisma.post.create({
      data: {
        userId: user2.id,
        content: "Bu da başka bir gönderidir.",
        imageUrl: "https://example.com/image2.jpg",
      },
    });

    console.log("Seed işlemi tamamlandı.");
  } catch (error) {
    console.error("Seed işlemi sırasında hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}


// main()
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);

//   })

//   .then(async () => {
//     await prisma.$disconnect();
//   });
