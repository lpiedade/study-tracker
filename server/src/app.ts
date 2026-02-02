import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- Study Sessions ---
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await prisma.studySession.findMany({
            orderBy: { startTime: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

app.post('/api/sessions', async (req, res) => {
    try {
        const { subject, topic, startTime, endTime, isReview, notes } = req.body;
        const session = await prisma.studySession.create({
            data: {
                subject,
                topic,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isReview,
                notes
            }
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
            orderBy: { plannedDate: 'asc' }
        });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

app.post('/api/lessons', async (req, res) => {
    try {
        const { title, subject, content, plannedDate } = req.body;
        const lesson = await prisma.lessonPlan.create({
            data: {
                title,
                subject,
                content,
                plannedDate: new Date(plannedDate)
            }
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

// --- Exam Results ---
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await prisma.examResult.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

app.post('/api/exams', async (req, res) => {
    try {
        const { subject, score, maxScore, date, notes } = req.body;
        const exam = await prisma.examResult.create({
            data: {
                subject,
                score,
                maxScore,
                date: new Date(date),
                notes
            }
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
