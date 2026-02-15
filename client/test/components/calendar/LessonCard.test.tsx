import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonCard from '../../../src/components/calendar/LessonCard';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    useDraggable: () => ({
        setNodeRef: vi.fn(),
        attributes: {},
        listeners: {},
        transform: null,
        isDragging: false,
    }),
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
        // Should render AlertCircle icon for missed
        expect(container.querySelector('.lucide-alert-circle')).toBeTruthy();
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
        expect(stripe?.getAttribute('style')).toContain('#4f46e5');
    });

    it('renders with dragging state', () => {
        // Override mock to return isDragging = true
        vi.mocked(vi.fn()).mockReturnValue({
            setNodeRef: vi.fn(),
            attributes: {},
            listeners: {},
            transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
            isDragging: true,
        });
        const lesson = { id: 6, title: 'Dragging', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false, checklist: [] } as any;
        render(<LessonCard lesson={lesson} />);
        expect(screen.getByText('Dragging')).toBeInTheDocument();
    });

    it('renders without checklist when empty', () => {
        const lesson = { id: 7, title: 'No CL', subjectId: 1, plannedDate: '2026-03-01', isCompleted: false } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        expect(container.querySelector('.bg-indigo-500')).toBeFalsy(); // No progress bar
    });

    it('renders CheckCircle icon when completed', () => {
        const lesson = { id: 8, title: 'Completed', subjectId: 1, plannedDate: '2026-03-01', isCompleted: true, checklist: [] } as any;
        const { container } = render(<LessonCard lesson={lesson} />);
        expect(container.querySelector('.lucide-check-circle')).toBeTruthy();
    });
});
