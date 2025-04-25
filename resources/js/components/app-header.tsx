import { AppNav } from './app-nav';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function AppHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex w-full items-center justify-between">
                    <a className="flex items-center space-x-2 pl-4" href="/">
                        <span className="text-lg font-semibold">Expense Tracker</span>
                    </a>
                    <div className="hidden sm:block">
                        <AppNav />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="sm:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <div
                className={cn(
                    'sm:hidden border-b bg-background',
                    isOpen ? 'block' : 'hidden'
                )}
            >
                <div className="container py-4">
                    <AppNav />
                </div>
            </div>
        </header>
    );
}
