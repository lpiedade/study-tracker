import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Courses from '../../src/pages/Courses';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();
vi.mock('../../src/lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
        delete: (...args: any[]) => mockDelete(...args),
    },
}));

describe('Courses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Stub confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('shows loading state', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Courses />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText(/No courses created yet/)).toBeInTheDocument();
        });
    });

    it('renders courses list', async () => {
        mockGet.mockResolvedValue({
            data: [
                { id: 1, name: 'CS', description: 'Computer Science', subjects: [{ id: 1, name: 'Algorithms', color: '#ff0000' }] },
            ],
        });
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('CS')).toBeInTheDocument();
            expect(screen.getByText('Computer Science')).toBeInTheDocument();
            expect(screen.getByText('Subjects (1)')).toBeInTheDocument();
            expect(screen.getByText('Algorithms')).toBeInTheDocument();
        });
    });

    it('renders course with more than 3 subjects showing +N more', async () => {
        const subjects = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Sub${i}`, color: '#000' }));
        mockGet.mockResolvedValue({ data: [{ id: 1, name: 'Big Course', subjects }] });
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('+2 more')).toBeInTheDocument();
        });
    });

    it('renders course without description', async () => {
        mockGet.mockResolvedValue({ data: [{ id: 1, name: 'No Desc', subjects: [] }] });
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('No Desc')).toBeInTheDocument();
            expect(screen.getByText('Subjects (0)')).toBeInTheDocument();
        });
    });

    it('creates a course via form', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockResolvedValue({});
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('Add Course')).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('e.g. Computer Science, Economics');
        const descInput = screen.getByPlaceholderText('Optional description...');

        await userEvent.type(nameInput, 'New Course');
        await userEvent.type(descInput, 'A new description');

        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/courses', { name: 'New Course', description: 'A new description' });
        });
    });

    it('shows alert on create error', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('Add Course')).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('e.g. Computer Science, Economics');
        await userEvent.type(nameInput, 'Failing');
        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to create course');
        });
    });

    it('deletes a course when confirmed', async () => {
        mockGet.mockResolvedValue({ data: [{ id: 1, name: 'Delete Me', subjects: [] }] });
        mockDelete.mockResolvedValue({});
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('Delete Me')).toBeInTheDocument();
        });

        // Click delete button (Trash2 icon button)
        const deleteBtn = screen.getByText('Delete Me').closest('div[class*="flex flex-col"]')!.querySelector('button')!;
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/courses/1');
        });
    });

    it('shows alert on delete error', async () => {
        mockGet.mockResolvedValue({ data: [{ id: 1, name: 'Fail Del', subjects: [] }] });
        mockDelete.mockRejectedValue(new Error('error'));
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('Fail Del')).toBeInTheDocument();
        });

        const deleteBtn = screen.getByText('Fail Del').closest('div[class*="flex flex-col"]')!.querySelector('button')!;
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to delete course');
        });
    });

    it('handles API error on fetch', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Courses />);
        await waitFor(() => {
            expect(screen.getByText('Courses')).toBeInTheDocument();
        });
    });
});
