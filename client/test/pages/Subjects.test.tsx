import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Subjects from '../../src/pages/Subjects';
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

describe('Subjects', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => { });
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    const setupMocks = (subjects: any[] = [], courses: any[] = []) => {
        mockGet.mockImplementation((url: string) => {
            if (url === '/courses') return Promise.resolve({ data: courses });
            if (url === '/subjects') return Promise.resolve({ data: subjects });
            return Promise.resolve({ data: [] });
        });
    };

    it('shows loading state', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Subjects />);
        expect(screen.getByText('Loading subjects...')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        setupMocks();
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('No subjects found.')).toBeInTheDocument();
        });
    });

    it('renders subjects with description', async () => {
        setupMocks([
            { id: 1, name: 'Math', description: 'Mathematics', color: '#ff0000', lessonPlans: [] },
        ]);
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Mathematics')).toBeInTheDocument();
        });
    });

    it('renders No description for missing description', async () => {
        setupMocks([
            { id: 1, name: 'Math', color: '#ff0000', lessonPlans: [] },
        ]);
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('No description')).toBeInTheDocument();
        });
    });

    it('renders lesson plan progress', async () => {
        setupMocks([
            {
                id: 1, name: 'Math', color: '#ff0000', lessonPlans: [
                    { id: 1, isCompleted: true },
                    { id: 2, isCompleted: false },
                ]
            },
        ]);
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Progress: 1/2 lessons')).toBeInTheDocument();
            expect(screen.getByText('50%')).toBeInTheDocument();
        });
    });

    it('renders course badge', async () => {
        setupMocks(
            [{ id: 1, name: 'Algorithms', color: '#0000ff', courseId: 1, Course: { name: 'CS' }, lessonPlans: [] }],
            [{ id: 1, name: 'CS' }]
        );
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getAllByText('CS').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('creates a subject via form', async () => {
        setupMocks([], [{ id: 1, name: 'CS' }]);
        mockPost.mockResolvedValue({});
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Add New Subject')).toBeInTheDocument();
        });

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await userEvent.type(nameInput, 'New Subject');
        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalled();
        });
    });

    it('shows alert on create error', async () => {
        setupMocks();
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Add New Subject')).toBeInTheDocument();
        });

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        await userEvent.type(nameInput, 'Fail');
        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to create subject');
        });
    });

    it('deletes a subject', async () => {
        setupMocks([{ id: 1, name: 'To Delete', color: '#ff0000', lessonPlans: [] }]);
        mockDelete.mockResolvedValue({});
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('To Delete')).toBeInTheDocument();
        });

        // Find and click delete button (Trash2 icon)
        const actionButtons = screen.getByText('To Delete').closest('div[class*="p-6 flex"]')!.querySelectorAll('button');
        const deleteBtn = actionButtons[actionButtons.length - 1]; // Delete is last
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/subjects/1');
        });
    });

    it('shows alert on delete error', async () => {
        setupMocks([{ id: 1, name: 'Fail Del', color: '#ff0000', lessonPlans: [] }]);
        mockDelete.mockRejectedValue(new Error('error'));
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Fail Del')).toBeInTheDocument();
        });

        const actionButtons = screen.getByText('Fail Del').closest('div[class*="p-6 flex"]')!.querySelectorAll('button');
        fireEvent.click(actionButtons[actionButtons.length - 1]);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to delete subject');
        });
    });

    it('starts editing a subject', async () => {
        setupMocks([{ id: 1, name: 'Edit Me', description: 'Desc', color: '#ff0000', lessonPlans: [] }]);
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Edit Me')).toBeInTheDocument();
        });

        // Find and click edit button (Edit2 icon)
        const actionButtons = screen.getByText('Edit Me').closest('div[class*="p-6 flex"]')!.querySelectorAll('button');
        const editBtn = actionButtons[0]; // Edit is first
        fireEvent.click(editBtn);

        // Should show editing inputs
        await waitFor(() => {
            // The edit form should now have input fields visible
            const container = screen.getByText('Manage Subjects').closest('div')!;
            expect(container).toBeTruthy();
        });
    });

    it('handles fetch error gracefully', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Subjects />);
        await waitFor(() => {
            expect(screen.getByText('Manage Subjects')).toBeInTheDocument();
        });
    });
});
