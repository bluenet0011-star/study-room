const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('1234', 10);

  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      loginId: 'admin',
      name: 'Administrator',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { loginId: 'teacher' },
    update: {},
    create: {
      loginId: 'teacher',
      name: 'Teacher One',
      passwordHash: hashedPassword,
      role: 'TEACHER',
    },
  });

  await prisma.user.upsert({
    where: { loginId: 'student' },
    update: {},
    create: {
      loginId: 'student',
      name: 'Student One',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      grade: 1,
      class: 1,
      number: 1,
    },
  });

  console.log('✓ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
