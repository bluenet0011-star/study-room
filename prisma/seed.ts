import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Admin
    await prisma.user.upsert({
        where: { loginId: 'admin' },
        update: {},
        create: {
            loginId: 'admin',
            name: 'Administrator',
            passwordHash: hashedPassword,
            role: Role.ADMIN,
        },
    });

    // Teacher
    await prisma.user.upsert({
        where: { loginId: 'teacher' },
        update: {},
        create: {
            loginId: 'teacher',
            name: 'Teacher One',
            passwordHash: hashedPassword,
            role: Role.TEACHER,
        },
    });

    // Student
    await prisma.user.upsert({
        where: { loginId: 'student' },
        update: {},
        create: {
            loginId: 'student',
            name: 'Student One',
            passwordHash: hashedPassword,
            role: Role.STUDENT,
            grade: 1,
            class: 1,
            number: 1,
        },
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
