import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword, isAdmin: true },
    create: {
      username: "admin",
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log("✅ Admin user seeded (username: admin / password: admin)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
