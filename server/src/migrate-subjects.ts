import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration: strings to Subject records...');

    // 1. Get all unique subject names from existing tables
    const sessionSubjects = await prisma.studySession.findMany({ select: { subject: true } });
    const lessonSubjects = await prisma.lessonPlan.findMany({ select: { subject: true } });
    const examSubjects = await prisma.examResult.findMany({ select: { subject: true } });

    const allSubjectNames = new Set([
        ...sessionSubjects.map(s => s.subject).filter(Boolean),
        ...lessonSubjects.map(s => s.subject).filter(Boolean),
        ...examSubjects.map(s => s.subject).filter(Boolean),
    ] as string[]);

    console.log(`Found ${allSubjectNames.size} unique subjects:`, Array.from(allSubjectNames));

    // 2. Create Subject records
    for (const name of allSubjectNames) {
        await prisma.subject.upsert({
            where: { name },
            update: {},
            create: { name, color: '#4f46e5' }, // Default color
        });
    }

    const subjects = await prisma.subject.findMany();
    const subjectMap = new Map(subjects.map(s => [s.name, s.id]));

    // 3. Update StudySessions
    const sessions = await prisma.studySession.findMany({ where: { subject: { not: null } } });
    for (const s of sessions) {
        if (s.subject && subjectMap.has(s.subject)) {
            await prisma.studySession.update({
                where: { id: s.id },
                data: { subjectId: subjectMap.get(s.subject) }
            });
        }
    }

    // 4. Update LessonPlans
    const lessons = await prisma.lessonPlan.findMany({ where: { subject: { not: null } } });
    for (const l of lessons) {
        if (l.subject && subjectMap.has(l.subject)) {
            await prisma.lessonPlan.update({
                where: { id: l.id },
                data: { subjectId: subjectMap.get(l.subject) }
            });
        }
    }

    // 5. Update ExamResults
    const exams = await prisma.examResult.findMany({ where: { subject: { not: null } } });
    for (const e of exams) {
        if (e.subject && subjectMap.has(e.subject)) {
            await prisma.examResult.update({
                where: { id: e.id },
                data: { subjectId: subjectMap.get(e.subject) }
            });
        }
    }

    console.log('Migration completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
