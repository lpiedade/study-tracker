import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app, prisma } from '../src/app';

// Helper to clean up test data after all tests
const createdIds = {
    courses: [] as number[],
    subjects: [] as number[],
    sessions: [] as number[],
    templates: [] as number[],
    lessons: [] as number[],
    exams: [] as number[],
};

afterAll(async () => {
    // Delete in reverse dependency order
    for (const id of createdIds.exams) {
        await prisma.examResult.delete({ where: { id } }).catch(() => { });
    }
    for (const id of createdIds.sessions) {
        await prisma.studySession.delete({ where: { id } }).catch(() => { });
    }
    for (const id of createdIds.lessons) {
        await prisma.lessonPlan.delete({ where: { id } }).catch(() => { });
    }
    for (const id of createdIds.templates) {
        await prisma.checklistTemplate.delete({ where: { id } }).catch(() => { });
    }
    for (const id of createdIds.subjects) {
        await prisma.subject.delete({ where: { id } }).catch(() => { });
    }
    for (const id of createdIds.courses) {
        await prisma.course.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

// =============================================================
// Courses
// =============================================================
describe('Courses API', () => {
    it('POST /api/courses creates a course', async () => {
        const res = await request(app)
            .post('/api/courses')
            .send({ name: 'Test Course', description: 'Test desc' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Course');
        createdIds.courses.push(res.body.id);
    });

    it('GET /api/courses returns array with subjects relation', async () => {
        const res = await request(app).get('/api/courses');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // The course we just created should be included
        const found = res.body.find((c: any) => c.name === 'Test Course');
        expect(found).toBeDefined();
        expect(found).toHaveProperty('subjects');
    });

    it('DELETE /api/courses/:id deletes a course', async () => {
        // Create one specifically to delete
        const create = await request(app)
            .post('/api/courses')
            .send({ name: 'To Delete Course' });
        const id = create.body.id;

        const res = await request(app).delete(`/api/courses/${id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('DELETE /api/courses/:id returns 500 for non-existent', async () => {
        const res = await request(app).delete('/api/courses/999999');
        expect(res.status).toBe(500);
    });
});

// =============================================================
// Subjects
// =============================================================
describe('Subjects API', () => {
    it('POST /api/subjects creates a subject', async () => {
        const res = await request(app)
            .post('/api/subjects')
            .send({
                name: 'Test Subject',
                description: 'Test',
                color: '#ff0000',
                courseId: createdIds.courses[0]
            });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test Subject');
        expect(res.body.color).toBe('#ff0000');
        createdIds.subjects.push(res.body.id);
    });

    it('POST /api/subjects with courseId links to course', async () => {
        const res = await request(app)
            .post('/api/subjects')
            .send({
                name: 'Linked Subject',
                courseId: createdIds.courses[0],
            });
        expect(res.status).toBe(200);
        expect(res.body.courseId).toBe(createdIds.courses[0]);
        createdIds.subjects.push(res.body.id);
    });

    it('POST /api/subjects with default color', async () => {
        const res = await request(app)
            .post('/api/subjects')
            .send({
                name: 'Default Color Subject',
                courseId: createdIds.courses[0]
            });
        expect(res.status).toBe(200);
        expect(res.body.color).toBe('#4f46e5');
        createdIds.subjects.push(res.body.id);
    });

    it('POST /api/subjects returns 400 if courseId is missing', async () => {
        const res = await request(app)
            .post('/api/subjects')
            .send({ name: 'No Course Subject' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Course is mandatory');
    });

    it('GET /api/subjects returns array with lessonPlans and Course', async () => {
        const res = await request(app).get('/api/subjects');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const testSubj = res.body.find((s: any) => s.name === 'Test Subject');
        expect(testSubj).toBeDefined();
        expect(testSubj).toHaveProperty('lessonPlans');
    });

    it('PUT /api/subjects/:id returns 400 if courseId is missing', async () => {
        const id = createdIds.subjects[0];
        const res = await request(app)
            .put(`/api/subjects/${id}`)
            .send({ name: 'Updated Subject', description: 'Updated', color: '#00ff00', courseId: '' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Course is mandatory');
    });

    it('PUT /api/subjects/:id with courseId', async () => {
        const id = createdIds.subjects[0];
        const res = await request(app)
            .put(`/api/subjects/${id}`)
            .send({ name: 'Updated Subject', description: 'Updated', color: '#00ff00', courseId: createdIds.courses[0] });
        expect(res.status).toBe(200);
        expect(res.body.courseId).toBe(createdIds.courses[0]);
    });

    it('DELETE /api/subjects/:id deletes a subject', async () => {
        const create = await request(app)
            .post('/api/subjects')
            .send({ name: 'To Delete Subject', courseId: createdIds.courses[0] });
        const res = await request(app).delete(`/api/subjects/${create.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('DELETE /api/subjects/:id returns 500 for non-existent', async () => {
        const res = await request(app).delete('/api/subjects/999999');
        expect(res.status).toBe(500);
    });
});

// =============================================================
// Study Sessions
// =============================================================
describe('Sessions API', () => {
    it('POST /api/sessions creates a session', async () => {
        const res = await request(app)
            .post('/api/sessions')
            .send({
                subjectId: createdIds.subjects[0],
                topic: 'Test Topic',
                startTime: '2026-01-15T10:00:00Z',
                endTime: '2026-01-15T11:00:00Z',
                isReview: false,
                notes: 'Some notes',
            });
        expect(res.status).toBe(200);
        expect(res.body.topic).toBe('Test Topic');
        expect(res.body).toHaveProperty('Subject');
        createdIds.sessions.push(res.body.id);
    });

    it('POST /api/sessions with lessonPlanId null', async () => {
        const res = await request(app)
            .post('/api/sessions')
            .send({
                subjectId: createdIds.subjects[0],
                topic: 'No Lesson',
                startTime: '2026-01-20T10:00:00Z',
                endTime: '2026-01-20T11:00:00Z',
                isReview: true,
            });
        expect(res.status).toBe(200);
        expect(res.body.lessonPlanId).toBeNull();
        expect(res.body.isReview).toBe(true);
        createdIds.sessions.push(res.body.id);
    });

    it('GET /api/sessions returns array with relations', async () => {
        const res = await request(app).get('/api/sessions');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('DELETE /api/sessions/:id deletes a session', async () => {
        const create = await request(app)
            .post('/api/sessions')
            .send({
                subjectId: createdIds.subjects[0],
                topic: 'To delete',
                startTime: '2026-01-20T10:00:00Z',
                endTime: '2026-01-20T11:00:00Z',
                isReview: false,
            });
        const res = await request(app).delete(`/api/sessions/${create.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('DELETE /api/sessions/:id returns 500 for non-existent', async () => {
        const res = await request(app).delete('/api/sessions/999999');
        expect(res.status).toBe(500);
    });
});

// =============================================================
// Templates
// =============================================================
describe('Templates API', () => {
    it('POST /api/templates creates a template with items', async () => {
        const res = await request(app)
            .post('/api/templates')
            .send({
                name: 'Test Template',
                description: 'A test checklist',
                items: ['Step 1', 'Step 2', 'Step 3'],
            });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test Template');
        expect(res.body.items).toHaveLength(3);
        expect(res.body.items[0].text).toBe('Step 1');
        expect(res.body.items[0].order).toBe(0);
        createdIds.templates.push(res.body.id);
    });

    it('GET /api/templates returns templates with ordered items', async () => {
        const res = await request(app).get('/api/templates');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const found = res.body.find((t: any) => t.name === 'Test Template');
        expect(found).toBeDefined();
        expect(found.items).toHaveLength(3);
    });

    it('DELETE /api/templates/:id deletes a template', async () => {
        const create = await request(app)
            .post('/api/templates')
            .send({ name: 'To Delete Template', items: ['a'] });
        const res = await request(app).delete(`/api/templates/${create.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('DELETE /api/templates/:id returns 500 for non-existent', async () => {
        const res = await request(app).delete('/api/templates/999999');
        expect(res.status).toBe(500);
    });

    it('PUT /api/templates/:id updates name, description and replaces items', async () => {
        const id = createdIds.templates[0];
        const res = await request(app)
            .put(`/api/templates/${id}`)
            .send({
                name: 'Updated Template',
                description: 'Updated description',
                items: ['New Step A', 'New Step B'],
            });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Updated Template');
        expect(res.body.description).toBe('Updated description');
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0].text).toBe('New Step A');
    });
});

// =============================================================
// Lesson Plans
// =============================================================
describe('Lessons API', () => {
    it('POST /api/lessons creates a lesson without template', async () => {
        const res = await request(app)
            .post('/api/lessons')
            .send({
                title: 'Test Lesson',
                subjectId: createdIds.subjects[0],
                content: 'Some content',
                plannedDate: '2026-03-01',
            });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Test Lesson');
        expect(res.body).toHaveProperty('Subject');
        expect(res.body.isCompleted).toBe(false);
        createdIds.lessons.push(res.body.id);
    });

    it('POST /api/lessons creates a lesson with template', async () => {
        const res = await request(app)
            .post('/api/lessons')
            .send({
                title: 'Templated Lesson',
                subjectId: createdIds.subjects[0],
                content: 'Content',
                plannedDate: '2026-03-02',
                templateId: createdIds.templates[0],
            });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Templated Lesson');
        expect(res.body.checklist).toHaveLength(3);
        expect(res.body.checklist[0].isCompleted).toBe(false);
        createdIds.lessons.push(res.body.id);
    });

    it('POST /api/lessons with non-existent templateId creates lesson without checklist', async () => {
        const res = await request(app)
            .post('/api/lessons')
            .send({
                title: 'No Template Match',
                subjectId: createdIds.subjects[0],
                plannedDate: '2026-03-03',
                templateId: 999999,
            });
        expect(res.status).toBe(200);
        expect(res.body.checklist).toHaveLength(0);
        createdIds.lessons.push(res.body.id);
    });

    it('GET /api/lessons returns all lessons', async () => {
        const res = await request(app).get('/api/lessons');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/lessons/upcoming returns upcoming incomplete lessons', async () => {
        const res = await request(app).get('/api/lessons/upcoming');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // All results should have Subject relation
        for (const lesson of res.body) {
            expect(lesson).toHaveProperty('Subject');
            expect(lesson.isCompleted).toBe(false);
        }
    });

    it('PUT /api/lessons/:id updates a lesson', async () => {
        const id = createdIds.lessons[0];
        const res = await request(app)
            .put(`/api/lessons/${id}`)
            .send({
                title: 'Updated Lesson',
                subjectId: createdIds.subjects[0],
                content: 'Updated content',
                plannedDate: '2026-03-05',
            });
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Lesson');
        expect(res.body).toHaveProperty('checklist');
    });

    it('PUT /api/lessons/:id/complete toggles completion', async () => {
        const id = createdIds.lessons[0];
        const res = await request(app)
            .put(`/api/lessons/${id}/complete`)
            .send({ isCompleted: true });
        expect(res.status).toBe(200);
        expect(res.body.isCompleted).toBe(true);

        // Toggle back
        const res2 = await request(app)
            .put(`/api/lessons/${id}/complete`)
            .send({ isCompleted: false });
        expect(res2.status).toBe(200);
        expect(res2.body.isCompleted).toBe(false);
    });

    it('PUT /api/lessons/checklist-items/:id/toggle toggles a checklist item', async () => {
        const lesson = await request(app).get('/api/lessons');
        const withChecklist = lesson.body.find((l: any) => l.checklist && l.checklist.length > 0);
        expect(withChecklist).toBeDefined();

        const itemId = withChecklist.checklist[0].id;
        const res = await request(app)
            .put(`/api/lessons/checklist-items/${itemId}/toggle`);
        expect(res.status).toBe(200);
        expect(res.body.isCompleted).toBe(true); // was false, now toggled

        // Toggle back
        const res2 = await request(app)
            .put(`/api/lessons/checklist-items/${itemId}/toggle`);
        expect(res2.status).toBe(200);
        expect(res2.body.isCompleted).toBe(false);
    });

    it('PUT /api/lessons/checklist-items/:id/toggle auto-completes lesson when all items done', async () => {
        // Get the templated lesson (has 3 items)
        const lessonsRes = await request(app).get('/api/lessons');
        const templatedLesson = lessonsRes.body.find(
            (l: any) => l.title === 'Templated Lesson'
        );
        expect(templatedLesson).toBeDefined();

        // Toggle all items to completed
        for (const item of templatedLesson.checklist) {
            if (!item.isCompleted) {
                await request(app).put(`/api/lessons/checklist-items/${item.id}/toggle`);
            }
        }

        // Check that lesson is now completed
        const updated = await request(app).get('/api/lessons');
        const found = updated.body.find((l: any) => l.id === templatedLesson.id);
        expect(found.isCompleted).toBe(true);

        // Toggle one back → lesson should be incomplete
        await request(app).put(`/api/lessons/checklist-items/${templatedLesson.checklist[0].id}/toggle`);
        const updated2 = await request(app).get('/api/lessons');
        const found2 = updated2.body.find((l: any) => l.id === templatedLesson.id);
        expect(found2.isCompleted).toBe(false);
    });

    it('PUT /api/lessons/checklist-items/:id/toggle returns 404 for non-existent item', async () => {
        const res = await request(app)
            .put('/api/lessons/checklist-items/999999/toggle');
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Item not found');
    });

    it('DELETE /api/lessons/:id deletes a lesson', async () => {
        const create = await request(app)
            .post('/api/lessons')
            .send({
                title: 'To Delete',
                subjectId: createdIds.subjects[0],
                plannedDate: '2026-04-01',
            });
        const res = await request(app).delete(`/api/lessons/${create.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });

    it('DELETE /api/lessons/:id returns 500 for non-existent', async () => {
        const res = await request(app).delete('/api/lessons/999999');
        expect(res.status).toBe(500);
    });
});

// =============================================================
// Exam Results
// =============================================================
describe('Exams API', () => {
    it('POST /api/exams creates an exam result', async () => {
        const res = await request(app)
            .post('/api/exams')
            .send({
                subjectId: createdIds.subjects[0],
                score: 85,
                maxScore: 100,
                date: '2026-01-20',
                notes: 'Good result',
            });
        expect(res.status).toBe(200);
        expect(res.body.score).toBe(85);
        expect(res.body).toHaveProperty('Subject');
        createdIds.exams.push(res.body.id);
    });

    it('GET /api/exams returns exam results', async () => {
        const res = await request(app).get('/api/exams');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /api/exams/:id deletes an exam result', async () => {
        const create = await request(app)
            .post('/api/exams')
            .send({
                subjectId: createdIds.subjects[0],
                score: 90,
                maxScore: 100,
                date: '2026-01-21',
            });
        const res = await request(app).delete(`/api/exams/${create.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
    });
});

// =============================================================
// Stats
// =============================================================
describe('Stats API', () => {
    it('GET /api/stats/summary returns summary', async () => {
        const res = await request(app).get('/api/stats/summary');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('totalSessions');
        expect(res.body).toHaveProperty('totalHours');
        expect(res.body).toHaveProperty('averageScore');
        expect(typeof res.body.totalSessions).toBe('number');
        expect(typeof res.body.totalHours).toBe('number');
    });

    it('GET /api/stats/progress returns overdue count', async () => {
        const res = await request(app).get('/api/stats/progress');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('overdueLessons');
        expect(typeof res.body.overdueLessons).toBe('number');
    });
});

// =============================================================
// Error Path Tests (trigger catch blocks via invalid data)
// =============================================================
describe('Error paths', () => {
    // Courses - POST with null/missing required field
    it('POST /api/courses returns 500 on null name', async () => {
        const res = await request(app).post('/api/courses').send({});
        expect(res.status).toBe(500);
    });

    // Subjects - POST with duplicate name (unique constraint)
    it('POST /api/subjects returns 500 on duplicate name', async () => {
        const res = await request(app).post('/api/subjects').send({ name: 'Updated Subject', courseId: createdIds.courses[0] });
        // 'Updated Subject' already exists from previous tests
        expect(res.status).toBe(500);
    });

    // Subjects - PUT non-existent
    it('PUT /api/subjects/:id returns 400/500 for non-existent', async () => {
        const res = await request(app).put('/api/subjects/999999').send({ name: 'X', courseId: createdIds.courses[0] });
        expect(res.status).toBe(500);
    });

    // Sessions - POST with invalid subjectId (FK constraint)
    it('POST /api/sessions returns 500 on invalid subjectId', async () => {
        const res = await request(app).post('/api/sessions').send({
            subjectId: 999999,
            topic: 'Fail',
            startTime: '2026-01-01T00:00:00Z',
            endTime: '2026-01-01T01:00:00Z',
            isReview: false,
        });
        expect(res.status).toBe(500);
    });

    // Templates - POST without items (will fail on .map)
    it('POST /api/templates returns 500 on missing items', async () => {
        const res = await request(app).post('/api/templates').send({ name: 'Fail' });
        expect(res.status).toBe(500);
    });

    // Lessons - POST with invalid subjectId
    it('POST /api/lessons returns 500 on invalid subjectId', async () => {
        const res = await request(app).post('/api/lessons').send({
            title: 'Fail',
            subjectId: 999999,
            plannedDate: '2026-01-01',
        });
        expect(res.status).toBe(500);
    });

    // Lessons - PUT non-existent
    it('PUT /api/lessons/:id returns 500 for non-existent', async () => {
        const res = await request(app).put('/api/lessons/999999').send({
            title: 'Fail',
            subjectId: 1,
            plannedDate: '2026-01-01',
        });
        expect(res.status).toBe(500);
    });

    // Lessons - PUT complete non-existent
    it('PUT /api/lessons/:id/complete returns 500 for non-existent', async () => {
        const res = await request(app).put('/api/lessons/999999/complete').send({ isCompleted: true });
        expect(res.status).toBe(500);
    });

    // Exams - POST with invalid subjectId
    it('POST /api/exams returns 500 on invalid subjectId', async () => {
        const res = await request(app).post('/api/exams').send({
            subjectId: 999999,
            score: 10,
            maxScore: 100,
            date: '2026-01-01',
        });
        expect(res.status).toBe(500);
    });
});

