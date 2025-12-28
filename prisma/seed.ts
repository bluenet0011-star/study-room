import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Base Users
    await prisma.user.upsert({ where: { loginId: 'admin' }, update: {}, create: { loginId: 'admin', name: 'Administrator', passwordHash: hashedPassword, role: Role.ADMIN } });
    await prisma.user.upsert({ where: { loginId: 'teacher' }, update: {}, create: { loginId: 'teacher', name: 'Teacher One', passwordHash: hashedPassword, role: Role.TEACHER } });
    await prisma.user.upsert({ where: { loginId: 'student' }, update: {}, create: { loginId: 'student', name: 'Student One', passwordHash: hashedPassword, role: Role.STUDENT, grade: 1, class: 1, number: 1 } });

    // Bulk Teachers (30)
    for (let i = 1; i <= 30; i++) {
        const loginId = `teacher${i}`;
        await prisma.user.upsert({
            where: { loginId },
            update: {},
            create: {
                loginId,
                name: `교사 ${i}`,
                passwordHash: hashedPassword,
                role: Role.TEACHER,
            },
        });
    }

    // Bulk Students (30)
    for (let i = 1; i <= 30; i++) {
        const loginId = `student${i}`;
        const grade = Math.floor(Math.random() * 3) + 1;
        const cls = Math.floor(Math.random() * 10) + 1;

        await prisma.user.upsert({
            where: { loginId },
            update: {},
            create: {
                loginId,
                name: `학생 ${i}`,
                passwordHash: hashedPassword,
                role: Role.STUDENT,
                grade,
                class: cls,
                number: i,
            },
        });
    }

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
