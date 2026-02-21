import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeekView from '../../../src/components/calendar/WeekView';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
    useDraggable: () => ({ setNodeRef: vi.fn(), attributes: {}, listeners: {}, transform: null, isDragging: false }),
}));

describe('WeekView', () => {
    const defaultProps = {
        currentDate: new Date(2026, 1, 18), // Wednesday Feb 18 2026
        lessons: [] as any[],
        subjects: [{ id: 1, name: 'Math', color: '#ff0000' }],
        onDayClick: vi.fn(),
    };

    it('renders 7 days of the week', () => {
        const { container } = render(<WeekView {...defaultProps} />);
        // Should have 7 day columns
        const dayHeaders = container.querySelectorAll('.text-sm.font-medium.text-gray-500.uppercase');
        expect(dayHeaders.length).toBe(7);
    });

    it('shows "No plans" text for empty days', () => {
        render(<WeekView {...defaultProps} />);
        const noPlanElements = screen.getAllByText('No plans');
        expect(noPlanElements.length).toBe(7);
    });

    it('renders lessons on their correct day', () => {
        const props = {
            ...defaultProps,
            lessons: [
                { id: 1, title: 'Week Lesson', subjectId: 1, plannedDate: '2026-02-18', isCompleted: false, checklist: [] },
            ],
        };
        render(<WeekView {...props} />);
        expect(screen.getByText('Week Lesson')).toBeInTheDocument();
    });

    it('shows planned hours when lessons exist', () => {
        const props = {
            ...defaultProps,
            lessons: [
                { id: 1, title: 'L1', subjectId: 1, plannedDate: '2026-02-18', isCompleted: false, checklist: [] },
                { id: 2, title: 'L2', subjectId: 1, plannedDate: '2026-02-18', isCompleted: false, checklist: [] },
            ],
        };
        render(<WeekView {...props} />);
        expect(screen.getByText('2h Planned')).toBeInTheDocument();
    });

    it('calls onDayClick when day header is clicked', () => {
        const onDayClick = vi.fn();
        const { container } = render(<WeekView {...defaultProps} onDayClick={onDayClick} />);
        const dayHeader = container.querySelector('.cursor-pointer');
        dayHeader?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(onDayClick).toHaveBeenCalled();
    });
});
