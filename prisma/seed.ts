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
              roleId: roleCio.roleId,
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
              roleId: roleDeveloper.roleId,
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
        name: "User",
        secondaryName: "userseconder",
        surname: "One",
        roleId: roleCio.roleId,
        phoneNumber: 148,
        age: 30,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: "mrsmile@example.com",
        userName: "mrsmile",
        passwordHash: "1234",
        name: "User",
        secondaryName: "userseconder",
        surname: "Two",
        roleId: roleDeveloper.roleId,
        phoneNumber: 551,
        age: 25,
      },
    });

    // Takipçi ve takip edilen kullanıcı ilişkileri oluşturma
    await prisma.follower.create({
      data: {
        user: {
          connect: {
            id: user1.id,
          },
        },
        followingUser: {
          connect: {
            id: user2.id,
          },
        },
      },
    });

    await prisma.follower.create({
      data: {
        user: {
          connect: {
            id: user2.id,
          },
        },
        followingUser: {
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
        postText: "Bu bir gönderidir.",
        postImage: "https://example.com/image1.jpg",
      },
    });

    const post2 = await prisma.post.create({
      data: {
        user: {
          connect: {
            id: user2.id,
          },
        },
        postText: "Bu da başka bir gönderidir.",
        postImage: "https://example.com/image2.jpg",
      },
    });

    // Gönderi beğenilerinin eklenmesi
    await prisma.postLike.create({
      data: {
        post: {
          connect: {
            postId: post1.postId,
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
            postId: post2.postId,
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

// async function main() {
//   try {
//         // Rol tanımlamaları
//         const roleAdmin = await prisma.role.create({
//             data: {
//               roleName: "Admin",
//             },
//           });

//           const roleUser = await prisma.role.create({
//             data: {
//               roleName: "User",
//             },
//           });

//           // Kullanıcı oluşturma
//           const user1 = await prisma.user.create({
//             data: {
//               email: "user1@example.com",
//               userName: "user1",
//               passwordHash: "password123",
//               name: "User",
//               secondaryName: "userseconder",
//               surname: "One",
//               roleId: roleUser.roleId, // RoleId belirtiyoruz
//               phoneNumber: 123456789,
//               age: 30,
//             },
//           });
//     console.log("Seed işlemi tamamlandı.");
//   } catch (error) {
//     console.error("Seed işlemi sırasında hata oluştu:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })

  .then(async () => {
    await prisma.$disconnect();
  });

// const user2 = await prisma.user.create({
//   data: {
//     email: "tkn.ism2000@gmail.com",
//     userName: "mrsmilee",
//     name: "İsmail",
//     secondaryName: "Abdulkadir",
//     surname: "Tekin",
//     passwordHash: "$2y$10$HG6NTHdex9En.BEvX06pvuMD8GScWjmlP8LuPdLM.ScWEKXkQU7nm",
//   },
// });
