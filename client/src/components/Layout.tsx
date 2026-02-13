import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, GraduationCap, BarChart, BookOpen, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/templates', label: 'Templates', icon: ClipboardList },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/results', label: 'Results', icon: GraduationCap },
    { path: '/analytics', label: 'Analytics', icon: BarChart },
];

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                        <GraduationCap className="w-8 h-8" />
                        StudyTracker
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
