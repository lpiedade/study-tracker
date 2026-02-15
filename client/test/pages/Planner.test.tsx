import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Planner from '../../src/pages/Planner';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
vi.mock('../lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
        put: (...args: any[]) => mockPut(...args),
        delete: (...args: any[]) => mockDelete(...args),
    },
}));

describe('Planner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => { });
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    const setupMocks = (lessons: any[] = [], sessions: any[] = [], subjects: any[] = [], templates: any[] = []) => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/lessons') return Promise.resolve({ data: lessons });
            if (url === '/sessions') return Promise.resolve({ data: sessions });
            if (url === '/subjects') return Promise.resolve({ data: subjects });
            if (url === '/templates') return Promise.resolve({ data: templates });
            return Promise.resolve({ data: [] });
        });
    };

    it('shows loading', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Planner />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty lessons state', async () => {
        setupMocks();
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('No lessons planned.')).toBeInTheDocument();
        });
    });

    it('renders lesson plans after loading', async () => {
        setupMocks([
            { id: 1, title: 'Algebra Lesson', subjectId: 1, Subject: { name: 'Math', color: '#ff0000' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [] },
        ]);
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Algebra Lesson')).toBeInTheDocument();
        });
    });

    it('renders completed lesson with line-through', async () => {
        setupMocks([
            { id: 1, title: 'Done', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: true, checklist: [] },
        ]);
        render(<Planner />);
        await waitFor(() => {
            const title = screen.getByText('Done');
            expect(title.className).toContain('line-through');
        });
    });

    it('renders lesson with checklist progress', async () => {
        setupMocks([
            {
                id: 1, title: 'L1', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [
                    { id: 1, text: 'Step A', isCompleted: true },
                    { id: 2, text: 'Step B', isCompleted: false },
                ]
            },
        ]);
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Step A')).toBeInTheDocument();
            expect(screen.getByText('Checklist (1/2)')).toBeInTheDocument();
        });
    });

    it('toggles checklist item', async () => {
        setupMocks([
            {
                id: 1, title: 'L1', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [
                    { id: 42, text: 'Toggle Me', isCompleted: false },
                ]
            },
        ]);
        mockPut.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Toggle Me')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Toggle Me'));
        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledWith('/lessons/checklist-items/42/toggle');
        });
    });

    it('toggles lesson completion', async () => {
        setupMocks([
            { id: 5, title: 'Toggle Lesson', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [] },
        ]);
        mockPut.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Toggle Lesson')).toBeInTheDocument();
        });
        // Click the CheckCircle button
        const checkBtn = screen.getByText('Toggle Lesson').closest('div[class*="p-6 flex"]')!.querySelector('button')!;
        fireEvent.click(checkBtn);
        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledWith('/lessons/5/complete', { isCompleted: true });
        });
    });

    it('switches to sessions tab', async () => {
        setupMocks([], [
            { id: 1, topic: 'Derivatives', startTime: '2026-01-10T08:00:00Z', endTime: '2026-01-10T09:00:00Z', isReview: false, Subject: { name: 'Calculus' } },
        ]);
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Session History')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Session History'));
        expect(screen.getByText('Derivatives')).toBeInTheDocument();
    });

    it('shows empty sessions state', async () => {
        setupMocks();
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
            expect(screen.getByText('No sessions logged.')).toBeInTheDocument();
        });
    });

    it('renders session with linked lesson', async () => {
        setupMocks([], [
            { id: 1, topic: 'Study', startTime: '2026-01-10T08:00:00Z', endTime: '2026-01-10T09:00:00Z', isReview: false, Subject: { name: 'Calc' }, LessonPlan: { title: 'Chapter 5' } },
        ]);
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
        });
        expect(screen.getByText('Lesson: Chapter 5')).toBeInTheDocument();
    });

    it('renders session with review badge', async () => {
        setupMocks([], [
            { id: 1, topic: 'Rev', startTime: '2026-01-10T08:00:00Z', endTime: '2026-01-10T09:00:00Z', isReview: true, Subject: { name: 'Calc' } },
        ]);
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
        });
        expect(screen.getAllByText(/Review/).length).toBeGreaterThanOrEqual(1);
    });

    it('deletes a session', async () => {
        setupMocks([], [
            { id: 99, topic: 'Del Me', startTime: '2026-01-10T08:00:00Z', endTime: '2026-01-10T09:00:00Z', isReview: false, Subject: { name: 'Calc' } },
        ]);
        mockDelete.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
        });
        // Find the delete button for the session
        const sessionRow = screen.getByText('Del Me').closest('div[class*="p-6 flex"]')!;
        const deleteBtn = sessionRow.querySelectorAll('button')[0]!;
        fireEvent.click(deleteBtn);
        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/sessions/99');
        });
    });

    it('creates a lesson via form', async () => {
        setupMocks([], [], [{ id: 1, name: 'Math' }]);
        mockPost.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Add New Lesson')).toBeInTheDocument();
        });

        // Fill title
        const titleInput = screen.getByRole('textbox');
        await userEvent.type(titleInput, 'New Lesson');

        // Select subject
        const subjectSelect = screen.getByRole('combobox', { name: /subject/i }) as HTMLSelectElement;
        await userEvent.selectOptions(subjectSelect, '1');

        fireEvent.submit(titleInput.closest('form')!);
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/lessons', expect.objectContaining({ title: 'New Lesson' }));
        });
    });

    it('shows alert on lesson create error', async () => {
        setupMocks([], [], [{ id: 1, name: 'Math' }]);
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Add New Lesson')).toBeInTheDocument();
        });

        const titleInput = screen.getByRole('textbox');
        await userEvent.type(titleInput, 'Fail');
        fireEvent.submit(titleInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to save lesson');
        });
    });

    it('starts and cancels editing a lesson', async () => {
        setupMocks([
            { id: 1, title: 'Edit Me', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [] },
        ], [], [{ id: 1, name: 'Math' }]);
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Edit Me')).toBeInTheDocument();
        });

        // Click edit button
        const lessonRow = screen.getByText('Edit Me').closest('div[class*="p-6 flex"]')!;
        const editBtn = lessonRow.querySelectorAll('button')[1]!; // Edit button
        fireEvent.click(editBtn);

        await waitFor(() => {
            expect(screen.getByText('Edit Lesson')).toBeInTheDocument();
            expect(screen.getByText('Update Lesson')).toBeInTheDocument();
        });
    });

    it('opens delete modal and confirms', async () => {
        setupMocks([
            { id: 7, title: 'Del Lesson', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [] },
        ]);
        mockDelete.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Del Lesson')).toBeInTheDocument();
        });

        // Click delete button
        const lessonRow = screen.getByText('Del Lesson').closest('div[class*="p-6 flex"]')!;
        const deleteBtn = lessonRow.querySelectorAll('button')[2]!; // Delete button
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText('Delete Lesson')).toBeInTheDocument();
        });

        // Confirm delete
        fireEvent.click(screen.getByText('Delete'));
        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/lessons/7');
        });
    });

    it('opens delete modal and cancels', async () => {
        setupMocks([
            { id: 7, title: 'Cancel Del', subjectId: 1, Subject: { name: 'Math' }, plannedDate: '2026-03-01', isCompleted: false, checklist: [] },
        ]);
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Cancel Del')).toBeInTheDocument();
        });

        const lessonRow = screen.getByText('Cancel Del').closest('div[class*="p-6 flex"]')!;
        const deleteBtn = lessonRow.querySelectorAll('button')[2]!;
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(screen.getByText('Delete Lesson')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByText('Delete Lesson')).not.toBeInTheDocument();
    });

    it('renders session form when on sessions tab', async () => {
        setupMocks();
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
            expect(screen.getAllByText(/Log Session/).length).toBeGreaterThanOrEqual(1);
        });
    });

    it('creates a session via form', async () => {
        setupMocks([], [], [{ id: 1, name: 'Math' }]);
        mockPost.mockResolvedValue({});
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
        });

        // Fill subject
        const subjectSelects = screen.getAllByRole('combobox');
        await userEvent.selectOptions(subjectSelects[0], '1');

        // Fill topic
        const topicInput = screen.getByRole('textbox');
        await userEvent.type(topicInput, 'Study topic');

        fireEvent.submit(topicInput.closest('form')!);
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/sessions', expect.objectContaining({ topic: 'Study topic' }));
        });
    });

    it('shows alert on session create error', async () => {
        setupMocks([], [], [{ id: 1, name: 'Math' }]);
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Planner />);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Session History'));
        });

        const topicInput = screen.getByRole('textbox');
        await userEvent.type(topicInput, 'Fail');
        fireEvent.submit(topicInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to log session');
        });
    });

    it('handles fetch error', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Planner />);
        await waitFor(() => {
            expect(screen.getByText('Study Planner')).toBeInTheDocument();
        });
    });
});
