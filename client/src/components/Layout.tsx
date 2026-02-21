import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, GraduationCap, BarChart, BookOpen, ClipboardList, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/courses', label: 'Courses', icon: GraduationCap },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/templates', label: 'Templates', icon: ClipboardList },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/results', label: 'Results', icon: GraduationCap },
    { path: '/analytics', label: 'Analytics', icon: BarChart },
];

const THEME_STORAGE_KEY = 'study-tracker-theme';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

export default function Layout() {
    const location = useLocation();
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    const isDark = theme === 'dark';

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col dark:bg-slate-900 dark:border-slate-800">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
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
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="md:hidden p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6" />
                        StudyTracker
                    </h1>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
