import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@demo.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPass123!';
  const adminName = process.env.SEED_ADMIN_NAME || 'Super Admin';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin user created:`);
  console.log(`   Email   : ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role    : ADMIN`);
  console.log(`   ID      : ${admin.id}`);

  // Seed a demo regular user
  const userEmail = 'user@demo.com';
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!existingUser) {
    const userPassword = await bcrypt.hash('UserPass123!', 12);
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Demo User',
        password: userPassword,
        role: 'USER',
        isActive: true,
      },
    });
    console.log(`\n✅ Demo user created:`);
    console.log(`   Email   : user@demo.com`);
    console.log(`   Password: UserPass123!`);
    console.log(`   Role    : USER`);
    console.log(`   ID      : ${user.id}`);
  }

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });