import { describe, it, expect } from 'vitest';
import { parseLocalDate, isSameLocalDate } from './dateUtils';

describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD string to local midnight', () => {
        const result = parseLocalDate('2026-02-25');
        expect(result.getFullYear()).toBe(2026);
        expect(result.getMonth()).toBe(1); // February = 1 (0-indexed)
        expect(result.getDate()).toBe(25);
        expect(result.getHours()).toBe(0);
    });

    it('parses ISO string ignoring time component', () => {
        const result = parseLocalDate('2026-02-25T23:59:59.000Z');
        expect(result.getFullYear()).toBe(2026);
        expect(result.getMonth()).toBe(1);
        expect(result.getDate()).toBe(25);
    });

    it('returns current date for empty string', () => {
        const before = new Date();
        const result = parseLocalDate('');
        const after = new Date();
        expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
        expect(result.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
    });

    it('handles different months correctly', () => {
        const result = parseLocalDate('2026-12-01');
        expect(result.getMonth()).toBe(11); // December = 11
        expect(result.getDate()).toBe(1);
    });
});

describe('isSameLocalDate', () => {
    it('returns true for same date', () => {
        const date = new Date(2026, 1, 25); // Feb 25 local
        expect(isSameLocalDate('2026-02-25T00:00:00.000Z', date)).toBe(true);
    });

    it('returns false for different date', () => {
        const date = new Date(2026, 1, 24); // Feb 24 local
        expect(isSameLocalDate('2026-02-25T00:00:00.000Z', date)).toBe(false);
    });

    it('returns true for same day with ISO string', () => {
        const date = new Date(2026, 5, 15); // June 15 local
        expect(isSameLocalDate('2026-06-15', date)).toBe(true);
    });

    it('returns false for different month', () => {
        const date = new Date(2026, 2, 25); // March 25
        expect(isSameLocalDate('2026-02-25', date)).toBe(false);
    });

    it('returns false for different year', () => {
        const date = new Date(2025, 1, 25); // Feb 25, 2025
        expect(isSameLocalDate('2026-02-25', date)).toBe(false);
    });
});
