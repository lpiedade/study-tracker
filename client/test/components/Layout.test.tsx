import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

describe('Layout', () => {
    it('renders the app title', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Layout />
            </MemoryRouter>
        );
        expect(screen.getByText('StudyTracker')).toBeInTheDocument();
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
});
