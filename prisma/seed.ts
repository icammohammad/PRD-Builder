import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (optional, but good for a fresh start)
  // await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin created:", admin.email);

  // Create Member
  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      email: "member@example.com",
      name: "Member User",
      password: hashedPassword,
      role: "member",
    },
  });

  console.log("Member created:", member.email);

  // Create some initial features
  const features = [
    { name: "PRD Generation Limit", description: "Batas maksimal PRD per bulan", type: "quota" },
    { name: "Chat AI Revision", description: "Akses revisi PRD lewat Chat AI", type: "boolean" },
    { name: "Download PDF", description: "Akses download format PDF", type: "boolean" },
  ];

  for (const f of features) {
    await prisma.feature.upsert({
      where: { id: f.name.toLowerCase().replace(/\s+/g, '-') }, // Using a deterministic ID for upsert
      update: {},
      create: {
        id: f.name.toLowerCase().replace(/\s+/g, '-'),
        name: f.name,
        description: f.description,
        type: f.type,
      },
    });
  }

  console.log("Features seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
