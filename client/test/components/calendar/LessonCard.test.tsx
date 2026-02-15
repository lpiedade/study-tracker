import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonCard from '../../../src/components/calendar/LessonCard';

// Mock dnd-kit
const mockUseDraggable = vi.fn(() => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    isDragging: false,
}));

vi.mock('@dnd-kit/core', () => ({
    useDraggable: () => mockUseDraggable(),
}));

describe('LessonCard', () => {
    it('renders lesson title', () => {
        const lesson = { id: 1, title: 'Algebra', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false, checklist: [] } as any;
        render(<LessonCard lesson={lesson} subjectColor="#ff0000" />);
        expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    it('renders completed lesson with line-through', () => {
        const lesson = { id: 2, title: 'Done Task', subjectId: 1, plannedDate: '2026-03-01', isCompleted: true, checklist: [] } as any;
        render(<LessonCard lesson={lesson} />);
        const title = screen.getByText('Done Task');
        expect(title.className).toContain('line-through');
    });

    it('renders incomplete overdue lesson (missed)', () => {
        const pastDate = new Date(2020, 0, 1).toISOString();
        const lesson = { id: 3, title: 'Missed', subjectId: 1, plannedDate: pastDate, isCompleted: false, checklist: [] } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        // Lucide icons render as svg. AlertCircle often has a class with it or just look for the svg.
        expect(container.querySelector('svg.text-red-500')).toBeTruthy();
    });

    it('renders checklist progress bar', () => {
        const lesson = {
            id: 4, title: 'With Checklist', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false,
            checklist: [
                { id: 1, text: 'A', isCompleted: true },
                { id: 2, text: 'B', isCompleted: false },
            ],
        } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        // Check progress bar exists
        const progressBar = container.querySelector('.bg-indigo-500');
        expect(progressBar).toBeTruthy();
        expect(progressBar?.getAttribute('style')).toContain('50%');
    });

    it('uses default color when no subjectColor', () => {
        const lesson = { id: 5, title: 'Default', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false, checklist: [] } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        const stripe = container.querySelector('.absolute.left-0');
        const style = stripe?.getAttribute('style');
        // Check for both hex and rgb formats
        expect(style).toMatch(/background-color:\s*(#4f46e5|rgb\(79,\s*70,\s*229\))/i);
    });

    it('renders with dragging state', () => {
        mockUseDraggable.mockReturnValue({
            setNodeRef: vi.fn(),
            attributes: {},
            listeners: {},
            transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 } as any,
            isDragging: true,
        });
        const lesson = { id: 6, title: 'Dragging', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false, checklist: [] } as any;
        render(<LessonCard lesson={lesson} />);
        expect(screen.getByText('Dragging')).toBeInTheDocument();
        // Reset for other tests
        mockUseDraggable.mockReturnValue({
            setNodeRef: vi.fn(),
            attributes: {},
            listeners: {},
            transform: null,
            isDragging: false,
        });
    });

    it('renders without checklist when empty', () => {
        const lesson = { id: 7, title: 'No CL', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        expect(container.querySelector('.bg-indigo-500')).toBeFalsy(); // No progress bar
    });

    it('renders CheckCircle icon when completed', () => {
        const lesson = { id: 8, title: 'Completed', subjectId: 1, plannedDate: '2026-03-01', isCompleted: true, checklist: [] } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        expect(container.querySelector('svg.text-green-500')).toBeTruthy();
    });
});
