import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'muhammad.hissamudin@gmail.com';
  const adminPassword = 'adminpassword123'; // Ganti dengan password yang diinginkan
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Admin Hissam'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      name: 'Admin Hissam'
    },
  });

  console.log({ admin });

  // Seed default packages
  const packages = [
    { name: 'Free', limit: 5, price: 0, description: 'Paket gratis untuk mencoba' },
    { name: 'Pro', limit: 50, price: 99000, description: 'Paket profesional untuk power user' },
    { name: 'Enterprise', limit: 999, price: 499000, description: 'Paket tanpa batas untuk tim' }
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.name.toLowerCase() }, // Using name as ID for seeding stability or just find by name
      update: pkg,
      create: {
        ...pkg,
        id: pkg.name.toLowerCase()
      }
    });
  }

  // Seed default config
  await prisma.systemConfig.upsert({
    where: { id: 'config' },
    update: {},
    create: {
      id: 'config',
      landingPageTitle: 'AI PRD Architect',
      landingPageHero: 'Transformasikan ide mentah Anda menjadi dokumen spesifikasi produk yang profesional.'
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
