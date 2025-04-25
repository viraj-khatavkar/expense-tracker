import { formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Expense {
    id: number;
    amount: number;
    description: string;
    date: string;
    category: {
        name: string;
    };
}

interface Props {
    expenses: {
        data: Expense[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

export default function Index({ expenses }: Props) {
    return (
        <AppLayout>
            <Head title="Expenses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Expenses</CardTitle>
                            <Button asChild size="sm">
                                <Link href={route('expenses.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Expense
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">Date</TableHead>
                                        <TableHead className="min-w-[200px]">Description</TableHead>
                                        <TableHead className="min-w-[150px]">Category</TableHead>
                                        <TableHead className="min-w-[150px] text-right">Amount</TableHead>
                                        <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.data.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{formatDate(expense.date)}</TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>{expense.category.name}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(expense.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" asChild size="sm">
                                                    <Link href={route('expenses.edit', expense.id)}>Edit</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4">
                                <Pagination
                                    currentPage={expenses.current_page}
                                    lastPage={expenses.last_page}
                                    links={expenses.links}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
