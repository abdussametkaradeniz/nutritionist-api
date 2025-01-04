// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
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
