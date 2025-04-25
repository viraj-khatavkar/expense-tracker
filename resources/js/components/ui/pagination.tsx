import { Link } from '@inertiajs/react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export function Pagination({ currentPage, lastPage, links }: PaginationProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    // Skip the "Previous" and "Next" links as we'll handle them separately
                    if (link.label === "&laquo; Previous" || link.label === "Next &raquo;") {
                        return null;
                    }

                    return (
                        <Button
                            key={i}
                            variant={link.active ? "default" : "outline"}
                            className={cn(
                                "h-8 w-8",
                                !link.url && "opacity-50 cursor-not-allowed"
                            )}
                            asChild={link.url ? true : false}
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link href={link.url}>
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Link>
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </Button>
                    );
                })}
            </div>

            <div className="text-sm text-gray-500">
                Page {currentPage} of {lastPage}
            </div>
        </div>
    );
}
