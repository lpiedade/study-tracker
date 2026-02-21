import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../src/components/Layout';
import userEvent from '@testing-library/user-event';

describe('Layout', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = '';
    });

    it('renders the app title', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Layout />
            </MemoryRouter>
        );
        expect(screen.getAllByText('StudyTracker').length).toBeGreaterThan(0);
    });

    it('renders all navigation items', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Layout />
            </MemoryRouter>
        );
        const navLabels = ['Dashboard', 'Calendar', 'Courses', 'Subjects', 'Templates', 'Planner', 'Results', 'Analytics'];
        navLabels.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });

    it('applies active class to current route', () => {
        render(
            <MemoryRouter initialEntries={['/subjects']}>
                <Layout />
            </MemoryRouter>
        );
        const subjectsLink = screen.getByText('Subjects').closest('a');
        expect(subjectsLink?.className).toContain('bg-indigo-50');
    });

    it('does not apply active class to non-current route', () => {
        render(
            <MemoryRouter initialEntries={['/subjects']}>
                <Layout />
            </MemoryRouter>
        );
        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink?.className).not.toContain('bg-indigo-50');
    });

    it('initializes dark mode from saved preference', () => {
        localStorage.setItem('study-tracker-theme', 'dark');
        render(
            <MemoryRouter initialEntries={['/']}>
                <Layout />
            </MemoryRouter>
        );

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('toggles theme and persists the selected preference', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/']}>
                <Layout />
            </MemoryRouter>
        );

        const toggleButton = screen.getAllByRole('button', { name: 'Switch to dark mode' })[0];
        await user.click(toggleButton);

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('study-tracker-theme')).toBe('dark');
    });
});
