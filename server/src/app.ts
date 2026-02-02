import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- Subjects ---
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

app.post('/api/subjects', async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const subject = await prisma.subject.create({
            data: { name, description, color: color || '#4f46e5' }
        });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

app.put('/api/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color } = req.body;
        const subject = await prisma.subject.update({
            where: { id: Number(id) },
            data: { name, description, color }
        });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

app.delete('/api/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subject.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

// --- Study Sessions ---
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await prisma.studySession.findMany({
            orderBy: { startTime: 'desc' },
            include: { Subject: true }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

app.post('/api/sessions', async (req, res) => {
    try {
        const { subjectId, topic, startTime, endTime, isReview, notes } = req.body;
        const session = await prisma.studySession.create({
            data: {
                subjectId: Number(subjectId),
                topic,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isReview,
                notes
            },
            include: { Subject: true }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.studySession.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// --- Lesson Plans ---
app.get('/api/lessons', async (req, res) => {
    try {
        const lessons = await prisma.lessonPlan.findMany({
            orderBy: { plannedDate: 'asc' },
            include: { Subject: true }
        });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

app.post('/api/lessons', async (req, res) => {
    try {
        const { title, subjectId, content, plannedDate } = req.body;
        const lesson = await prisma.lessonPlan.create({
            data: {
                title,
                subjectId: Number(subjectId),
                content,
                plannedDate: new Date(plannedDate)
            },
            include: { Subject: true }
        });
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
});

app.put('/api/lessons/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;
        const lesson = await prisma.lessonPlan.update({
            where: { id: Number(id) },
            data: { isCompleted }
        });
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

app.put('/api/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subjectId, content, plannedDate } = req.body;
        const lesson = await prisma.lessonPlan.update({
            where: { id: Number(id) },
            data: {
                title,
                subjectId: Number(subjectId),
                content,
                plannedDate: new Date(plannedDate)
            },
            include: { Subject: true }
        });
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

app.delete('/api/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.lessonPlan.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lesson' });
    }
});

// --- Exam Results ---
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await prisma.examResult.findMany({
            orderBy: { date: 'desc' },
            include: { Subject: true }
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

app.post('/api/exams', async (req, res) => {
    try {
        const { subjectId, score, maxScore, date, notes } = req.body;
        const exam = await prisma.examResult.create({
            data: {
                subjectId: Number(subjectId),
                score,
                maxScore,
                date: new Date(date),
                notes
            },
            include: { Subject: true }
        });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create exam result' });
    }
});

// --- Stats ---
app.get('/api/stats/progress', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueLessons = await prisma.lessonPlan.count({
            where: {
                plannedDate: { lt: today },
                isCompleted: false
            }
        });

        res.json({ overdueLessons });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress stats' });
    }
});

app.get('/api/stats/summary', async (req, res) => {
    try {
        const totalSessions = await prisma.studySession.count();
        const allSessions = await prisma.studySession.findMany({ select: { startTime: true, endTime: true } });
        const totalHours = allSessions.reduce((acc: number, curr: { startTime: Date, endTime: Date }) => {
            const duration = (new Date(curr.endTime).getTime() - new Date(curr.startTime).getTime()) / (1000 * 60 * 60);
            return acc + duration;
        }, 0);

        const averageScore = await prisma.examResult.aggregate({
            _avg: { score: true }
        });

        res.json({
            totalSessions,
            totalHours: Math.round(totalHours * 10) / 10,
            averageScore: averageScore._avg.score || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary stats' });
    }
});
