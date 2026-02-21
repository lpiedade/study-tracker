import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('API Routes', () => {
    it('GET /api/sessions returns 200 and array', async () => {
        const res = await request(app).get('/api/sessions');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/lessons returns 200 and array', async () => {
        const res = await request(app).get('/api/lessons');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/stats/summary returns stats object', async () => {
        const res = await request(app).get('/api/stats/summary');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('totalSessions');
        expect(res.body).toHaveProperty('totalHours');
        expect(res.body).toHaveProperty('averageScore');
    });
});
