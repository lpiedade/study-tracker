import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarHeader from '../../../src/components/calendar/CalendarHeader';

describe('CalendarHeader', () => {
    const defaultProps = {
        currentDate: new Date(2026, 1, 15), // Feb 15, 2026
        view: 'week' as const,
        onViewChange: vi.fn(),
        onNavigate: vi.fn(),
        subjects: [
            { id: 1, name: 'Math', color: '#ff0000' },
            { id: 2, name: 'Physics', color: '#0000ff' },
        ],
    };

    it('renders current month and year', () => {
        render(<CalendarHeader {...defaultProps} />);
        expect(screen.getByText('February 2026')).toBeInTheDocument();
    });

    it('renders Today button', () => {
        render(<CalendarHeader {...defaultProps} />);
        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('renders view toggle buttons', () => {
        render(<CalendarHeader {...defaultProps} />);
        expect(screen.getByText('Week')).toBeInTheDocument();
        expect(screen.getByText('Month')).toBeInTheDocument();
    });

    it('renders subject legend', () => {
        render(<CalendarHeader {...defaultProps} />);
        expect(screen.getByText('Math')).toBeInTheDocument();
        expect(screen.getByText('Physics')).toBeInTheDocument();
    });

    it('calls onNavigate with today when Today is clicked', () => {
        const onNavigate = vi.fn();
        render(<CalendarHeader {...defaultProps} onNavigate={onNavigate} />);
        fireEvent.click(screen.getByText('Today'));
        expect(onNavigate).toHaveBeenCalledWith('today');
    });

    it('calls onNavigate with prev when prev button is clicked', () => {
        const onNavigate = vi.fn();
        const { container } = render(<CalendarHeader {...defaultProps} onNavigate={onNavigate} />);
        // prev button has ChevronLeft icon
        const buttons = container.querySelectorAll('button');
        const prevBtn = Array.from(buttons).find(b => b.querySelector('.lucide-chevron-left'));
        prevBtn?.click();
        expect(onNavigate).toHaveBeenCalledWith('prev');
    });

    it('calls onNavigate with next when next button is clicked', () => {
        const onNavigate = vi.fn();
        const { container } = render(<CalendarHeader {...defaultProps} onNavigate={onNavigate} />);
        const buttons = container.querySelectorAll('button');
        const nextBtn = Array.from(buttons).find(b => b.querySelector('.lucide-chevron-right'));
        nextBtn?.click();
        expect(onNavigate).toHaveBeenCalledWith('next');
    });

    it('calls onViewChange when Month tab clicked', () => {
        const onViewChange = vi.fn();
        render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />);
        fireEvent.click(screen.getByText('Month'));
        expect(onViewChange).toHaveBeenCalledWith('month');
    });

    it('calls onViewChange when Week tab clicked from month view', () => {
        const onViewChange = vi.fn();
        render(<CalendarHeader {...defaultProps} view="month" onViewChange={onViewChange} />);
        fireEvent.click(screen.getByText('Week'));
        expect(onViewChange).toHaveBeenCalledWith('week');
    });

    it('highlights active view for week', () => {
        render(<CalendarHeader {...defaultProps} view="week" />);
        const weekBtn = screen.getByText('Week').closest('button');
        expect(weekBtn?.className).toContain('text-indigo-600');
    });

    it('highlights active view for month', () => {
        render(<CalendarHeader {...defaultProps} view="month" />);
        const monthBtn = screen.getByText('Month').closest('button');
        expect(monthBtn?.className).toContain('text-indigo-600');
    });

    it('renders empty subjects legend', () => {
        render(<CalendarHeader {...defaultProps} subjects={[]} />);
        // Should still render the header, just no legend items
        expect(screen.getByText('Today')).toBeInTheDocument();
    });
});
