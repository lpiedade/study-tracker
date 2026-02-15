import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import NextClasses from '../../src/components/NextClasses';

const mockGet = vi.fn();
vi.mock('../../src/lib/api', () => ({
    default: { get: (...args: any[]) => mockGet(...args) },
}));

describe('NextClasses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', () => {
        mockGet.mockReturnValue(new Promise(() => { })); // never resolves
        render(<NextClasses />);
        expect(screen.getByText('Loading upcoming classes...')).toBeInTheDocument();
    });

    it('shows empty state when no upcoming lessons', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<NextClasses />);
        await waitFor(() => {
            expect(screen.getByText('No upcoming classes scheduled.')).toBeInTheDocument();
        });
    });

    it('renders upcoming lessons', async () => {
        mockGet.mockResolvedValue({
            data: [
                {
                    id: 1,
                    title: 'Lesson 1',
                    subjectId: 1,
                    Subject: { name: 'Math' },
                    plannedDate: '2026-03-01',
                    isCompleted: false,
                },
            ],
        });
        render(<NextClasses />);
        await waitFor(() => {
            expect(screen.getByText('Math')).toBeInTheDocument();
            expect(screen.getByText('Lesson 1')).toBeInTheDocument();
        });
    });

    it('shows Unknown for missing Subject', async () => {
        mockGet.mockResolvedValue({
            data: [
                { id: 2, title: 'Orphan', subjectId: 99, plannedDate: '2026-03-01', isCompleted: false },
            ],
        });
        render(<NextClasses />);
        await waitFor(() => {
            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    it('handles API error gracefully', async () => {
        mockGet.mockRejectedValue(new Error('Network'));
        render(<NextClasses />);
        await waitFor(() => {
            expect(screen.getByText('No upcoming classes scheduled.')).toBeInTheDocument();
        });
    });
});
