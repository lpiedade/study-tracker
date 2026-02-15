import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Results from '../../src/pages/Results';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock('../lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
    },
}));

describe('Results', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('shows loading', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Results />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('No exam results recorded.')).toBeInTheDocument();
        });
    });

    it('renders exam results with passing scores (green)', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 1, score: 85, maxScore: 100, date: '2026-01-20', Subject: { name: 'Math' } }],
        });
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Math')).toBeInTheDocument();
            expect(screen.getByText('85 / 100')).toBeInTheDocument();
            const badge = screen.getByText('85.0%');
            expect(badge.className).toContain('bg-green-100');
        });
    });

    it('renders failing scores with red badge', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 2, score: 50, maxScore: 100, date: '2026-01-20', Subject: { name: 'Physics' } }],
        });
        render(<Results />);
        await waitFor(() => {
            const badge = screen.getByText('50.0%');
            expect(badge.className).toContain('bg-red-100');
        });
    });

    it('renders Unknown for missing subject', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 3, score: 70, maxScore: 100, date: '2026-01-20' }],
        });
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    it('renders form and submits exam result', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockResolvedValue({});
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Add Result')).toBeInTheDocument();
        });

        // Find the subject input in the form
        const subjectInput = screen.getByRole('textbox');
        await userEvent.type(subjectInput, 'Chemistry');
        fireEvent.submit(subjectInput.closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/exams', expect.objectContaining({ subject: 'Chemistry' }));
        });
    });

    it('shows alert on submit error', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Add Result')).toBeInTheDocument();
        });

        const subjectInput = screen.getByRole('textbox');
        await userEvent.type(subjectInput, 'Fail');
        fireEvent.submit(subjectInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to add result');
        });
    });

    it('handles fetch error', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Exam Results')).toBeInTheDocument();
        });
    });
});
