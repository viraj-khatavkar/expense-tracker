import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, Expense } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
    expense: Expense;
    categories: Category[];
}

export default function Edit({ expense, categories }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        amount: expense.amount.toString(),
        description: expense.description,
        category_id: expense.category_id.toString(),
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
    });

    useEffect(() => {
        return () => {
            reset('amount', 'description', 'category_id', 'date');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('expenses.update', expense.id), {
            onSuccess: () => {
                toast.success('Expense updated successfully');
            },
            onError: (errors) => {
                toast.error('Failed to update expense');
                console.error(errors);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Expense" />

            <div className="py-6 sm:py-12">
                <div className="mx-4 sm:mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Expense</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="amount">Amount (₹)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className={`mt-1 w-full ${errors.amount ? 'border-red-500' : ''}`}
                                        disabled={processing}
                                    />
                                    {errors.amount && (
                                        <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={`mt-1 w-full ${errors.description ? 'border-red-500' : ''}`}
                                        disabled={processing}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className={`w-full ${errors.category_id ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className={`mt-1 w-full ${errors.date ? 'border-red-500' : ''}`}
                                        disabled={processing}
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing ? 'Updating...' : 'Update Expense'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
