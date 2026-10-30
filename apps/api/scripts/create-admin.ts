import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("✗ Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env first");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("✗ ADMIN_PASSWORD must be at least 12 characters");
    process.exit(1);
  }

  const hash = await hashPassword(password);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, name: "Administrator", passwordHash: hash, role: "ADMIN" },
  });

  console.log(`✓ admin ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
