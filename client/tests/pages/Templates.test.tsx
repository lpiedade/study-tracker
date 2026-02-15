import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Templates from '../../src/pages/Templates';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
vi.mock('../../src/lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
        put: (...args: any[]) => mockPut(...args),
        delete: (...args: any[]) => mockDelete(...args),
    },
}));

describe('Templates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('shows loading', () => {
        mockGet.mockReturnValue(new Promise(() => { }));
        render(<Templates />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('No templates created yet.')).toBeInTheDocument();
        });
    });

    it('renders templates with all items (no truncation)', async () => {
        const items = Array.from({ length: 5 }, (_, i) => ({ id: i, text: `Item ${i}`, order: i }));
        mockGet.mockResolvedValue({
            data: [{
                id: 1, name: 'My Template', description: 'A desc',
                items,
                createdAt: '2026-01-01',
            }],
        });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('My Template')).toBeInTheDocument();
            expect(screen.getByText('Items (5)')).toBeInTheDocument();
            // Should show all items
            items.forEach(item => {
                expect(screen.getByText(item.text)).toBeInTheDocument();
            });
            // Should NOT show "+N more" since truncation is removed
            expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
        });
    });

    it('renders create form', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getAllByText(/Create Template/).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(/Add Item/).length).toBeGreaterThanOrEqual(1);
        });
    });

    it('creates a template via form', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockResolvedValue({});
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText('e.g. Math Lesson Base')).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('e.g. Math Lesson Base');
        await userEvent.type(nameInput, 'Test Template');
        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/templates', expect.objectContaining({ name: 'Test Template' }));
        });
    });

    it('populates form and updates template via edit', async () => {
        const template = {
            id: 1, name: 'Original', description: 'Old desc',
            items: [{ id: 1, text: 'Old Item', order: 0 }],
            createdAt: '2026-01-01'
        };
        mockGet.mockResolvedValue({ data: [template] });
        mockPut.mockResolvedValue({});

        render(<Templates />);
        await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument());

        // Click Edit button (it's the first button in the actions div in the current implementation)
        const editBtn = screen.getByRole('button', { name: '' }); // Edit2 icon has no text, but it's the first in the loop
        // Find it specifically
        const cards = screen.getAllByText('Original')[0].closest('div');
        const actionBtns = cards?.querySelectorAll('button');
        fireEvent.click(actionBtns![0]); // Edit icon button

        // Verify form populates
        await waitFor(() => {
            expect(screen.getByDisplayValue('Original')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Old desc')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Old Item')).toBeInTheDocument();
            expect(screen.getByText('Update Template')).toBeInTheDocument();
        });

        // Toggle edit
        const nameInput = screen.getByDisplayValue('Original');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledWith('/templates/1', expect.objectContaining({ name: 'Updated Name' }));
        });
    });

    it('cancels editing', async () => {
        const template = {
            id: 1, name: 'Original', description: 'Old desc',
            items: [{ id: 1, text: 'Old Item', order: 0 }],
            createdAt: '2026-01-01'
        };
        mockGet.mockResolvedValue({ data: [template] });

        render(<Templates />);
        await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument());

        const cards = screen.getAllByText('Original')[0].closest('div');
        const actionBtns = cards?.querySelectorAll('button');
        fireEvent.click(actionBtns![0]); // Edit

        await waitFor(() => expect(screen.getByText('Edit Template')).toBeInTheDocument());

        // Click X button to cancel
        const cancelBtn = screen.getByText('Edit Template').closest('div')?.querySelector('button');
        fireEvent.click(cancelBtn!);

        await waitFor(() => {
            expect(screen.getByText('Create Template')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('Original')).not.toBeInTheDocument();
        });
    });

    it('shows alert on create error', async () => {
        mockGet.mockResolvedValue({ data: [] });
        mockPost.mockRejectedValue(new Error('fail'));
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByPlaceholderText('e.g. Math Lesson Base')).toBeInTheDocument();
        });

        const nameInput = screen.getByPlaceholderText('e.g. Math Lesson Base');
        await userEvent.type(nameInput, 'Fail');
        fireEvent.submit(nameInput.closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to create template');
        });
    });

    it('adds and removes checklist items in form', async () => {
        mockGet.mockResolvedValue({ data: [] });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getAllByText(/Add Item/).length).toBeGreaterThanOrEqual(1);
        });

        // Click Add Item
        const addBtn = screen.getAllByText(/Add Item/)[0];
        fireEvent.click(addBtn);

        // Should now have 3 input fields (name + 2 items)
        const inputs = screen.getByPlaceholderText('e.g. Math Lesson Base').closest('form')!.querySelectorAll('input[type="text"]');
        expect(inputs.length).toBe(3);
    });

    it('triggers delete confirmation flow', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 1, name: 'To Delete', items: [{ id: 1, text: 'X', order: 0 }], createdAt: '2026-01-01' }],
        });
        mockDelete.mockResolvedValue({});
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('To Delete')).toBeInTheDocument();
        });

        // Click trash icon to start delete
        const cards = screen.getAllByText('To Delete')[0].closest('div');
        const actionBtns = cards?.querySelectorAll('button');
        fireEvent.click(actionBtns![1]); // Delete icon button

        // Should show "Sure?" confirmation
        await waitFor(() => {
            expect(screen.getByText('Sure?')).toBeInTheDocument();
        });

        // Confirm delete
        fireEvent.click(screen.getByText('Yes'));
        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('/templates/1');
        });
    });

    it('cancels delete', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 1, name: 'Cancel Del', items: [{ id: 1, text: 'X', order: 0 }], createdAt: '2026-01-01' }],
        });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('Cancel Del')).toBeInTheDocument();
        });

        const cards = screen.getAllByText('Cancel Del')[0].closest('div');
        const actionBtns = cards?.querySelectorAll('button');
        fireEvent.click(actionBtns![1]);

        await waitFor(() => {
            expect(screen.getByText('Sure?')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('No'));
        expect(screen.queryByText('Sure?')).not.toBeInTheDocument();
    });

    it('shows alert on delete error', async () => {
        mockGet.mockResolvedValue({
            data: [{ id: 1, name: 'Err Del', items: [{ id: 1, text: 'X', order: 0 }], createdAt: '2026-01-01' }],
        });
        mockDelete.mockRejectedValue(new Error('fail'));
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('Err Del')).toBeInTheDocument();
        });

        const cards = screen.getAllByText('Err Del')[0].closest('div');
        const actionBtns = cards?.querySelectorAll('button');
        fireEvent.click(actionBtns![1]);
        await waitFor(() => { expect(screen.getByText('Sure?')).toBeInTheDocument(); });
        fireEvent.click(screen.getByText('Yes'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to delete template');
        });
    });

    it('handles fetch error', async () => {
        mockGet.mockRejectedValue(new Error('fail'));
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('Checklist Templates')).toBeInTheDocument();
        });
    });
});
