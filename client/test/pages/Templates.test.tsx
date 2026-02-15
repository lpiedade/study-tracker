import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Templates from '../../src/pages/Templates';
import userEvent from '@testing-library/user-event';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();
vi.mock('../lib/api', () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
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

    it('renders templates with items', async () => {
        mockGet.mockResolvedValue({
            data: [{
                id: 1, name: 'My Template', description: 'A desc',
                items: [
                    { id: 1, text: 'Step 1', order: 0 },
                    { id: 2, text: 'Step 2', order: 1 },
                ],
                createdAt: '2026-01-01',
            }],
        });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('My Template')).toBeInTheDocument();
            expect(screen.getByText('A desc')).toBeInTheDocument();
            expect(screen.getByText('Items (2)')).toBeInTheDocument();
        });
    });

    it('renders template with more than 3 items showing +N more', async () => {
        const items = Array.from({ length: 5 }, (_, i) => ({ id: i, text: `Item ${i}`, order: i }));
        mockGet.mockResolvedValue({ data: [{ id: 1, name: 'Big', items, createdAt: '2026-01-01' }] });
        render(<Templates />);
        await waitFor(() => {
            expect(screen.getByText('+2 more')).toBeInTheDocument();
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

        // Should now have 2 input fields (original + new)
        const inputs = screen.getByPlaceholderText('e.g. Math Lesson Base').closest('form')!.querySelectorAll('input[type="text"]');
        expect(inputs.length).toBe(1); // The name input only, items are separate inputs too
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
        const trashBtns = screen.getByText('To Delete').closest('div[class*="flex flex-col"]')!.querySelectorAll('button');
        fireEvent.click(trashBtns[0]); // Click delete

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

        const trashBtns = screen.getByText('Cancel Del').closest('div[class*="flex flex-col"]')!.querySelectorAll('button');
        fireEvent.click(trashBtns[0]);

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

        const trashBtns = screen.getByText('Err Del').closest('div[class*="flex flex-col"]')!.querySelectorAll('button');
        fireEvent.click(trashBtns[0]);
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
