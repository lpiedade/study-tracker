import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Results from '../../src/pages/Results';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock('../../src/lib/api', () => ({
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

    const setupMocks = (exams: any[] = [], subjects: any[] = []) => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/exams') return Promise.resolve({ data: exams });
            if (url === '/subjects') return Promise.resolve({ data: subjects });
            return Promise.resolve({ data: [] });
        });
    };

    it('shows loading', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Results />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        setupMocks([], []);
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('No exam results recorded.')).toBeInTheDocument();
        });
    });

    it('renders exam results with passing scores (green)', async () => {
        setupMocks(
            [{ id: 1, score: 85, maxScore: 100, date: '2026-01-20', Subject: { name: 'Math' } }],
            []
        );
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Math')).toBeInTheDocument();
            expect(screen.getByText('85 / 100')).toBeInTheDocument();
            const badge = screen.getByText('85.0%');
            expect(badge.className).toContain('bg-green-100');
        });
    });

    it('renders failing scores with red badge', async () => {
        setupMocks(
            [{ id: 2, score: 50, maxScore: 100, date: '2026-01-20', Subject: { name: 'Physics' } }],
            []
        );
        render(<Results />);
        await waitFor(() => {
            const badge = screen.getByText('50.0%');
            expect(badge.className).toContain('bg-red-100');
        });
    });

    it('renders Unknown for missing subject', async () => {
        setupMocks(
            [{ id: 3, score: 70, maxScore: 100, date: '2026-01-20' }],
            []
        );
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    it('renders form and submits exam result', async () => {
        setupMocks([], [{ id: 1, name: 'Chemistry' }]);
        mockPost.mockResolvedValue({});
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Add Result')).toBeInTheDocument();
        });

        // Use select for subject
        const subjectSelect = screen.getByRole('combobox');
        await userEvent.selectOptions(subjectSelect, '1');

        // Note: score and maxScore are number inputs, so they don't have 'combobox' or 'textbox' usually.
        // But for this test we only focus on the subject and submission.

        fireEvent.submit(subjectSelect.closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/exams', expect.objectContaining({ subjectId: '1' }));
        });
    });

    it('shows alert on submit error', async () => {
        setupMocks([], [{ id: 1, name: 'Fail' }]);
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Results />);
        await waitFor(() => {
            expect(screen.getByText('Add Result')).toBeInTheDocument();
        });

        const subjectSelect = screen.getByRole('combobox');
        await userEvent.selectOptions(subjectSelect, '1');
        fireEvent.submit(subjectSelect.closest('form')!);

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
