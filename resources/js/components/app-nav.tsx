import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { Receipt, Tag, BarChart } from 'lucide-react';

export function AppNav() {
    const { url } = usePage();

    const links = [
        {
            href: route('expenses.index'),
            label: 'Expenses',
            icon: Receipt,
        },
        {
            href: route('categories.index'),
            label: 'Categories',
            icon: Tag,
        },
        {
            href: route('reports.index'),
            label: 'Reports',
            icon: BarChart,
        },
    ];

    return (
        <nav className="flex sm:items-center">
            <ul className="flex flex-col sm:flex-row w-full gap-1 sm:gap-6">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                    'flex items-center text-sm font-medium transition-colors hover:text-primary w-full p-2 sm:p-0 rounded-md',
                                    url === link.href
                                        ? 'text-foreground bg-accent sm:bg-transparent'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
