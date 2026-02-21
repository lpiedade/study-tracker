import { describe, it, expect } from 'vitest';
import api from '../../src/lib/api';

describe('api', () => {
    it('is an axios instance with correct baseURL', () => {
        expect(api.defaults.baseURL).toBe('http://localhost:3001/api');
    });

    it('has get, post, put, delete methods', () => {
        expect(typeof api.get).toBe('function');
        expect(typeof api.post).toBe('function');
        expect(typeof api.put).toBe('function');
        expect(typeof api.delete).toBe('function');
    });
});
