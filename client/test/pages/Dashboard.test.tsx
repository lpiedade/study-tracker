import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard';

const mockGet = vi.fn();
vi.mock('../../src/lib/api', () => ({
    default: { get: (...args: any[]) => mockGet(...args) },
}));

// Mock NextClasses since it has its own tests
vi.mock('../../src/components/NextClasses', () => ({
    default: () => <div data-testid="next-classes">NextClasses</div>,
}));

describe('Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Dashboard />);
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('renders stats and sessions after loading', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 10, totalHours: 5.5, averageScore: 88.2 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 2 } });
            if (url === '/sessions') return Promise.resolve({
                data: [
                    { id: 1, topic: 'Algebra', startTime: '2026-01-15T10:00:00Z', endTime: '2026-01-15T11:00:00Z', isReview: false, Subject: { name: 'Math', color: '#ff0000' } },
                ],
            });
            return Promise.resolve({ data: [] });
        });

        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('5.5')).toBeInTheDocument(); // totalHours
            expect(screen.getByText('10')).toBeInTheDocument(); // totalSessions
            expect(screen.getByText('88.2')).toBeInTheDocument(); // averageScore
            expect(screen.getByText('2')).toBeInTheDocument(); // overdue
        });
    });

    it('shows "On track" when no overdue lessons', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 0, totalHours: 0, averageScore: 0 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 0 } });
            if (url === '/sessions') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('On track')).toBeInTheDocument();
        });
    });

    it('shows "Catch up needed!" when overdue > 0', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 1, totalHours: 1, averageScore: 50 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 3 } });
            if (url === '/sessions') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('Catch up needed!')).toBeInTheDocument();
        });
    });

    it('shows empty sessions message', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 0, totalHours: 0, averageScore: 0 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 0 } });
            if (url === '/sessions') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('No recent study sessions found.')).toBeInTheDocument();
        });
    });

    it('renders session with review badge', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 1, totalHours: 1, averageScore: 0 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 0 } });
            if (url === '/sessions') return Promise.resolve({
                data: [
                    { id: 1, topic: 'Review', startTime: '2026-01-15T10:00:00Z', endTime: '2026-01-15T11:00:00Z', isReview: true, Subject: { name: 'Physics' } },
                ],
            });
            return Promise.resolve({ data: [] });
        });
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('renders session with lesson plan info', async () => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/stats/summary') return Promise.resolve({ data: { totalSessions: 1, totalHours: 1, averageScore: 0 } });
            if (url === '/stats/progress') return Promise.resolve({ data: { overdueLessons: 0 } });
            if (url === '/sessions') return Promise.resolve({
                data: [
                    { id: 1, topic: 'Study', startTime: '2026-01-15T10:00:00Z', endTime: '2026-01-15T11:00:00Z', isReview: false, Subject: { name: 'Bio' }, LessonPlan: { title: 'Chapter 5' } },
                ],
            });
            return Promise.resolve({ data: [] });
        });
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('Chapter 5')).toBeInTheDocument();
        });
    });

    it('handles API error gracefully', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Dashboard />);
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });
});
