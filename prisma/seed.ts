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

    // Kullanıcı oluşturma
    const user1 = await prisma.user.create({
      data: {
        email: "byrbrs@example.com",
        userName: "bybrs",
        passwordHash: "1234",
        firstName: "User",
        secondaryName: "userseconder",
        lastName: "One",
        roleId: roleCio.id,
        phoneNumber: "148",
        age: 30,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "mrsmile@example.com",
        userName: "mrsmile",
        passwordHash: "1234",
        firstName: "User",
        secondaryName: "userseconder",
        lastName: "Two",
        roleId: roleDeveloper.id,
        phoneNumber: "551",
        age: 25,
      },
    });

    // Takipçi ve takip edilen kullanıcı ilişkileri oluşturma
    await prisma.follower.create({
      data: {
        follower: {
          connect: {
            id: user1.id,
          },
        },
        following: {
          connect: {
            id: user2.id,
          },
        },
      },
    });

    await prisma.follower.create({
      data: {
        follower: {
          connect: {
            id: user2.id,
          },
        },
        following: {
          connect: {
            id: user1.id,
          },
        },
      },
    });

    // Kullanıcıların gönderi oluşturması
    const post1 = await prisma.post.create({
      data: {
        user: {
          connect: {
            id: user1.id,
          },
        },
        content: "Bu bir gönderidir.",
        imageUrl: "https://example.com/image1.jpg",
      },
    });

    const post2 = await prisma.post.create({
      data: {
        user: {
          connect: {
            id: user2.id,
          },
        },
        content: "Bu da başka bir gönderidir.",
        imageUrl: "https://example.com/image2.jpg",
      },
    });

    // Gönderi beğenilerinin eklenmesi
    await prisma.postLike.create({
      data: {
        post: {
          connect: {
            id: post1.id,
          },
        },
        user: {
          connect: {
            id: user2.id,
          },
        },
      },
    });

    await prisma.postLike.create({
      data: {
        post: {
          connect: {
            id: post2.id,
          },
        },
        user: {
          connect: {
            id: user1.id,
          },
        },
      },
    });
    console.log("Seed işlemi tamamlandı.");
  } catch (error) {
    console.error("Seed işlemi sırasında hata oluştu:", error);
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
